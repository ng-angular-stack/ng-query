import {
  patchState,
  signalStore,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Expect, Equal } from 'test-type';
import { withQuery } from './with-query';
import { ApplicationRef, ResourceRef, signal } from '@angular/core';
import { withMutation } from './with-mutation';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { withQueryById } from './with-query-by-id';
import { expectTypeOf, vi } from 'vitest';
import { query } from './query';
import { queryById } from './query-by-id';
import { mutation } from './mutation';
import { ResourceByIdRef } from './resource-by-id';

type User = {
  id: string;
  name: string;
  email: string;
  address?: {
    street: string;
  };
};

type InferSignalStoreFeatureReturnedType<
  T extends SignalStoreFeature<any, any>
> = T extends SignalStoreFeature<any, infer R> ? R : never;

describe('withMutation', () => {
  it('#1 The signalStore should expose a mutation resource and mutation method', () => {
    const MutationStore = signalStore(
      withMutation('updateUser', () =>
        mutation({
          method: (id: string) => ({ id }),
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated User',
              email: 'er@d',
            } satisfies User;
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    expect(store.updateUserMutation).toBeDefined();
    expect(store.updateUserMutation.hasValue()).toBe(false);
    expect(store.mutateUpdateUser).toBeDefined();
  });

  it('#2 When the mutation loader is triggered it should update optimistically the associated query value', fakeAsync(() => {
    const MutationStore = signalStore(
      withState({
        userSelected: undefined as { id: string } | undefined,
      }),
      withQuery('user', (store) =>
        query({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(2000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
        })
      ),
      withMutation(
        'user',
        () =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQuery: {
              optimisticUpdate: ({ mutationParams, queryResource }) => ({
                ...(queryResource.hasValue() ? queryResource.value() : {}),
                ...mutationParams,
              }),
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    expect(store.userQuery.hasValue()).toBe(false);
    store.mutateUser({
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
    });
    tick();
    expect(store.userQuery.hasValue()).toBe(true);
    expect(store.userQuery.value()).toEqual({
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
    });
  }));
  it('#3 When the mutation loader is triggered it should reload the associated query when the mutation is resolved', async () => {
    vi.useFakeTimers();
    const MutationStore = signalStore(
      withState({
        userSelected: { id: 'init' } as { id: string } | undefined,
      }),
      withQuery('user', (store) =>
        query({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(5000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
        })
      ),
      withMutation(
        'updateUser',
        () =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              await wait(10000);
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQuery: {
              reload: {
                onMutationResolved: true,
              },
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    await vi.runAllTimersAsync();

    expect(store.userQuery.status()).toEqual('resolved');

    store.mutateUpdateUser({
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
    });

    // Wait for the query to resolve
    await vi.advanceTimersByTimeAsync(3000);

    expect(store.updateUserMutation.status()).toEqual('loading');

    await vi.advanceTimersByTimeAsync(8000);

    expect(store.updateUserMutation.status()).toEqual('resolved');

    expect(store.userQuery.status()).toEqual('reloading');

    await vi.runAllTimersAsync();
    expect(store.userQuery.status()).toEqual('resolved');
    vi.restoreAllMocks();
  });

  it('#4 Should optimistic update the targeted queryById', async () => {
    vi.useFakeTimers();
    const MutationStore = signalStore(
      withState({
        userSelected: undefined as { id: string } | undefined,
      }),
      withMethods((store) => ({
        selectUser: (id: string) => {
          patchState(store, {
            userSelected: { id },
          });
        },
      })),
      withQueryById('user', (store) =>
        queryById({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(2000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
          identifier: (params) => params.id,
        })
      ),
      withMutation(
        'user',
        (store) =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQueryById: {
              optimisticUpdate: ({
                mutationParams,
                queryResource,
                queryIdentifier,
              }) => {
                type ExpectIdentifierToBeString = Expect<
                  Equal<typeof queryIdentifier, string>
                >;
                return {
                  ...(queryResource.hasValue() ? queryResource.value() : {}),
                  ...mutationParams,
                };
              },
              filter: ({
                mutationParams,
                mutationResource,
                queryIdentifier,
                queryResource,
              }) => {
                type ExpectMutationResourceToBeRetrieved = Expect<
                  Equal<typeof mutationResource, ResourceRef<User>>
                >;

                type ExpectQueryResourceToBeRetrieved = Expect<
                  Equal<
                    typeof queryResource,
                    ResourceRef<{
                      id: string;
                      name: string;
                      email: string;
                    }>
                  >
                >;

                type ExpectQueryIdentifierToBeRetrieved = Expect<
                  Equal<typeof queryIdentifier, string>
                >;

                type ExpectMutationParamsToBeRetrieved = Expect<
                  Equal<typeof mutationParams, User>
                >;

                return queryIdentifier === mutationParams.id;
              },
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore, ApplicationRef],
    });
    const store = TestBed.inject(MutationStore);
    store.selectUser('1');
    await vi.runAllTimersAsync();

    const user1Query = store.userQueryById()['1'];
    expect(user1Query?.status()).toBe('resolved');

    expect(user1Query?.value()).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    store.mutateUser({
      id: '1',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    await vi.runAllTimersAsync();
    expect(user1Query?.status()).toBe('local');
    expect(user1Query?.value()).toEqual({
      id: '1',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    vi.resetAllMocks();
  });
  it('#5 Should optimistic update multiples targeted queryById with id > 5', async () => {
    vi.useFakeTimers();
    const MutationStore = signalStore(
      withState({
        userSelected: undefined as { id: string } | undefined,
      }),
      withMethods((store) => ({
        selectUser: (id: string) => {
          patchState(store, {
            userSelected: { id },
          });
        },
      })),
      withQueryById('user', (store) =>
        queryById({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(2000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
          identifier: (params) => params.id,
        })
      ),
      withMutation(
        'user',
        (store) =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQueryById: {
              optimisticUpdate: ({ mutationParams, queryResource }) => {
                return {
                  ...(queryResource.hasValue() ? queryResource.value() : {}),
                  ...mutationParams,
                  id: queryResource.value().id ?? 'unknown',
                };
              },
              filter: ({ queryIdentifier }) => {
                // should invalidate all queries with id > 5
                return parseInt(queryIdentifier, 10) > 5;
              },
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    store.selectUser('1');
    await vi.runAllTimersAsync();
    store.selectUser('2');
    await vi.runAllTimersAsync();
    store.selectUser('6');
    await vi.runAllTimersAsync();
    store.selectUser('7');
    await vi.runAllTimersAsync();
    store.selectUser('8');
    await vi.runAllTimersAsync();

    const user1Query = store.userQueryById()['1'];
    expect(user1Query?.status()).toBe('resolved');
    const user2Query = store.userQueryById()['2'];
    expect(user2Query?.status()).toBe('resolved');
    const user6Query = store.userQueryById()['6'];
    expect(user6Query?.status()).toBe('resolved');
    const user7Query = store.userQueryById()['7'];
    expect(user7Query?.status()).toBe('resolved');
    const user8Query = store.userQueryById()['8'];
    expect(user8Query?.status()).toBe('resolved');

    store.mutateUser({
      id: '6',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    await vi.runAllTimersAsync();
    // not changed
    expect(user1Query?.status()).toBe('resolved');
    expect(user2Query?.status()).toBe('resolved');

    // updated
    expect(user6Query?.status()).toBe('local');
    console.log('user6Query?.value()', user6Query?.value());
    expect(user6Query?.value()).toEqual({
      id: '6',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    expect(user7Query?.status()).toBe('local');
    expect(user7Query?.value()).toEqual({
      id: '7',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });

    expect(user8Query?.status()).toBe('local');
    expect(user8Query?.value()).toEqual({
      id: '8',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    vi.resetAllMocks();
  });
  it('#6 Should reload multiples targeted queryById with id > 5', async () => {
    vi.useFakeTimers();
    const MutationStore = signalStore(
      withState({
        userSelected: undefined as { id: string } | undefined,
      }),
      withMethods((store) => ({
        selectUser: (id: string) => {
          patchState(store, {
            userSelected: { id },
          });
        },
      })),
      withQueryById('user', (store) =>
        queryById({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(2000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
          identifier: (params) => params.id,
        })
      ),
      withMutation(
        'user',
        (store) =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQueryById: {
              reload: {
                onMutationLoading: true,
              },
              filter: ({ queryIdentifier }) => {
                // should invalidate all queries with id > 5
                return parseInt(queryIdentifier, 10) > 5;
              },
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    store.selectUser('1');
    await vi.runAllTimersAsync();
    store.selectUser('2');
    await vi.runAllTimersAsync();
    store.selectUser('6');
    await vi.runAllTimersAsync();
    store.selectUser('7');
    await vi.runAllTimersAsync();
    store.selectUser('8');
    await vi.runAllTimersAsync();

    const user1Query = store.userQueryById()['1'];
    expect(user1Query?.status()).toBe('resolved');
    const user2Query = store.userQueryById()['2'];
    expect(user2Query?.status()).toBe('resolved');
    const user6Query = store.userQueryById()['6'];
    expect(user6Query?.status()).toBe('resolved');
    const user7Query = store.userQueryById()['7'];
    expect(user7Query?.status()).toBe('resolved');
    const user8Query = store.userQueryById()['8'];
    expect(user8Query?.status()).toBe('resolved');

    const user1QueryReloadSpy = vi.spyOn(user1Query!, 'reload');
    const user2QueryReloadSpy = vi.spyOn(user2Query!, 'reload');
    const user6QueryReloadSpy = vi.spyOn(user6Query!, 'reload');
    const user7QueryReloadSpy = vi.spyOn(user7Query!, 'reload');
    const user8QueryReloadSpy = vi.spyOn(user8Query!, 'reload');

    store.mutateUser({
      id: '6',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    await vi.runAllTimersAsync();
    // not changed
    expect(user1QueryReloadSpy.mock.calls.length).toBe(0);
    expect(user2QueryReloadSpy.mock.calls.length).toBe(0);

    // reloading
    expect(user6QueryReloadSpy.mock.calls.length).toBe(1);
    expect(user7QueryReloadSpy.mock.calls.length).toBe(1);
    expect(user8QueryReloadSpy.mock.calls.length).toBe(1);
    vi.resetAllMocks();
  });

  it('#7 Should optimistic patch multiples targeted queryById with id > 5', async () => {
    vi.useFakeTimers();
    const MutationStore = signalStore(
      withState({
        userSelected: undefined as { id: string } | undefined,
      }),
      withMethods((store) => ({
        selectUser: (id: string) => {
          patchState(store, {
            userSelected: { id },
          });
        },
      })),
      withQueryById('user', (store) =>
        queryById({
          params: store.userSelected,
          loader: async ({ params }) => {
            await wait(2000);
            return {
              id: params?.id,
              name: 'John Doe',
              email: 'john.doe@example.com',
            } satisfies User;
          },
          identifier: (params) => params.id,
        })
      ),
      withMutation(
        'user',
        (store) =>
          mutation({
            method: (user: User) => user,
            loader: async ({ params: user }) => {
              return user satisfies User;
            },
          }),
        () => ({
          queriesEffects: {
            userQueryById: {
              optimisticPatch: {
                email: ({
                  mutationParams,
                  queryResource,
                  mutationResource,
                  queryIdentifier,
                  queryResources,
                  targetedState,
                }) => {
                  expectTypeOf(queryResource).toEqualTypeOf<
                    ResourceRef<{
                      id: string;
                      name: string;
                      email: string;
                    }>
                  >();
                  expect(mutationResource).toBeDefined();

                  expectTypeOf(mutationResource).toEqualTypeOf<
                    ResourceRef<User>
                  >();
                  expect(mutationResource).toBeDefined();

                  expectTypeOf(queryIdentifier).toEqualTypeOf<string>();
                  expect(targetedState).toBeDefined();

                  expectTypeOf(queryResources).toEqualTypeOf<
                    ResourceByIdRef<
                      string,
                      {
                        id: string;
                        name: string;
                        email: string;
                      },
                      NoInfer<
                        | {
                            id: string;
                          }
                        | undefined
                      >
                    >
                  >();
                  expectTypeOf(targetedState).toEqualTypeOf<
                    string | undefined
                  >();
                  expect(targetedState).toBeDefined();

                  return mutationParams.email;
                },
              },
              filter: ({ queryIdentifier }) => {
                // should invalidate all queries with id > 5
                return parseInt(queryIdentifier, 10) > 5;
              },
            },
          },
        })
      )
    );
    TestBed.configureTestingModule({
      providers: [MutationStore],
    });
    const store = TestBed.inject(MutationStore);
    store.selectUser('1');
    await vi.runAllTimersAsync();
    store.selectUser('2');
    await vi.runAllTimersAsync();
    store.selectUser('6');
    await vi.runAllTimersAsync();
    store.selectUser('7');
    await vi.runAllTimersAsync();
    store.selectUser('8');
    await vi.runAllTimersAsync();

    const user1Query = store.userQueryById()['1'];
    expect(user1Query?.status()).toBe('resolved');
    const user2Query = store.userQueryById()['2'];
    expect(user2Query?.status()).toBe('resolved');
    const user6Query = store.userQueryById()['6'];
    expect(user6Query?.status()).toBe('resolved');
    const user7Query = store.userQueryById()['7'];
    expect(user7Query?.status()).toBe('resolved');
    const user8Query = store.userQueryById()['8'];
    expect(user8Query?.status()).toBe('resolved');

    store.mutateUser({
      id: '6',
      name: 'Updated User',
      email: 'updated.user@example.com',
    });
    await vi.runAllTimersAsync();
    // not changed
    expect(user1Query?.status()).toBe('resolved');
    expect(user2Query?.status()).toBe('resolved');

    // updated
    expect(user6Query?.status()).toBe('local');
    console.log('user6Query?.value()', user6Query?.value());
    expect(user6Query?.value()).toEqual({
      id: '6',
      name: 'John Doe',
      email: 'updated.user@example.com',
    });
    expect(user7Query?.status()).toBe('local');
    expect(user7Query?.value()).toEqual({
      id: '7',
      name: 'John Doe',
      email: 'updated.user@example.com',
    });

    expect(user8Query?.status()).toBe('local');
    expect(user8Query?.value()).toEqual({
      id: '8',
      name: 'John Doe',
      email: 'updated.user@example.com',
    });
  });
});

// Types testing 👇

it('Should be well typed', () => {
  const multiplesWithQueryAndMutation = signalStoreFeature(
    withState({
      userSelected: undefined as { id: string } | undefined,
    }),
    withQuery('user', () =>
      query({
        params: () => '5',
        loader: async ({ params }) => {
          return {
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          } satisfies User as User;
        },
      })
    ),
    withQuery('users', () =>
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
    ),
    withMutation('updateUserAddress', (store) =>
      mutation({
        params: store.userSelected,
        loader: async ({ params }) => {
          await wait(2000);
          return {
            id: params.id,
            name: 'Updated User',
            email: 'er@d',
          } satisfies User;
        },
      })
    ),
    withMutation(
      'updateName',
      (store) =>
        mutation({
          params: store.userSelected,
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Updated Name',
              email: 'er@d',
            } satisfies User;
          },
        }),
      (store) => {
        type ExpectStoreTypeToBeRetrieved = Expect<
          Equal<
            ReturnType<(typeof store)['userSelected']>,
            | {
                id: string;
              }
            | undefined
          >
        >;
        return {
          queriesEffects: {
            userQuery: {
              optimisticPatch: {
                name: ({ mutationResource, queryResource, targetedState }) => {
                  type ExpectMutationResourceToBeRetrieved = Expect<
                    Equal<
                      typeof mutationResource,
                      ResourceRef<
                        NoInfer<{
                          id: string;
                          name: string;
                          email: string;
                        }>
                      >
                    >
                  >;

                  type ExpectQueryResourceToBeRetrieved = Expect<
                    Equal<typeof queryResource, ResourceRef<NoInfer<User>>>
                  >;

                  type ExpectTargetedStateToBeRetrieved = Expect<
                    Equal<typeof targetedState, string | undefined>
                  >;
                  return (
                    targetedState ?? store.userSelected()?.id + ': Romain '
                  );
                },
              },
              optimisticUpdate: ({
                mutationParams,
                mutationResource,
                queryResource,
              }) => {
                type ExpectMutationParamsToBeRetrieved = Expect<
                  Equal<typeof mutationParams, { id: string }>
                >;

                type ExpectMutationResourceToBeRetrieved = Expect<
                  Equal<
                    typeof mutationResource,
                    ResourceRef<
                      NoInfer<{ id: string; name: string; email: string }>
                    >
                  >
                >;

                type ExpectQueryResourceToBeRetrieved = Expect<
                  Equal<typeof queryResource, ResourceRef<User>>
                >;

                return {
                  id: mutationResource.value()?.id,
                  email: mutationResource.value()?.email,
                  name: mutationResource.value()?.name,
                };
              },
            },
          },
        };
      }
    )
  );

  type ResultTypeMultiplesQuery = InferSignalStoreFeatureReturnedType<
    typeof multiplesWithQueryAndMutation
  >;

  type ExpectThePropsToHaveARecordWithMultipleQueryNameAndHisType = Expect<
    Equal<keyof ResultTypeMultiplesQuery['props']['__query'], 'user' | 'users'>
  >;
});

it('Should expose a method', () => {
  const mutationOutput = signalStoreFeature(
    withMutation('user', () =>
      mutation({
        method: (data: { page: string }) => data.page,
        loader: async ({ params }) => {
          return {
            id: params,
            name: 'Updated User',
            email: 'er@d',
          } satisfies User;
        },
      })
    )
  );

  type ResultTypeMutation = InferSignalStoreFeatureReturnedType<
    typeof mutationOutput
  >;
  type MutationProps = ResultTypeMutation['props'];

  type ExpectPropsToHaveMutationNameWithResourceRef = Expect<
    Equal<
      MutationProps['userMutation'],
      ResourceRef<{
        id: string;
        name: string;
        email: string;
      }>
    >
  >;

  type ExpectPropsToHaveARecordWithMutationNameWithMutationState = Expect<
    Equal<
      // paramsSource is tested in another test (I did not find the way to satisfy it here)
      Omit<MutationProps['__mutation']['userMutation'], 'paramsSource'>,
      {
        state: {
          id: string;
          name: string;
          email: string;
        };
        params: string;
        args: {
          page: string;
        };
        isGroupedResource: false;
        groupIdentifier: unknown;
      }
    >
  >;

  type ExpectToHaveAnExposedMethod = Expect<
    Equal<keyof ResultTypeMutation['methods'], 'mutateUser'>
  >;

  type ExpectToHaveAnExposedMethodWithTypedParams = Expect<
    Equal<
      Parameters<ResultTypeMutation['methods']['mutateUser']>[0],
      {
        page: string;
      }
    >
  >;
});

it('Should accept the store without loosing typing', () => {
  const mutationOutput = signalStoreFeature(
    withProps(() => ({
      sourceId: signal({
        id: '4',
      }),
    })),
    withMutation('updateUser', (store) =>
      mutation({
        params: store.sourceId,
        loader: async ({ params }) => {
          type ExpectParamsToBeAnObjectWithStringId = Expect<
            Equal<typeof params, { id: string }>
          >;
          return {
            id: params.id,
            name: 'Updated User',
            email: 'er@d',
          } satisfies User;
        },
      })
    )
  );
});

it('Should expose the mutation resource and mutation method', () => {
  const mutationOutput = signalStoreFeature(
    withProps(() => ({
      sourceId: signal({
        id: '4',
      }),
    })),
    withMutation('user', (store) =>
      mutation({
        params: store.sourceId,
        loader: async ({ params }) => {
          type ExpectParamsToBeAnObjectWithStringId = Expect<
            Equal<typeof params, { id: string }>
          >;
          return {
            id: params.id,
            name: 'Updated User',
            email: 'er@d',
          } satisfies User;
        },
      })
    ),
    withMutation('testExposeMutationMethod', (store) =>
      mutation({
        method: ({ id }: { id: string }) => ({
          id,
        }),
        loader: async ({ params }) => {
          type ExpectParamsToBeAnObjectWithStringId = Expect<
            Equal<typeof params, { id: string }>
          >;
          return {
            id: params.id,
            name: 'Updated User',
            email: 'er@d',
          } satisfies User;
        },
      })
    )
  );

  type MutationStoreOutputType = ReturnType<typeof mutationOutput>;

  type ExpectMutationStoreOutputTypeToHaveMutationResource = Expect<
    Equal<
      MutationStoreOutputType['props']['userMutation'],
      ResourceRef<{
        id: string;
        name: string;
        email: string;
      }>
    >
  >;
  type ExpectMutationStoreOutputTypeToHaveMutationMethod = Expect<
    Equal<
      MutationStoreOutputType['methods']['mutateTestExposeMutationMethod'],
      (params: { id: string }) => {
        id: string;
      }
    >
  >;
});

it('it should expose the mutation params source, that will be reused by query', async () => {
  const mutationParamsSourceInternallyExposed = signalStoreFeature(
    withMutation('updateUser', () =>
      mutation({
        method: (user: User) => user,
        loader: async ({ params: user }) => {
          await wait(10);
          return user satisfies User;
        },
      })
    )
  );

  type ReturnInternalStoreType = ReturnType<
    ReturnType<
      typeof mutationParamsSourceInternallyExposed
    >['props']['__mutation']['updateUserMutation']['paramsSource']
  >;
  type ExpectMutationParamsSourceToBeDefined = Expect<
    Equal<ReturnInternalStoreType, User>
  >;
});

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
