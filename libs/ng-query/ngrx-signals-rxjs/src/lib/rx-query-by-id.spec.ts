import { ApplicationRef, inject } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { rxQueryById } from './rx-query-by-id';
import { Expect, Equal } from 'test-type';
import { signalStore } from '@ngrx/signals';
import { InternalType, withQueryById } from '@ng-query/ngrx-signals';
type User = {
  id: string;
  name: string;
  email: string;
};
describe('rxResourceById', () => {
  it('should create a rxResource by id that accepts param$ observable', async () => {
    await TestBed.runInInjectionContext(async () => {
      const sourceParams = new BehaviorSubject<{ id: string }>({ id: '1' });
      const queryConfig = rxQueryById({
        identifier: (params) => params.id,
        params$: sourceParams,
        stream: ({ params }) => {
          return of(params);
        },
      })({} as any, {} as any);
      expect(queryConfig).toBeDefined();
      expect(queryConfig.queryByIdRef.resourceById()).toEqual({});
      expect(queryConfig.queryByIdRef.resourceParamsSrc).toBeDefined();
      expect(queryConfig.queryByIdRef.resourceParamsSrc()).toEqual({ id: '1' });

      type ExpectTypeTObeGroupedQuery = Expect<
        Equal<
          typeof queryConfig.__types,
          InternalType<
            {
              id: string;
            },
            {
              id: string;
            },
            unknown,
            true,
            string
          >
        >
      >;
    });
  });
  it('should create a rxResource by id that accepts param$ observable', async () => {
    await TestBed.runInInjectionContext(async () => {
      const sourceParams = new Subject<{ id: string }>();
      const queryConfig = rxQueryById({
        identifier: (params) => params.id,
        params$: sourceParams,
        stream: ({ params }) => {
          return of(params);
        },
      })({} as any, {} as any);
      expect(queryConfig).toBeDefined();
      expect(queryConfig.queryByIdRef.resourceById()).toEqual({});
      expect(queryConfig.queryByIdRef.resourceParamsSrc).toBeDefined();

      type ExpectTypeTObeGroupedQuery = Expect<
        Equal<
          typeof queryConfig.__types,
          InternalType<
            {
              id: string;
            },
            {
              id: string;
            },
            unknown,
            true,
            string
          >
        >
      >;
    });
  });
  it('should accept an Insertions output, that appear in the store', () => {
    TestBed.runInInjectionContext(() => {
      const result = rxQueryById(
        {
          params: () => '5',
          identifier: (params) => params,
          stream: ({ params }) => {
            return of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            } satisfies User);
          },
        },
        () => ({
          pagination: 1,
        })
      );
      type ExpectTypeWithInsertions = Expect<
        Equal<
          ReturnType<typeof result>['queryByIdRef']['insertionsOutputs'],
          {
            pagination: number;
          }
        >
      >;
    });
  });
});

describe('rxQueryById used with: withQueryById', () => {
  it('1- Should expose a query with a record of resource by id', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withQueryById('user', () =>
        rxQueryById({
          params: () => '5',
          stream: ({ params }) => {
            return of<User>(returnedUser);
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
  });

  it('should accept seven inserts, all outputs appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withQueryById('user', () =>
        rxQueryById(
          {
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              } satisfies User);
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
