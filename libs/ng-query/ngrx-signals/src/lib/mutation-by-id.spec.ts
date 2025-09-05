import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { mutationById } from './mutation-by-id';
import { Expect, Equal } from 'test-type';
import { signalStore } from '@ngrx/signals';
import { withMutationById } from './with-mutation-by-id';

type User = {
  id: string;
  name: string;
  email: string;
};
// todo handle stream in resourceById

describe('mutationById', () => {
  it('Retrieve returned types of mutationByIdFn', () => {
    TestBed.configureTestingModule({
      providers: [Injector],
    });
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const mutationByIdFn = mutationById({
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
      type mutationByIdFn__types = ReturnType<typeof mutationByIdFn>['__types'];

      type ExpectMutationByFnTypesToBeRetrieved = Expect<
        Equal<
          mutationByIdFn__types,
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

  it('should accept an insertion output, that appear in the store', () => {
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
  it('should accept multiple insertions, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutationById('user', () =>
        mutationById(
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
      expectTypeOf(store.userMutationById.pagination).toEqualTypeOf<{
        page: number;
      }>();
      expect(store.userMutationById.pagination).toBeDefined();

      //insert 2
      expectTypeOf(
        store.userMutationById.someOtherInfo
      ).toEqualTypeOf<boolean>();
      expect(store.userMutationById.someOtherInfo).toBeDefined();
    });
  });
  it('should accept seven insertions, all outputs appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutationById('user', () =>
        mutationById(
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
      expectTypeOf(store.userMutationById.ext1).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext2).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext3).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext4).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext5).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext6).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext7).toEqualTypeOf<number>();
      expect(store.userMutationById.ext1).toBeDefined();
      expect(store.userMutationById.ext2).toBeDefined();
      expect(store.userMutationById.ext3).toBeDefined();
      expect(store.userMutationById.ext4).toBeDefined();
      expect(store.userMutationById.ext5).toBeDefined();
      expect(store.userMutationById.ext6).toBeDefined();
      expect(store.userMutationById.ext7).toBeDefined();
    });
  });
});
