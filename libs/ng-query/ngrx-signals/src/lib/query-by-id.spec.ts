import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { Expect, Equal } from 'test-type';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { queryById } from './query-by-id';
import { signalStore } from '@ngrx/signals';
import { withQueryById } from './with-query-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};
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

  it('should accept an extension output, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQueryById('user', () =>
        queryById(
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
            identifier: (params) => params,
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
      expectTypeOf(store.userQueryById.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQueryById.pagination).toBeDefined();
    });
  });
  it('should accept multiple extensions, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQueryById('user', () =>
        queryById(
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
            identifier: (params) => params,
          },
          // extension 1
          () => {
            return {
              pagination: {
                page: 1,
              },
            };
          },
          // extension 2
          ({ extensions }) => {
            expectTypeOf(extensions).toEqualTypeOf<{
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
      //extension 1
      expectTypeOf(store.userQueryById.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userQueryById.pagination).toBeDefined();

      //extension 2
      expectTypeOf(store.userQueryById.someOtherInfo).toEqualTypeOf<boolean>();
      expect(store.userQueryById.someOtherInfo).toBeDefined();
    });
  });
  it('should accept seven extensions, all outputs appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQueryById('user', () =>
        queryById(
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
            identifier: (params) => params,
          },
          // extension 1
          () => ({ ext1: 1 }),
          // extension 2
          ({ extensions }) => ({ ext2: extensions.ext1 + 1 }),
          // extension 3
          ({ extensions }) => ({ ext3: extensions.ext2 + 1 }),
          // extension 4
          ({ extensions }) => ({ ext4: extensions.ext3 + 1 }),
          // extension 5
          ({ extensions }) => ({ ext5: extensions.ext4 + 1 }),
          // extension 6
          ({ extensions }) => ({ ext6: extensions.ext5 + 1 }),
          // extension 7
          ({ extensions }) => ({ ext7: extensions.ext6 + 1 })
        )
      )
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      expectTypeOf(store.userQueryById.ext1).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext2).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext3).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext4).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext5).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext6).toEqualTypeOf<number>();
      expectTypeOf(store.userQueryById.ext7).toEqualTypeOf<number>();
      expect(store.userQueryById.ext1).toBeDefined();
      expect(store.userQueryById.ext2).toBeDefined();
      expect(store.userQueryById.ext3).toBeDefined();
      expect(store.userQueryById.ext4).toBeDefined();
      expect(store.userQueryById.ext5).toBeDefined();
      expect(store.userQueryById.ext6).toBeDefined();
      expect(store.userQueryById.ext7).toBeDefined();
    });
  });
});
