import { globalQueries, query, queryById } from '@ng-query/ngrx-signals';
import { rxInsertObservables } from './rx-insert-observables';
import { lastValueFrom, Observable, take, toArray } from 'rxjs';
import { ResourceStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('insertObservable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should expose observable outputs for query', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserQuery } = globalQueries({
        queries: {
          user: {
            query: () =>
              query(
                {
                  params: () => ({ id: '1' }),
                  loader: async ({ params }) => {
                    await wait(10000);
                    return { name: 'User' + params.id };
                  },
                },
                rxInsertObservables
              ),
          },
        },
      });

      const result = injectUserQuery();
      const finalResult = result.data$;

      expectTypeOf(finalResult).toEqualTypeOf<
        Observable<{
          value: { name: string } | undefined;
          status: ResourceStatus;
          error: unknown | undefined;
        }>
      >();

      const allDataPromise = lastValueFrom(
        finalResult.pipe(take(2), toArray())
      );

      // avancer le temps simulé → débloque le loader
      await vi.runAllTimersAsync();

      const allData = await allDataPromise;
      console.log('allData', allData);

      expect(allData).toBeDefined();
      expect(allData[0].status).toBe('loading');
      expect(allData[1].status).toBe('resolved');
    });
  });

  it('should expose observable outputs for queryById', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserQueryById } = globalQueries({
        queriesById: {
          user: {
            queryById: () =>
              queryById(
                {
                  params: () => ({
                    id: '1',
                  }),
                  identifier: (params) => params.id,
                  loader: async ({ params }) => {
                    await wait(10000);
                    return {
                      id: params.id,
                      name: 'Test Name',
                    };
                  },
                },
                rxInsertObservables
              ),
          },
        },
      });

      const result = injectUserQueryById();
      const finalResult = result.data$;

      expectTypeOf(finalResult).toEqualTypeOf<
        Observable<{
          id: string;
          value:
            | NoInfer<{
                id: string;
                name: string;
              }>
            | undefined;
          status: ResourceStatus;
          error: unknown | undefined;
        }>
      >();

      const allDataPromise = lastValueFrom(
        finalResult.pipe(take(2), toArray())
      );

      await vi.runAllTimersAsync();

      const allData = await allDataPromise;
      console.log('allData', allData);

      expect(allData).toBeDefined();
      expect(allData[0].status).toBe('loading');
      expect(allData[1].status).toBe('resolved');
    });
  });
});

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
