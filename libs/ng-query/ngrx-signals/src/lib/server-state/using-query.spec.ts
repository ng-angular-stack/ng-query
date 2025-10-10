import { Expect, Equal } from 'test-type';
import { withState } from '@ngrx/signals';
import {
  ApplicationRef,
  inject,
  ResourceRef,
  ResourceStreamItem,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectTypeOf, vi } from 'vitest';
import { usingQuery } from './using-query';
import { query } from '../query';
import { serverState, ServerStateFactory } from './server-state';
import { usingMutation } from './using-mutation';
import { usingMutationById } from './using-mutation-by-id';
import { mutation } from '../mutation';
import { mutationById } from '../mutation-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('usingQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a query resource', () => {
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

    expect(store.userQuery).toBeDefined();
  });

  it('2- should have idle state when query params are undefined', () => {
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

    expect(store.userQuery.status()).toBe('idle');
  });

  it('3 should have loading state when query params are defined', () => {
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

    expect(store.userQuery.status()).toBe('loading');
  });

  it('4 should have resolved status when loader completes successfully', async () => {
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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
});

describe('Declarative server state, usingQuery and usingMutation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- usingQuery should handle optimistic updates', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
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
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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

  it('2- usingQuery should reload on mutation error', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
          on: {
            userEmailMutation: {
              reload: {
                onMutationError: true,
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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
  it('3- usingQuery should reload on mutation error if mutation params id is "error"', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
          on: {
            userEmailMutation: {
              reload: {
                onMutationError: ({ mutationParams }) =>
                  mutationParams.id === 'error',
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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

  it('4- usingQuery should handle optimisticPatch', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
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
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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

  it('5- Should handle usingMutationById reactions effect', async () => {
    const returnedUser = (id: string) => ({
      id: `${id}`,
      name: 'John Doe',
      email: 'test@a.com',
    });
    const { ServerState } = serverState(
      usingMutationById('user', () =>
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
      usingQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
              return returnedUser(params);
            },
          }),
        {
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
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState, ApplicationRef],
    });
    const store = TestBed.inject(ServerState);
    const userQuery = store.userQuery;
    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual(returnedUser('5'));
    const userQuery5ReloadSpy = vi.spyOn(userQuery!, 'reload');
    store.mutateUserById({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();
    expect(userQuery5ReloadSpy.mock.calls.length).toBe(2);
    vi.restoreAllMocks();
  });

  it('6- usingQuery should handle updates', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
          on: {
            userEmailMutation: {
              update: ({ queryResource, mutationParams }) => {
                console.log('update queryResource', !!queryResource);
                return {
                  ...queryResource.value(),
                  email: mutationParams.email,
                };
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('resolved');
    console.log('mutateUserEmail');
    store.mutateUserEmail({
      id: '5',
      email: 'mutated@test.com',
    });
    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toBe('local');
    expect(store.userQuery.value().email).toBe('mutated@test.com');
  });
  it('7- usingQuery should handle patch', async () => {
    const { ServerState } = serverState(
      usingMutation('userEmail', () =>
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
      usingQuery(
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
        {
          on: {
            userEmailMutation: {
              patch: {
                email: ({ mutationParams }) => {
                  console.log('mutationParams', mutationParams);
                  return mutationParams?.email;
                },
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState],
    });
    const store = TestBed.inject(ServerState);

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
  it('8- Should handle usingMutationById update', async () => {
    const returnedUser = (id: string) => ({
      id: `${id}`,
      name: 'John Doe',
      email: 'test@a.com',
    });
    const { ServerState } = serverState(
      usingMutationById('user', () =>
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
      usingQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
              return returnedUser(params);
            },
          }),
        {
          on: {
            userMutationById: {
              filter: ({ mutationIdentifier, queryResource }) =>
                queryResource.hasValue()
                  ? queryResource.value().id === mutationIdentifier
                  : false,
              update: ({ queryResource, mutationResource }) => {
                return {
                  ...queryResource.value(),
                  ...mutationResource.value(),
                };
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState, ApplicationRef],
    });
    const store = TestBed.inject(ServerState);
    const userQuery = store.userQuery;
    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual(returnedUser('5'));
    store.mutateUserById({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    vi.restoreAllMocks();
  });
  it('9- Should handle usingMutationById patch', async () => {
    const returnedUser = (id: string) => ({
      id: `${id}`,
      name: 'John Doe',
      email: 'test@a.com',
    });
    const { ServerState } = serverState(
      usingMutationById('user', () =>
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
      usingQuery(
        'user',
        () =>
          query({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10000);
              return returnedUser(params);
            },
          }),
        {
          on: {
            userMutationById: {
              filter: ({ mutationIdentifier, queryResource }) =>
                queryResource.hasValue()
                  ? queryResource.value().id === mutationIdentifier
                  : false,
              patch: {
                email: ({ mutationResource }) => mutationResource.value().email,
              },
            },
          },
        }
      )
    );

    TestBed.configureTestingModule({
      providers: [ServerState, ApplicationRef],
    });
    const store = TestBed.inject(ServerState);
    const userQuery = store.userQuery;
    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual(returnedUser('5'));
    store.mutateUserById({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();
    expect(userQuery?.value()).toEqual({
      id: '5',
      name: 'John Doe',
      email: 'updated.doe@example.com',
    });
    vi.restoreAllMocks();
  });

  it('should accept an Insertions output, that appear in the store', () => {
    const { ServerState } = serverState(
      usingQuery('user', () =>
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
      ),
      {
        providedIn: 'root',
      }
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(ServerState);
      expectTypeOf(store.userQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQuery.pagination).toBeDefined();
    });
  });
});

// Typing test👇

type InferServerStateFeatureReturnedType<
  T extends ServerStateFactory<[any], any>
> = T extends ServerStateFactory<any, infer R> ? R : never;

describe('usingQuery typing', () => {
  it('Should be well typed', () => {
    const queryByIdTest = usingQuery('user', () =>
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
    type ResultType = InferServerStateFeatureReturnedType<typeof queryByIdTest>;
    type PropsKeys = keyof ResultType['props'];

    type _ExpectTheResourceNameAndQueriesTypeRecord = Expect<
      Equal<PropsKeys, 'userQuery'>
    >;

    type _ExpectThePropsToHaveARecordWithResourceRef = Expect<
      Equal<ResultType['props']['userQuery'], ResourceRef<User>>
    >;

    type _ExpectThePropsToHaveARecordusingQueryNameAndHistype = Expect<
      Equal<
        ResultType['props'],
        {
          userQuery: ResourceRef<
            NoInfer<{
              id: string;
              name: string;
              email: string;
            }>
          >;
        }
      >
    >;
  });

  it('Should react to mutation changes', async () => {
    const { injectServerState } = serverState(
      usingMutation('userName', () =>
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
      usingMutation('userEmail', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: 'er@d',
              lol: 5,
            } satisfies User & { lol: number };
          },
        })
      ),
      usingMutation('userTest', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: 'er@d',
              lol: 5,
            } satisfies User & { lol: number };
          },
        })
      ),
      usingQuery(
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
        {
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
        }
      )
    );
    const result = injectServerState();
    result.mutateUserEmail('newEmail');
    result.mutateUserName('newName');
    result.mutateUserTest('newName');
  });
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
