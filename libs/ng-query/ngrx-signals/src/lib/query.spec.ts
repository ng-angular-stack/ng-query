import { TestBed } from '@angular/core/testing';
import { query } from './query';
import { signalStore, signalStoreFeature, withState } from '@ngrx/signals';
import { withQuery } from './with-query';
import { inject } from '@angular/core';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('query', () => {
  it('1- should accept signal param as source', () => {
    TestBed.runInInjectionContext(() => {
      const queryRef = query({
        params: () => '5',
        loader: async ({ params }) => {
          return {
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          };
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

describe('withQuery using query', () => {
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

  describe('query Insertions output', () => {
    it('should accept an Insertions output, that appear in the store', () => {
      const Store = signalStore(
        {
          providedIn: 'root',
        },
        signalStoreFeature(
          withState({}),
          withQuery('user', () =>
            query(
              {
                params: () => '5',
                loader: async ({ params }) => {
                  return {
                    id: params,
                    name: 'John Doe',
                    email: 'test@a.com',
                  };
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

  it('should accept an insertion output, that appear in the store', () => {
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
  it('should accept multiple insertions, that appear in the store', () => {
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
          // insert 1
          () => {
            return {
              pagination: {
                page: 1,
              },
            };
          },
          // insert 2
          ({ insertions: inserts }) => {
            expectTypeOf(inserts).toEqualTypeOf<{
              pagination: {
                page: number;
              };
            }>();
            return {
              someOtherInfo: true,
            };
          }
        )
      )
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      //insert 1
      expectTypeOf(store.userQuery.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQuery.pagination).toBeDefined();

      //insert 2
      expectTypeOf(store.userQuery.someOtherInfo).toEqualTypeOf<boolean>();
      expect(store.userQuery.someOtherInfo).toBeDefined();
    });
  });
  it('should accept seven insertions, all outputs appear in the store', () => {
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
          // insert 1
          () => ({ ext1: 1 }),
          // insert 2
          ({ insertions: inserts }) => ({ ext2: inserts.ext1 + 1 }),
          // insert 3
          ({ insertions: inserts }) => ({ ext3: inserts.ext2 + 1 }),
          // insert 4
          ({ insertions: inserts }) => ({ ext4: inserts.ext3 + 1 }),
          // insert 5
          ({ insertions: inserts }) => ({ ext5: inserts.ext4 + 1 }),
          // insert 6
          ({ insertions: inserts }) => ({ ext6: inserts.ext5 + 1 }),
          // insert 7
          ({ insertions: inserts }) => ({ ext7: inserts.ext6 + 1 })
        )
      )
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      expectTypeOf(store.userQuery.ext1).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext2).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext3).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext4).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext5).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext6).toEqualTypeOf<number>();
      expectTypeOf(store.userQuery.ext7).toEqualTypeOf<number>();
      expect(store.userQuery.ext1).toBeDefined();
      expect(store.userQuery.ext2).toBeDefined();
      expect(store.userQuery.ext3).toBeDefined();
      expect(store.userQuery.ext4).toBeDefined();
      expect(store.userQuery.ext5).toBeDefined();
      expect(store.userQuery.ext6).toBeDefined();
      expect(store.userQuery.ext7).toBeDefined();
    });
  });
});
