import { signalStore } from '@ngrx/signals';
import { withMutation } from './with-mutation';
import { mutation } from './mutation';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';

describe('mutation', () => {
  it('should accept an insertion output, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutation('user', () =>
        mutation(
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
      expectTypeOf(store.userMutation.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userMutation.pagination).toBeDefined();
    });
  });
  it('should accept multiple insertions, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutation('user', () =>
        mutation(
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
      expectTypeOf(store.userMutation.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userMutation.pagination).toBeDefined();

      //insert 2
      expectTypeOf(store.userMutation.someOtherInfo).toEqualTypeOf<boolean>();
      expect(store.userMutation.someOtherInfo).toBeDefined();
    });
  });
  it('should accept seven insertions, all outputs appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutation('user', () =>
        mutation(
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
      expectTypeOf(store.userMutation.ext1).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext2).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext3).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext4).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext5).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext6).toEqualTypeOf<number>();
      expectTypeOf(store.userMutation.ext7).toEqualTypeOf<number>();
      expect(store.userMutation.ext1).toBeDefined();
      expect(store.userMutation.ext2).toBeDefined();
      expect(store.userMutation.ext3).toBeDefined();
      expect(store.userMutation.ext4).toBeDefined();
      expect(store.userMutation.ext5).toBeDefined();
      expect(store.userMutation.ext6).toBeDefined();
      expect(store.userMutation.ext7).toBeDefined();
    });
  });
});
