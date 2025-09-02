import { TestBed } from '@angular/core/testing';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { delay, lastValueFrom, of } from 'rxjs';
import { withQueryById } from './with-query-by-id';
import { Equal, Expect } from '../../../../../test-type';
import {
  ApplicationRef,
  Injector,
  ResourceRef,
  runInInjectionContext,
} from '@angular/core';
import { ResourceByIdRef } from '../resource-by-id';
import { queryById } from './query-by-id';
import { withMutation } from './with-mutation';
import { vi } from 'vitest';
import { mutation } from './mutation';
import { withMutationById } from './with-mutation-by-id';
import { mutationById } from './mutation-by-id';
import { rxMutationById } from './rx-mutation-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};
// TODO faire un withQuery common et un query ou rxQuery qui renvoie soit une resource ou une rxResource
// ou encore accept aussi queryById ?
// todo handle stream in resourceById

describe('queryById', () => {
  it('Retrieve returned types of queryByIdFn', () => {
    TestBed.configureTestingModule({
      providers: [Injector],
    });
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const queryByIdFn = queryById({
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
          loader: ({ params }) => {
            return lastValueFrom(of<User>(returnedUser));
          },
          identifier: (params) => params,
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);

    expect(store.userQueryById).toBeDefined();

    await TestBed.inject(ApplicationRef).whenStable();
    expect(store.userQueryById()['5']?.value()).toBe(returnedUser);

    type ExpectUserQueryToBeAnObjectWithResourceByIdentifier = Expect<
      Equal<typeof store.userQueryById, ResourceByIdRef<string, NoInfer<User>>>
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
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser).pipe(delay(10)));
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
                  ResourceByIdRef<string, NoInfer<User>>
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    expect(store.usersFetched().length).toBe(0);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(store.userQueryById()['5']?.value()).toBe(returnedUser);

    type ExpectUserQueryToBeAnObjectWithResourceByIdentifier = Expect<
      Equal<typeof store.userQueryById, ResourceByIdRef<string, NoInfer<User>>>
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
          loader({ params }) {
            return lastValueFrom(of<User>(params));
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await TestBed.inject(ApplicationRef).whenStable();
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
          loader({ params }) {
            return lastValueFrom(of<User>(params));
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await TestBed.inject(ApplicationRef).whenStable();
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
          loader({ params }) {
            return lastValueFrom(of<User>(params).pipe(delay(10)));
          },
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);
    const userQuery5ReloadSpy = vi.spyOn(userQuery5!, 'reload');
    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await wait(50);

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
        rxMutationById({
          method(user: User) {
            return user;
          },
          identifier: (params) => params.id,
          stream: ({ params }) => of<User>(params).pipe(delay(10)),
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              console.log('params', params);
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    await wait(50);

    expect(userQuery5?.value()).toBe(returnedUser);
    const userQuery5ReloadSpy = vi.spyOn(userQuery5!, 'reload');
    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });

    await wait(50);

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
          loader({ params }) {
            return lastValueFrom(of<User>(params));
          },
          identifier: (params) => params.id,
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await TestBed.inject(ApplicationRef).whenStable();
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
          loader({ params }) {
            return lastValueFrom(of<User>(params));
          },
          identifier: (params) => params.id,
        })
      ),
      withQueryById(
        'user',
        () =>
          queryById({
            params: () => '5',
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser));
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
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);
    await TestBed.inject(ApplicationRef).whenStable();
    const userQuery5 = store.userQueryById()['5'];
    expect(userQuery5?.value()).toBe(returnedUser);

    store.mutateUser({
      id: '5',
      name: 'Updated User',
      email: 'updated.doe@example.com',
    });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(userQuery5?.value()).toEqual({
      id: '5',
      name: 'Updated User',
      email: 'test@a.com',
    });
  });

  it('9-  In pagination case, it should preserve the previous value when accessing back to a previous page', async () => {
    vi.useFakeTimers();
    const returnedUser = (id: string) => ({
      id: `${id}`,
      name: 'John Doe',
      email: 'test@a.com',
    });
    const Store = signalStore(
      withState({
        selected: {
          id: '1',
        },
      }),
      withMethods((store) => ({
        nextPage: () =>
          patchState(store, (state) => ({
            selected: { id: `${Number(state.selected.id) + 1}` },
          })),
        previousPage: () =>
          patchState(store, (state) => ({
            selected: { id: `${Number(state.selected.id) - 1}` },
          })),
      })),
      withQueryById('user', (store) =>
        queryById({
          params: store.selected,
          loader: ({ params: selected }) => {
            console.log('selected', selected);
            return lastValueFrom(
              of<User>(returnedUser(selected.id)).pipe(delay(10000))
            );
          },
          identifier: (params) => params.id,
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);

    await vi.runAllTimersAsync();

    const userSelected1 = store.userQueryById()['1'];
    expect(userSelected1?.value()).toEqual(returnedUser('1'));
    store.nextPage();
    await vi.runAllTimersAsync();
    store.previousPage();
    expect(userSelected1?.value()).toEqual(returnedUser('1'));
    expect(userSelected1?.status()).toEqual('loading');

    await vi.runAllTimersAsync();

    expect(userSelected1?.value()).toEqual(returnedUser('1'));
    expect(userSelected1?.status()).toEqual('resolved');

    vi.restoreAllMocks();
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
            loader: ({ params }) => {
              return lastValueFrom(of<User>(returnedUser).pipe(delay(10)));
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
                  ResourceByIdRef<string, NoInfer<User>>
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
