import { delay, lastValueFrom, map, of } from 'rxjs';
import { Expect, Equal } from 'test-type';
import {
  signalStore,
  signalStoreFeature,
  SignalStoreFeature,
  withState,
} from '@ngrx/signals';
import { withQuery } from './with-query';
import {
  ApplicationRef,
  inject,
  ResourceRef,
  ResourceStreamItem,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withMutation } from './with-mutation';
import { query } from './query';
import { mutation } from './mutation';
import { withMutationById } from './with-mutation-by-id';
import { expectTypeOf, vi } from 'vitest';
import { mutationById } from './mutation-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('withQuery', () => {
  it('1- Should expose a query resource', () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              })
            );
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

  it('2- should have idle state when query params are undefined', () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => undefined,
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              })
            );
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userQuery.status()).toBe('idle');
  });

  it('3 should have loading state when query params are defined', () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              }).pipe(delay(100))
            );
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userQuery.status()).toBe('loading');
  });

  // todo tester avec fakeAsync et withRxQuery

  it('4 should have resolved status when loader completes successfully', async () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          loader: ({ params }) => {
            return lastValueFrom(
              of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              }).pipe(delay(1))
            );
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userQuery.value()).toEqual(undefined);

    // Wait for the query to resolve
    await wait(40);

    expect(store.userQuery.status()).toBe('resolved');
    expect(store.userQuery.value()).toEqual({
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    });
  });

  it('5 should handle query with resource stream', async () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          stream: async ({ params }) => {
            type StreamResponseTypeRetrieved = Expect<
              Equal<typeof params, string>
            >;
            const testSignal = signal<
              ResourceStreamItem<{
                count: number;
              }>
            >({
              value: {
                count: 5,
              },
            });

            // Add a delay of 200ms before returning the response
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Update the value after 300ms
            setTimeout(() => {
              testSignal.set({
                value: {
                  count: 6,
                },
              });
            }, 100);

            return testSignal.asReadonly();
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    //@ts-ignore
    expect(store.userQuery.value()).toEqual(undefined);
    expect(store.userQuery.status()).toEqual('loading');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(store.userQuery.status()).toEqual('resolved');
    expect(store.userQuery.value()).toEqual({
      count: 5,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(store.userQuery.value()).toEqual({
      count: 6,
    });
  });

  it('6 should update associated query states', async () => {
    const newUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withState({
        user: undefined as User | undefined,
        userSelected: undefined as { id: string } | undefined,
      }),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              console.log('newUser', newUser);
              return newUser;
            },
          }),
        () => ({
          associatedClientState: {
            user: true,
            userSelected: ({ queryResource }) => {
              type ExpectQueryResourceToBeTyped = Expect<
                Equal<typeof queryResource, ResourceRef<User>>
              >;
              return {
                id: queryResource.value().id,
              };
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(store.userQuery.status()).toEqual('resolved');
    expect(store.user()).toEqual(newUser);
    expect(store.userSelected()).toEqual({
      id: newUser.id,
    });
  });
});

describe('Declarative server state, withQuery and withMutation', () => {
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
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
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
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              await wait(10);
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
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
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              await wait(10);
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
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
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10);
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
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

  it('5- Should handle withMutationById reactions effect', async () => {
    vi.useFakeTimers();

    const returnedUser = (id: string) => ({
      id: `${id}`,
      name: 'John Doe',
      email: 'test@a.com',
    });
    const Store = signalStore(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withMutationById('user', () =>
        mutationById({
          method(user: User) {
            return user;
          },
          identifier: (params) => params.id,
          loader: ({ params }) =>
            lastValueFrom(of<User>(params).pipe(delay(1000))),
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
              return lastValueFrom(of<User>(returnedUser(params)));
            },
          }),
        (store) => ({
          on: {
            userMutationById: {
              filter: ({ mutationIdentifier, queryResource }) =>
                queryResource.hasValue()
                  ? queryResource.value().id === mutationIdentifier
                  : false,
              reload: {
                onMutationLoading: true,
                onMutationResolved: true,
              },
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    const userQuery = store.userQuery;
    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual(returnedUser('5'));
    const userQuery5ReloadSpy = vi.spyOn(userQuery!, 'reload');
    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();
    expect(userQuery5ReloadSpy.mock.calls.length).toBe(2);
    vi.restoreAllMocks();
  });

  it('should accept an extended output, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQuery('user', () =>
        query(
          {
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(
                of({
                  id: params,
                  name: 'John Doe',
                  email: 'test@a.com',
                } satisfies User)
              );
            },
          },
          (data) => {
            console.log('data', data);
            return {
              pagination: {
                page: 1,
              },
            };
          }
        )
      )
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      expectTypeOf(store.userQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQuery.pagination).toBeDefined();
    });
  });
});

// Typing test👇

type InferSignalStoreFeatureReturnedType<
  T extends SignalStoreFeature<any, any>
> = T extends SignalStoreFeature<any, infer R> ? R : never;

describe('withQuery typing', () => {
  it('Should be well typed', () => {
    const queryByIdTest = withQuery('user', () =>
      query({
        params: () => '5',
        loader: ({ params }) => {
          return lastValueFrom(
            of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            } satisfies User)
          );
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
          query({
            params: store.userSelected,
            loader: ({ params }) => {
              type ExpectParamsToBeTyped = Expect<
                Equal<
                  typeof params,
                  {
                    id: string;
                  }
                >
              >;
              return lastValueFrom(
                of<User>({
                  id: 'params.id',
                  name: 'John Doe',
                  email: 'test@a.com',
                })
              );
            },
          }),
        () => ({
          associatedClientState: {
            user: true,
            'userSelected.id': (queryResource) => '5',
          },
        })
      ),
      withQuery('users', (store) =>
        query({
          params: () => '5',
          loader: ({ params }) => {
            return lastValueFrom(
              of([
                {
                  id: params,
                  name: 'John Doe',
                  email: 'test@a.com',
                },
              ] satisfies User[])
            );
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
          query({
            params: () => ({
              id: '5',
            }),
            loader: ({ params }) => {
              return lastValueFrom(
                of<Omit<User, 'id'>>({
                  name: 'John Doe',
                  email: 'test@a.com',
                })
              );
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
          query({
            params: () => ({ id: '5' }),
            loader: ({ params }) => {
              return lastValueFrom(
                of({
                  id: params.id,
                  name: 'John Doe',
                  email: '',
                } satisfies User)
              );
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
