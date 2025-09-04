import { signalStore, withState } from '@ngrx/signals';
import { Expect, Equal } from 'test-type';
import { globalQueries } from './global-queries';
import { of } from 'rxjs';
import { inject, Injectable, ResourceRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withMutation } from '../with-mutation';
import { SignalProxy } from '../signal-proxy';
import { vi } from 'vitest';
import { ResourceByIdRef } from '../resource-by-id';
import { query } from '../query';
import { mutation } from '../mutation';
import { queryById } from '../query-by-id';

// todo queryById
// todo expose inject funtion
describe('Global Queries', () => {
  it('should create a cached query and return a withFeatureQuery that can be used in signalStore', async () => {
    const data = globalQueries({
      queries: {
        user: {
          query: () =>
            query({
              params: () => ({
                id: '1',
              }),
              loader: async () => ({ id: '1', name: 'User 1' }),
            }),
        },
      },
    });

    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQuery' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQuery } = data;

    expect(typeof withUserQuery).toEqual('function');

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        on: {
          nameMutation: {},
        },
      }))
    );
    const store = TestBed.inject(testSignalStore);

    type ExpectQueryKeysToBeAssociatedWithTheCachedConfig = Expect<
      Equal<
        typeof store.userQuery,
        ResourceRef<{
          id: string;
          name: string;
        }>
      >
    >;

    expect(store.userQuery).toBeDefined();
  });

  it('should create a cached query and return a withFeatureQuery that can be used plug within the signalStore', async () => {
    const data = globalQueries({
      queries: {
        user: {
          query: (source: SignalProxy<{ id: string | undefined }>) =>
            query({
              params: source.id,
              loader: async ({ params: id }) => ({ id, name: 'User 1' }),
            }),
        },
        users: {
          query: () =>
            query({
              loader: async () => ({ id: '1', name: 'User 1' }),
            }),
        },
      },
    });
    console.log('data', data);

    // 👇 Check du typage
    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQuery' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQuery, withUsersQuery } = data;

    expect(typeof withUserQuery).toEqual('function');
    console.log('data', data);

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        setQuerySource: (source) => ({ id: store.selected }),
      })),
      withUsersQuery(() => ({}))
    );
    const store = TestBed.inject(testSignalStore);

    // 👇 Check du typage
    type ExpectQueryKeysToBeAssociatedWithTheCachedConfig = Expect<
      Equal<
        typeof store.userQuery,
        ResourceRef<{
          id: string;
          name: string;
        }>
      >
    >;

    expect(store.userQuery).toBeDefined();
    expect(store.usersQuery).toBeDefined();
  });
  it('withUserQuery can be inserted  within a signalStore', async () => {
    const { withUserQuery } = globalQueries({
      queries: {
        user: {
          query: (source: SignalProxy<{ id: string | undefined }>) =>
            query({
              params: source.id,
              loader: async ({ params: id }) => ({ id, name: 'User 1' }),
            }),
        },
      },
    });

    const Store = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        setQuerySource: (source) => ({ id: store.selected }),
      }))
    );

    const store = TestBed.inject(Store);
    expect(store.userQuery).toBeDefined();
  });

  it('should create a cached query that can inject a service and be plugged within a signalStore', async () => {
    // should export the withUserQuery and userQueryMutation
    vi.useFakeTimers();

    @Injectable({ providedIn: 'root' })
    class ApiService {
      async getUser() {
        return { id: '1', name: 'User 1' };
      }
    }

    const data = globalQueries({
      queries: {
        user: {
          query: (
            source: SignalProxy<{ id: string | undefined }>,
            api = inject(ApiService)
          ) =>
            query({
              params: source.id,
              loader: async ({ params }) => {
                console.log('stream params', params);
                return api.getUser();
              },
            }),
        },
      },
    });

    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQuery' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQuery } = data;

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        setQuerySource: (source) => {
          type ExpectSourceToTyped = Expect<
            Equal<typeof source, SignalProxy<{ id: string | undefined }>>
          >;
          return {
            id: store.selected,
          };
        },
      }))
    );
    const store = TestBed.inject(testSignalStore);

    type ExpectQueryKeysToBeAssociatedWithTheCachedConfig = Expect<
      Equal<
        typeof store.userQuery,
        ResourceRef<{
          id: string;
          name: string;
        }>
      >
    >;

    expect(store.userQuery).toBeDefined();
    await vi.advanceTimersByTimeAsync(300);
    expect(store.userQuery.value()).toEqual({ id: '1', name: 'User 1' });
    vi.restoreAllMocks();
  });

  it('should create a cached query that can inject a service', async () => {
    // should export the withUserQuery and userQueryMutation
    vi.useFakeTimers();

    @Injectable({ providedIn: 'root' })
    class ApiService {
      async getUser() {
        return { id: '1', name: 'User 1' };
      }
    }

    const source = signal({ id: 5 });
    const data = globalQueries({
      queries: {
        user: {
          query: (api = inject(ApiService)) =>
            query({
              params: source,
              loader: async ({ params }) => {
                console.log('stream params', params);
                return api.getUser();
              },
            }),
        },
      },
    });

    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQuery' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQuery } = data;

    expect(typeof withUserQuery).toEqual('function');

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        on: {
          nameMutation: {},
        },
      }))
    );
    const store = TestBed.inject(testSignalStore);

    type ExpectQueryKeysToBeAssociatedWithTheCachedConfig = Expect<
      Equal<
        typeof store.userQuery,
        ResourceRef<{
          id: string;
          name: string;
        }>
      >
    >;

    expect(store.userQuery).toBeDefined();
    await vi.advanceTimersByTimeAsync(300);
    expect(store.userQuery.value()).toEqual({ id: '1', name: 'User 1' });
    vi.restoreAllMocks();
  });

  it('should create a cached queryById that can be plug and return a withFeatureQueryById that can be used in signalStore', async () => {
    const data = globalQueries({
      queriesById: {
        user: {
          queryById: (source: SignalProxy<{ id: string | undefined }>) =>
            queryById({
              params: source.id,
              loader: async () => ({ id: '1', name: 'User 1' }),
              identifier: (params) => params,
            }),
        },
      },
    });

    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQueryById' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQueryById } = data;

    const r = withUserQueryById;
    //    ^?

    expect(typeof withUserQueryById).toEqual('function');

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQueryById((store) => ({
        setQuerySource: (source) => ({
          id: store.selected,
        }),
      }))
    );
    const store = TestBed.inject(testSignalStore);

    type ExpectUserQueryToBeTyped = Expect<
      Equal<
        typeof store.userQueryById,
        ResourceByIdRef<
          string,
          NoInfer<{
            id: string;
            name: string;
          }>
        >
      >
    >;

    expect(store.userQueryById).toBeDefined();
  });

  it('should create a cached queryById that is not pluggable and return a withFeatureQuery that can be used in signalStore', async () => {
    const data = globalQueries({
      queriesById: {
        user: {
          queryById: () =>
            queryById({
              params: () => '1',
              loader: async ({ params: id }) => ({ id, name: 'User ' + id }),
              identifier: (params) => params,
            }),
        },
      },
    });

    type ExpectQueryKeysToBeLiterals = Expect<
      Equal<'withUserQueryById' extends keyof typeof data ? true : false, true>
    >;

    const { withUserQueryById } = data;

    const r = withUserQueryById;
    //    ^?

    expect(typeof withUserQueryById).toEqual('function');

    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => ({ id: '4', name: params }),
        })
      ),
      withUserQueryById()
    );
    const store = TestBed.inject(testSignalStore);

    type ExpectUserQueryToBeTyped = Expect<
      Equal<
        typeof store.userQueryById,
        ResourceByIdRef<
          string,
          NoInfer<{
            id: string;
            name: string;
          }>
        >
      >
    >;

    expect(store.userQueryById).toBeDefined();
  });

  it('should export an injectQuery function that can be used in a component', async () => {
    @Injectable({ providedIn: 'root' })
    class ApiService {
      getUserDetails() {
        return of({ id: '1', name: 'User 1' });
      }
    }

    const data = globalQueries({
      queries: {
        user: {
          query: () =>
            query({
              params: () => '1',
              loader: async ({ params: id }) => ({ id, name: 'User ' + id }),
            }),
        },
        users: {
          query: (source: SignalProxy<{ id: string | undefined }>) =>
            query({
              params: source.id,
              loader: async ({ params: id }) =>
                of([{ id, name: 'User ' + id }]),
            }),
        },
        userDetails: {
          query: (
            source: SignalProxy<{ id: string | undefined }>,
            api = inject(ApiService)
          ) =>
            query({
              params: source.id,
              loader: async ({ params: id }) => api.getUserDetails(),
            }),
        },
        userView: {
          query: (api = inject(ApiService)) =>
            query({
              params: () => '1',
              loader: async ({ params: id }) => api.getUserDetails(),
            }),
        },
      },
    });

    TestBed.runInInjectionContext(() => {
      const {
        injectUserQuery,
        injectUsersQuery,
        injectUserDetailsQuery,
        injectUserViewQuery,
      } = data;

      //@ts-expect-error their is no pluggable data for user query
      const user = injectUserQuery((source) => true);
      const users = injectUsersQuery((source) => {
        type ExpectSourceToBeTyped = Expect<
          Equal<typeof source, SignalProxy<{ id: string | undefined }>>
        >;
        return {
          id: signal('1'),
        };
      });
      const userDetail = injectUserDetailsQuery((source) => {
        type ExpectSourceToBeTyped = Expect<
          Equal<typeof source, SignalProxy<{ id: string | undefined }>>
        >;
        return {
          id: signal('1'),
        };
      });
      //@ts-expect-error their is no pluggable data for userView query
      const userView = injectUserViewQuery((source) => true);

      expect(typeof injectUserQuery).toEqual('function');
      expect(typeof injectUsersQuery).toEqual('function');
      expect(typeof injectUserDetailsQuery).toEqual('function');
      expect(typeof injectUserViewQuery).toEqual('function');

      expect(typeof user.value).toEqual('function');
    });
  });
  it('Should share an unique instance injectQuery and withQuery', async () => {
    vi.useFakeTimers();
    const { injectUserQuery, withUserQuery } = globalQueries({
      queries: {
        user: {
          query: () =>
            query({
              params: () => '1',
              loader: async ({ params: id }) => ({ id, name: 'User ' + id }),
            }),
        },
      },
    });
    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => of({ id: '4', name: params }),
        })
      ),
      withUserQuery()
    );
    const testSignalStore2 = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => of({ id: '4', name: params }),
        })
      ),
      withUserQuery()
    );
    TestBed.runInInjectionContext(() => {
      const injectedQuery = injectUserQuery();
      const store = TestBed.inject(testSignalStore);
      const store2 = TestBed.inject(testSignalStore2);

      // same ref
      expect(injectedQuery === store.userQuery).toEqual(true);
      expect(injectedQuery === store2.userQuery).toEqual(true);
    });
    vi.restoreAllMocks();
  });

  it('Should export an injectUserQueryById function that can be used in a component', async () => {
    const { injectUserQueryById } = globalQueries({
      queriesById: {
        user: {
          queryById: () =>
            queryById({
              params: () => '1',
              loader: async ({ params: id }) => of({ id, name: 'User ' + id }),
              identifier: (params) => params,
            }),
        },
      },
    });
    TestBed.runInInjectionContext(() => {
      const injectedQueryById = injectUserQueryById();
      expect(injectedQueryById()).toBeDefined();
    });
  });

  it('Should share an unique instance injectUserQueryById and withUserQueryById', async () => {
    vi.useFakeTimers();
    const { injectUserQueryById, withUserQueryById } = globalQueries({
      queriesById: {
        user: {
          queryById: () =>
            queryById({
              params: () => '1',
              loader: async ({ params: id }) => of({ id, name: 'User ' + id }),
              identifier: (params) => params,
            }),
        },
      },
    });
    const testSignalStore = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => of({ id: '4', name: params }),
        })
      ),
      withUserQueryById()
    );
    const testSignalStore2 = signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        mutation({
          method: (name: string) => name,
          loader: async ({ params }) => of({ id: '4', name: params }),
        })
      ),
      withUserQueryById()
    );
    TestBed.runInInjectionContext(() => {
      const injectedQueryById = injectUserQueryById();
      const store = TestBed.inject(testSignalStore);
      const store2 = TestBed.inject(testSignalStore2);

      // same ref
      expect(injectedQueryById === store.userQueryById).toEqual(true);
      expect(injectedQueryById === store2.userQueryById).toEqual(true);
    });
    vi.restoreAllMocks();
  });

  it('should accept an Insertions output, that appear in the store', () => {
    const {
      injectUserQueryById,
      withUserQueryById,
      injectUserDetailsQuery,
      withUserDetailsQuery,
    } = globalQueries({
      queries: {
        userDetails: {
          query: () =>
            query(
              {
                params: () => '1',
                loader: async ({ params: id }) => ({ id, name: 'User ' + id }),
              },
              () => {
                return {
                  pagination: {
                    page: 1,
                  },
                };
              }
            ),
        },
      },
      queriesById: {
        user: {
          queryById: () =>
            queryById(
              {
                params: () => '1',
                loader: async ({ params: id }) => ({ id, name: 'User ' + id }),
                identifier: (params) => params,
              },
              () => {
                return {
                  pagination: {
                    page: 1,
                  },
                };
              }
            ),
        },
      },
    });
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withUserQueryById(),
      withUserDetailsQuery()
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      expectTypeOf(store.userDetailsQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userDetailsQuery.pagination).toBeDefined();

      expectTypeOf(store.userQueryById.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQueryById.pagination).toBeDefined();

      const userQuery = injectUserQueryById();
      expectTypeOf(userQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
      const userDetailsQuery = injectUserDetailsQuery();
      expectTypeOf(userDetailsQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
    });
  });
});
