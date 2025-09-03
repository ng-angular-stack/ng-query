import { ApplicationRef, WritableSignal } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { rxQueryById } from './rx-query-by-id';
import { Expect, Equal } from 'test-type';
import { signalStore } from '@ngrx/signals';
import {
  InternalType,
  ResourceByIdRef,
  withQueryById,
} from '@ng-query/ngrx-signals';
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
  it('should accept an extensions output, that appear in the store', () => {
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
    type ExpectTypeWithExtensions = Expect<
      Equal<
        ReturnType<typeof result>['queryByIdRef'],
        {
          resourceById: ResourceByIdRef<string, User>;
          resourceParamsSrc: WritableSignal<string | undefined>;
          extensionsOutputs: {
            pagination: number;
          };
        }
      >
    >;
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
});
