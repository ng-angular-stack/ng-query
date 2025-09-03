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

  it('should accept an extensions output, that appear in the store', () => {
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
});
