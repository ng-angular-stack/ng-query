import { of } from 'rxjs';
import { signalStore } from '@ngrx/signals';
import { TestBed } from '@angular/core/testing';
import { withMutation } from '@ng-query/ngrx-signals';
import { rxMutation } from './rx-mutation';
import { inject } from '@angular/core';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('rxMutation', () => {
  it('1- should accept signal param as source', () => {
    TestBed.runInInjectionContext(() => {
      const mutationRef = rxMutation({
        params: () => '5',
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual('5');
      expect(mutationResult.__types).toBeDefined();
    });
  });
  it('2- should accept observable param$ as source', () => {
    TestBed.runInInjectionContext(() => {
      const mutationRef = rxMutation({
        params$: of('5'),
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual('5');
      expect(mutationResult.__types).toBeDefined();
    });
  });
  it('3- should accept a method as source (when calling method, the withMutation will update the resourceParamsSrc) ', async () => {
    await TestBed.runInInjectionContext(async () => {
      let calledTime = 0;
      const mutationRef = rxMutation({
        method: (data: string) => data,
        stream: ({ params }) => {
          calledTime++;
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.method).toBeInstanceOf(Function);
      expect(mutationResult.__types).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual(undefined);
    });
  });
});

describe('withMutation using rxMutation', () => {
  it('1- Should expose a mutation resource', () => {
    const Store = signalStore(
      withMutation('user', () =>
        rxMutation({
          params: () => '5',
          stream: ({ params }) => {
            return of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            });
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userMutation).toBeDefined();
  });

  it('should accept an insertion output, that appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutation('user', () =>
        rxMutation(
          {
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              });
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
        rxMutation(
          {
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              });
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
        rxMutation(
          {
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              });
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
