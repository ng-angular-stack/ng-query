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
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a query resource', () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          loader: async ({ params }) => {
            return {
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            };
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
          loader: async ({ params }) => {
            return {
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            };
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
          loader: async ({ params }) => {
            await wait(10);
            return {
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            };
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

  it('4 should have resolved status when loader completes successfully', async () => {
    const Store = signalStore(
      withQuery('user', () =>
        query({
          params: () => '5',
          loader: async ({ params }) => {
            await wait(1000);
            return {
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            };
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
    await vi.runAllTimersAsync();

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
            type _StreamResponseTypeRetrieved = Expect<
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

            await wait(50);

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

    expect(store.userQuery.value()).toEqual(undefined);
    expect(store.userQuery.status()).toEqual('loading');
    await vi.advanceTimersByTimeAsync(100);

    expect(store.userQuery.status()).toEqual('resolved');
    expect(store.userQuery.value()).toEqual({
      count: 5,
    });

    await vi.advanceTimersByTimeAsync(100);

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
              await wait(10000);
              console.log('newUser', newUser);
              return newUser;
            },
          }),
        () => ({
          associatedClientState: {
            user: true,
            userSelected: ({ queryResource }) => {
              type _ExpectQueryResourceToBeTyped = Expect<
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

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toEqual('resolved');
    expect(store.user()).toEqual(newUser);
    expect(store.userSelected()).toEqual({
      id: newUser.id,
    });
  });
});

describe('Declarative server state, withQuery and withMutation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- withQuery should handle optimistic updates', async () => {
    const Store = signalStore(
      withMutation('userEmail', () =>
        mutation({
          method: ({ id, email }: { id: string; email: string }) => ({
            id,
            email,
          }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: params.email,
            } satisfies User;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type _StreamResponseTypeRetrieved = Expect<
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

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await vi.runAllTimersAsync();
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
          loader: async ({ params }) => {
            throw new Error('Error during mutation');
            return {
              id: params.id,
              name: 'Updated Name',
              email: params.email,
            } satisfies User;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type _StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              await wait(10000);
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

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await vi.advanceTimersByTimeAsync(2000);
    expect(store.userEmailMutation.status()).toBe('error');
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
          loader: async ({ params }) => {
            await wait(1000);
            console.log('b reject');
            await Promise.reject(new Error('Error during mutation'));
            console.log('a reject');

            return {
              id: params.id,
              name: 'Updated Name',
              email: params.email,
            } satisfies User;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              type _StreamResponseTypeRetrieved = Expect<
                Equal<typeof params, string>
              >;
              await wait(10000);
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

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await vi.advanceTimersByTimeAsync(5000);
    expect(store.userEmailMutation.status()).toBe('error');
    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');

    store.mutateUserEmail({
      id: 'error',
      email: 'mutated@test.com',
    });
    await vi.advanceTimersByTimeAsync(2000);
    expect(store.userEmailMutation.status()).toBe('error');
    await vi.advanceTimersByTimeAsync(2000);
    expect(store.userQuery.status()).toBe('reloading');
    await vi.runAllTimersAsync();
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
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: params.email,
            } satisfies User;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
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

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');
    console.log('will mutate');
    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('local');
    expect(store.userQuery.value().email).toBe('mutated@test.com');
  });

  it('5- Should handle withMutationById reactions effect', async () => {
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
          loader: async ({ params }) => {
            await wait(1000);
            return params;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
              return returnedUser(params);
            },
          }),
        () => ({
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

  it('should accept an Insertions output, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQuery('user', () =>
        query(
          {
            params: () => '5',
            loader: async ({ params }) => {
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              } satisfies User;
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
        loader: async ({ params }) => {
          return {
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          } satisfies User;
        },
      })
    );
    type ResultType = InferSignalStoreFeatureReturnedType<typeof queryByIdTest>;
    type PropsKeys = keyof ResultType['props'];

    type _ExpectTheResourceNameAndQueriesTypeRecord = Expect<
      Equal<PropsKeys, 'userQuery' | '__query'>
    >;

    type _ExpectThePropsToHaveARecordWithResourceRef = Expect<
      Equal<ResultType['props']['userQuery'], ResourceRef<User>>
    >;

    type _ExpectThePropsToHaveARecordWithQueryNameAndHistype = Expect<
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
            loader: async ({ params }) => {
              type _ExpectParamsToBeTyped = Expect<
                Equal<
                  typeof params,
                  {
                    id: string;
                  }
                >
              >;
              return <User>{
                id: 'params.id',
                name: 'John Doe',
                email: 'test@a.com',
              };
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
          loader: async ({ params }) => {
            return [
              {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              },
            ] satisfies User[];
          },
        })
      )
    );

    type ResultTypeMultiplesQuery = InferSignalStoreFeatureReturnedType<
      typeof multiplesWithQuery
    >;

    type _ExpectThePropsToHaveARecordWithMultipleQueryNameAndHistype = Expect<
      Equal<
        keyof ResultTypeMultiplesQuery['props']['__query'],
        'userDetails' | 'users'
      >
    >;
  });

  it('clientStatePath option should infer signalStore state path', () => {
    const _queryByIdTest = signalStore(
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
            loader: async () => {
              return <Omit<User, 'id'>>{
                name: 'John Doe',
                email: 'test@a.com',
              };
            },
          }),
        () => ({
          associatedClientState: {
            user: ({ queryParams, queryResource }) => {
              type _ExpectQueryParamsToBeTyped = Expect<
                Equal<typeof queryParams, { id: string }>
              >;
              type _ExpectQueryResourceToBeTyped = Expect<
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
    const _Store = signalStore(
      withMutation('userName', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: 'er@d',
            } satisfies User;
          },
        })
      ),
      withMutation('userEmail', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: 'er@d',
            } satisfies User;
          },
        })
      ),
      withQuery(
        'user',
        () =>
          query({
            params: () => ({ id: '5' }),
            loader: async ({ params }) => {
              return {
                id: params.id,
                name: 'John Doe',
                email: '',
              } satisfies User;
            },
          }),
        () => ({
          on: {
            userNameMutation: {
              optimisticUpdate: ({
                queryResource,
                mutationResource: _mutationResource,
                mutationParams: _mutationParams,
              }) => {
                type _ExpectQueryResourceToBeTyped = Expect<
                  Equal<typeof queryResource, ResourceRef<User>>
                >;
                type _ExpectMutationParamsToBeTyped = Expect<
                  Equal<typeof _mutationParams, { id: string }>
                >;
                type _ExpectMutationResourceToBeTyped = Expect<
                  Equal<typeof _mutationResource, ResourceRef<User>>
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
                  type _ExpectQueryResourceToBeTyped = Expect<
                    Equal<typeof queryResource, ResourceRef<User>>
                  >;
                  type _ExpectMutationParamsToBeTyped = Expect<
                    Equal<typeof mutationParams, { id: string }>
                  >;
                  type _ExpectMutationResourceToBeTyped = Expect<
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
                  type _ExpectQueryResourceToBeTyped = Expect<
                    Equal<typeof queryResource, ResourceRef<User>>
                  >;
                  type _ExpectMutationParamsToBeTyped = Expect<
                    Equal<typeof mutationParams, { id: string }>
                  >;
                  type _ExpectMutationResourceToBeTyped = Expect<
                    Equal<typeof mutationResource, ResourceRef<User>>
                  >;
                  type _ExpectTargetedStateToBeTyped = Expect<
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
