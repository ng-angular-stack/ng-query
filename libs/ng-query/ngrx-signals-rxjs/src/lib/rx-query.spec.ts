import { delay, lastValueFrom, map, of } from 'rxjs';
import {
  signalStore,
  signalStoreFeature,
  SignalStoreFeature,
  withState,
} from '@ngrx/signals';
import { ResourceRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { rxQuery } from './rx-query';
import { Expect, Equal } from 'test-type';
import { withQuery, withMutation, mutation } from '@ng-query/ngrx-signals';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('rxQuery', () => {
  it('1- should accept signal param as source', () => {
    TestBed.runInInjectionContext(() => {
      const queryRef = rxQuery({
        params: () => '5',
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(queryRef).toBeDefined();
      const queryResult = queryRef({} as any, {} as any);
      expect(queryResult.queryRef).toBeDefined();
      expect(queryResult.queryRef.resource).toBeDefined();
      expect(queryResult.queryRef.resourceParamsSrc).toBeDefined();
      expect(queryResult.queryRef.resourceParamsSrc()).toEqual('5');
      expect(queryResult.__types).toBeDefined();
    });
  });
  it('2- should accept observable param as source', () => {
    TestBed.runInInjectionContext(() => {
      const queryRef = rxQuery({
        params$: of('5'),
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(queryRef).toBeDefined();
      const queryResult = queryRef({} as any, {} as any);
      expect(queryResult.queryRef).toBeDefined();
      expect(queryResult.queryRef.resource).toBeDefined();
      expect(queryResult.queryRef.resourceParamsSrc).toBeDefined();
      expect(queryResult.queryRef.resourceParamsSrc()).toEqual('5');
      expect(queryResult.__types).toBeDefined();
    });
  });
});

describe('withQuery using rxQuery', () => {
  it('1- Should expose a query resource', () => {
    const Store = signalStore(
      withQuery('user', () =>
        rxQuery({
          params: () => '5',
          stream: ({ params }) => {
            return of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            });
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userQuery).toBeDefined();
  });

  describe('rxQuery extended output', () => {
    it('should accept an extended output, that appear in the store', () => {
      const Store = signalStore(
        {
          providedIn: 'root',
        },
        signalStoreFeature(
          withState({}),
          withQuery('user', () =>
            rxQuery(
              {
                params: () => '5',
                stream: ({ params }) => {
                  return of({
                    id: params,
                    name: 'John Doe',
                    email: 'test@a.com',
                  });
                },
              },
              () => ({
                pagination: {
                  page: 1,
                },
              })
            )
          )
        )
      );
      TestBed.runInInjectionContext(() => {
        const store = TestBed.inject(Store);
        expect(store.userQuery.pagination).toEqual({ page: 1 });
        expect(store.userQuery.pagination).toBeDefined();
      });
    });
  });
});

describe('Declarative server state, withQuery using rxQuery and withMutation', () => {
  it('1- withQuery should handle optimistic updates', async () => {
    const Store = signalStore(
      withMutation('userEmail', () =>
        mutation({
          method: ({ id, email }: { id: string; email: string }) => ({
            id,
            email,
          }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: params.email,
              } satisfies User)
            );
          },
        })
      ),
      withQuery(
        'user',
        () =>
          rxQuery({
            params: () => '5',
            stream: ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              });
            },
          }),
        () => ({
          on: {
            userEmailMutation: {
              optimisticUpdate: ({ queryResource, mutationParams }) => {
                console.log('queryResource.value()', queryResource.value());
                console.log('mutationParams', mutationParams);
                return {
                  ...queryResource.value(),
                  email: mutationParams.email,
                };
              },
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    await wait(30);
    console.log('store.userQuery.status()', store.userQuery.status());
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await wait(30);
    expect(store.userQuery.status()).toBe('local');
    expect(store.userQuery.value().email).toBe('mutated@test.com');
  });

  it('2- withQuery should reload on mutation error', async () => {
    const Store = signalStore(
      withMutation('userEmail', () =>
        mutation({
          method: ({ id, email }: { id: string; email: string }) => ({
            id,
            email,
          }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: params.email,
              } satisfies User).pipe(
                map((data) => {
                  throw new Error('Error during mutation');
                  return data;
                })
              )
            );
          },
        })
      ),
      withQuery(
        'user',
        () =>
          rxQuery({
            params: () => '5',
            stream: ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              }).pipe(delay(10));
            },
          }),
        () => ({
          on: {
            userEmailMutation: {
              reload: {
                onMutationError: true,
              },
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    await wait(20);
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await wait(1);
    expect(store.userEmailMutation.status()).toBe('error');
    await wait(1);
    expect(store.userQuery.status()).toBe('reloading');
  });
  it('3- withQuery should reload on mutation error if mutation params id is "error"', async () => {
    const Store = signalStore(
      withMutation('userEmail', () =>
        mutation({
          method: ({ id, email }: { id: string; email: string }) => ({
            id,
            email,
          }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: params.email,
              } satisfies User).pipe(
                map((data) => {
                  throw new Error('Error during mutation');
                  return data;
                })
              )
            );
          },
        })
      ),
      withQuery(
        'user',
        () =>
          rxQuery({
            params: () => '5',
            stream: ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              }).pipe(delay(10));
            },
          }),
        () => ({
          on: {
            userEmailMutation: {
              reload: {
                onMutationError: ({ mutationParams }) =>
                  mutationParams.id === 'error',
              },
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    await wait(30);
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await wait(1);
    expect(store.userEmailMutation.status()).toBe('error');
    await wait(1);
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: 'error',
      email: 'mutated@test.com',
    });
    await wait(1);
    expect(store.userEmailMutation.status()).toBe('error');
    await wait(1);
    expect(store.userQuery.status()).toBe('reloading');
    await wait(100);
    expect(store.userQuery.status()).toBe('resolved');
  });

  it('4- withQuery should handle optimisticPatch', async () => {
    const Store = signalStore(
      withMutation('userEmail', () =>
        mutation({
          method: ({ id, email }: { id: string; email: string }) => ({
            id,
            email,
          }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: params.email,
              } satisfies User)
            );
          },
        })
      ),
      withQuery(
        'user',
        () =>
          rxQuery({
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              }).pipe(delay(10));
            },
          }),
        () => ({
          on: {
            userEmailMutation: {
              optimisticPatch: {
                email: ({ mutationParams }) => {
                  console.log('mutationParams', mutationParams);
                  return mutationParams?.email;
                },
              },
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    await wait(30);
    expect(store.userQuery.status()).toBe('resolved');
    console.log('will mutate');
    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    console.log('mutated');

    await wait(3);
    console.log('store.userQuery.status()', store.userQuery.status());
    expect(store.userQuery.status()).toBe('local');
    console.log('store.userQuery.value().email', store.userQuery.value().email);
    expect(store.userQuery.value().email).toBe('mutated@test.com');
  });
});

// Typing test👇

type InferSignalStoreFeatureReturnedType<
  T extends SignalStoreFeature<any, any>
> = T extends SignalStoreFeature<any, infer R> ? R : never;

describe('withQuery typing', () => {
  it('Should be well typed', () => {
    const queryByIdTest = withQuery('user', () =>
      rxQuery({
        params: () => '5',
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          } satisfies User).pipe(delay(10));
        },
      })
    );
    type ResultType = InferSignalStoreFeatureReturnedType<typeof queryByIdTest>;
    type PropsKeys = keyof ResultType['props'];

    type ExpectTheResourceNameAndQueriesTypeRecord = Expect<
      Equal<PropsKeys, 'userQuery' | '__query'>
    >;

    type ExpectThePropsToHaveARecordWithResourceRef = Expect<
      Equal<ResultType['props']['userQuery'], ResourceRef<User>>
    >;

    type ExpectThePropsToHaveARecordWithQueryNameAndHisType = Expect<
      Equal<
        ResultType['props']['__query'],
        {
          user: {
            state: User;
            params: string;
            args: unknown;
            isGroupedResource: false;
            groupIdentifier: unknown;
          };
        }
      >
    >;
    // todo check if it can be merged

    const multiplesWithQuery = signalStoreFeature(
      withState({
        userSelected: {
          id: '5',
        },
        user: undefined as User | undefined,
        test: 3,
      }),
      withQuery(
        'userDetails',
        (store) =>
          rxQuery({
            params: store.userSelected,
            stream: ({ params }) => {
              type ExpectParamsToBeTyped = Expect<
                Equal<
                  typeof params,
                  {
                    id: string;
                  }
                >
              >;
              return of<User>({
                id: 'params.id',
                name: 'John Doe',
                email: 'test@a.com',
              });
            },
          }),
        (store) => ({
          associatedClientState: {
            user: true,
          },
        })
      ),
      withQuery('users', (store) =>
        rxQuery({
          params: () => '5',
          stream: ({ params }) => {
            return of([
              {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              },
            ] satisfies User[]);
          },
        })
      )
    );

    type ResultTypeMultiplesQuery = InferSignalStoreFeatureReturnedType<
      typeof multiplesWithQuery
    >;

    type ExpectThePropsToHaveARecordWithMultipleQueryNameAndHisType = Expect<
      Equal<
        keyof ResultTypeMultiplesQuery['props']['__query'],
        'userDetails' | 'users'
      >
    >;
  });

  it('clientStatePath option should infer signalStore state path', () => {
    const queryByIdTest = signalStore(
      withState({
        pagination: {
          page: 1,
          pageSize: 10,
          filters: {
            search: '',
            sort: '',
            order: 'asc',
          },
        },
        selectedUserId: undefined,
        user: undefined as User | undefined,
      }),
      withQuery(
        'userQuery',
        () =>
          rxQuery({
            params: () => ({
              id: '5',
            }),
            stream: ({ params }) => {
              return of<Omit<User, 'id'>>({
                name: 'John Doe',
                email: 'test@a.com',
              });
            },
          }),
        () => ({
          associatedClientState: {
            user: ({ queryParams, queryResource }) => {
              type ExpectQueryParamsToBeTyped = Expect<
                Equal<typeof queryParams, { id: string }>
              >;
              type ExpectQueryResourceToBeTyped = Expect<
                Equal<typeof queryResource, ResourceRef<Omit<User, 'id'>>>
              >;
              return {
                id: queryParams.id,
                ...queryResource.value(),
              };
            },
          },
        })
      )
    );
  });

  it('Should react to mutation changes', async () => {
    const Store = signalStore(
      withMutation('userName', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: 'er@d',
              } satisfies User)
            );
          },
        })
      ),
      withMutation('userEmail', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params.id,
                name: 'Updated Name',
                email: 'er@d',
              } satisfies User)
            );
          },
        })
      ),
      withQuery(
        'user',
        () =>
          rxQuery({
            params: () => ({ id: '5' }),
            stream: ({ params }) => {
              return of({
                id: params.id,
                name: 'John Doe',
                email: '',
              } satisfies User);
            },
          }),
        () => ({
          on: {
            userNameMutation: {
              optimisticUpdate: ({
                queryResource,
                mutationResource,
                mutationParams,
              }) => {
                type ExpectQueryResourceToBeTyped = Expect<
                  Equal<typeof queryResource, ResourceRef<User>>
                >;
                type ExpectMutationParamsToBeTyped = Expect<
                  Equal<typeof mutationParams, { id: string }>
                >;
                type ExpectMutationResourceToBeTyped = Expect<
                  Equal<typeof mutationResource, ResourceRef<User>>
                >;
                return queryResource.value();
              },
              reload: {
                onMutationError: true,
                onMutationResolved: true,
                onMutationLoading: ({
                  mutationParams,
                  mutationResource,
                  queryResource,
                }) => {
                  type ExpectQueryResourceToBeTyped = Expect<
                    Equal<typeof queryResource, ResourceRef<User>>
                  >;
                  type ExpectMutationParamsToBeTyped = Expect<
                    Equal<typeof mutationParams, { id: string }>
                  >;
                  type ExpectMutationResourceToBeTyped = Expect<
                    Equal<typeof mutationResource, ResourceRef<User>>
                  >;
                  return true;
                },
              },
              optimisticPatch: {
                name: ({
                  mutationParams,
                  mutationResource,
                  queryResource,
                  targetedState,
                }) => {
                  type ExpectQueryResourceToBeTyped = Expect<
                    Equal<typeof queryResource, ResourceRef<User>>
                  >;
                  type ExpectMutationParamsToBeTyped = Expect<
                    Equal<typeof mutationParams, { id: string }>
                  >;
                  type ExpectMutationResourceToBeTyped = Expect<
                    Equal<typeof mutationResource, ResourceRef<User>>
                  >;
                  type ExpectTargetedStateToBeTyped = Expect<
                    Equal<typeof targetedState, string | undefined>
                  >;
                  return targetedState ?? '';
                },
              },
            },
          },
        })
      )
    );
  });
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
