import { TestBed } from '@angular/core/testing';
import { signalStore, signalStoreFeature, withState } from '@ngrx/signals';
import { withQueryById } from './with-query-by-id';
import { Expect, Equal } from 'test-type';
import { Injector, ResourceRef, runInInjectionContext } from '@angular/core';
import { ResourceByIdRef } from './resource-by-id';
import { queryById } from './query-by-id';
import { withMutation } from './with-mutation';
import { vi } from 'vitest';
import { mutation } from './mutation';
import { withMutationById } from './with-mutation-by-id';
import { mutationById } from './mutation-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('queryById', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('Retrieve returned types of queryByIdFn', () => {
    TestBed.configureTestingModule({
      providers: [Injector],
    });
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const queryByIdFn = queryById({
        params: () => '5',
        loader: async ({ params }) => {
          return {
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          };
        },
        identifier: (params) => params,
      });
      type queryByIdFn__types = ReturnType<typeof queryByIdFn>['__types'];

      type ExpectQueryByFnTypesToBeRetrieved = Expect<
        Equal<
          queryByIdFn__types,
          {
            state: NoInfer<{
              id: string;
              name: string;
              email: string;
            }>;
            params: string;
            args: unknown;
            isGroupedResource: true;
            groupIdentifier: string;
          }
        >
      >;
    });
  });
});
describe('withQueryById', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a query with a record of resource by id', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withQueryById('user', () =>
        queryById({
          params: () => '5',
          loader: async ({ params }) => {
            return returnedUser;
          },
          identifier: (params) => params,
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userQueryById).toBeDefined();

    await vi.runAllTimersAsync();
    expect(store.userQueryById()['5']?.value()).toBe(returnedUser);

    type ExpectUserQueryToBeAnObjectWithResourceByIdentifier = Expect<
      Equal<
        typeof store.userQueryById,
        ResourceByIdRef<string, NoInfer<User>, string>
      >
    >;
  });

  it('2- Should update associated state', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10);
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          associatedClientState: {
            usersFetched: ({
              queryParams,
              queryResource,
              queryIdentifier,
              queryResources,
            }) => {
              type ExpectQueryParamsToBeTyped = Expect<
                Equal<typeof queryParams, string>
              >;
              expect(queryParams).toBe('5');

              type ExpectQueryResourceToBeTyped = Expect<
                Equal<typeof queryResource, ResourceRef<User>>
              >;
              expect(queryResource.value()).toBe(returnedUser);

              type ExpectLastResolvedResourceIdentifierToBeTyped = Expect<
                Equal<typeof queryIdentifier, string>
              >;
              expect(queryIdentifier).toBe('5');

              type ExpectLastResolvedResourceToBeTyped = Expect<
                Equal<
                  typeof queryResources,
                  ResourceByIdRef<string, NoInfer<User>, string>
                >
              >;
              expect(Object.entries(queryResources()).length).toEqual(1);
              expect(queryResources()['5']?.value()).toEqual(returnedUser);

              expect(store.usersFetched().length).toEqual(0);
              return [
                ...store
                  .usersFetched()
                  .filter((user) => user.id !== queryResource.value()?.id),
                queryResource.value(),
              ];
            },
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);
    expect(store.usersFetched().length).toBe(0);

    await vi.runAllTimersAsync();
    expect(store.userQueryById()['5']?.value()).toBe(returnedUser);

    type ExpectUserQueryToBeAnObjectWithResourceByIdentifier = Expect<
      Equal<
        typeof store.userQueryById,
        ResourceByIdRef<string, NoInfer<User>, string>
      >
    >;
    expect(store.usersFetched().length).toBe(1);
    expect(store.usersFetched()[0]).toBe(returnedUser);
  });

  it('3- Declarative: should handle optimistic updates on query value', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withMutation('user', () =>
        mutation({
          method(user: User) {
            return user;
          },
          async loader({ params }) {
            return params;
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutation: {
              optimisticUpdate: ({ mutationParams }) => mutationParams,
              filter: ({ mutationParams, queryIdentifier }) =>
                mutationParams.id === queryIdentifier,
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
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await vi.runAllTimersAsync();
    expect(userQuery5?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
  });

  it('4- Declarative: should handle optimistic patch on query value', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withMutation('user', () =>
        mutation({
          method(user: User) {
            return user;
          },
          async loader({ params }) {
            return params;
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutation: {
              optimisticPatch: {
                name: ({ mutationParams }) => mutationParams.name,
              },
              filter: ({ mutationParams, queryIdentifier }) =>
                mutationParams.id === queryIdentifier,
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
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await vi.runAllTimersAsync();
    expect(userQuery5?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'test@a.com',
    });
  });

  it('5- Declarative: should handle query reload on mutation change', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withMutation('user', () =>
        mutation({
          method(user: User) {
            return user;
          },
          async loader({ params }) {
            await wait(10);
            return params;
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutation: {
              filter: ({ mutationParams, queryIdentifier }) =>
                mutationParams.id === queryIdentifier,
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
      providers: [Store],
    });
    const store = TestBed.inject(Store);
    await vi.runAllTimersAsync();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);
    const userQuery5ReloadSpy = vi.spyOn(userQuery5!, 'reload');
    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();

    expect(userQuery5ReloadSpy.mock.calls.length).toBe(2);
  });

  it('6- Declarative: should handle query reload on mutation by id change', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
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
            await wait(10);
            return params;
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutationById: {
              filter: ({ queryIdentifier, mutationIdentifier }) =>
                queryIdentifier === mutationIdentifier,
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
      providers: [Store],
    });
    const store = TestBed.inject(Store);
    await vi.runAllTimersAsync();
    const userQuery5 = store.userQueryById()['5'];
    await vi.runAllTimersAsync();

    expect(userQuery5?.value()).toBe(returnedUser);
    const userQuery5ReloadSpy = vi.spyOn(userQuery5!, 'reload');
    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await vi.runAllTimersAsync();

    expect(userQuery5ReloadSpy.mock.calls.length).toBe(2);
  });

  it('7- Declarative: should handle optimistic updates (from mutation by id) on query value', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
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
          async loader({ params }) {
            return params;
          },
          identifier: (params) => params.id,
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutationById: {
              optimisticUpdate: ({ mutationParams }) => mutationParams,
              filter: ({ mutationParams, queryIdentifier }) =>
                mutationParams.id === queryIdentifier,
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
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await vi.runAllTimersAsync();
    expect(userQuery5?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
  });

  it('8- Declarative: should handle optimistic patch on query value (from mutation by id)', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
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
          async loader({ params }) {
            return params;
          },
          identifier: (params) => params.id,
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          on: {
            userMutationById: {
              optimisticPatch: {
                name: ({ mutationParams }) => mutationParams.name,
              },
              filter: ({ mutationParams, queryIdentifier }) =>
                mutationParams.id === queryIdentifier,
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
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await vi.runAllTimersAsync();
    expect(userQuery5?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'test@a.com',
    });
  });
  it('#1- Should expose private query type', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const StoreFeature = signalStoreFeature(
      withState({
        usersFetched: [] as User[],
        lastUserFetched: undefined as User | undefined,
      }),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: async ({ params }) => {
              await wait(10);
              return returnedUser;
            },
            identifier: (params) => params,
          }),
        (store) => ({
          associatedClientState: {
            usersFetched: ({
              queryParams,
              queryResource,
              queryIdentifier,
              queryResources,
            }) => {
              type ExpectQueryParamsToBeTyped = Expect<
                Equal<typeof queryParams, string>
              >;
              expect(queryParams).toBe('5');

              type ExpectQueryResourceToBeTyped = Expect<
                Equal<typeof queryResource, ResourceRef<User>>
              >;
              expect(queryResource.value()).toBe(returnedUser);

              type ExpectLastResolvedResourceIdentifierToBeTyped = Expect<
                Equal<typeof queryIdentifier, string>
              >;
              expect(queryIdentifier).toBe('5');

              type ExpectLastResolvedResourceToBeTyped = Expect<
                Equal<
                  typeof queryResources,
                  ResourceByIdRef<string, NoInfer<User>, string>
                >
              >;
              expect(Object.entries(queryResources()).length).toEqual(1);
              expect(queryResources()['5']?.value()).toEqual(returnedUser);

              expect(store.usersFetched().length).toEqual(0);
              return [
                ...store
                  .usersFetched()
                  .filter((user) => user.id !== queryResource.value()?.id),
                queryResource.value(),
              ];
            },
          },
        })
      )
    );

    type StoreFeatureQueryType = ReturnType<
      typeof StoreFeature
    >['props']['__query']['user'];

    type ExpectStoreFeatureQueryTypeToBeFullyRetrieved = Expect<
      Equal<
        StoreFeatureQueryType,
        {
          state: User;
          params: string;
          args: unknown;
          isGroupedResource: true;
          groupIdentifier: string;
        }
      >
    >;
  });
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
