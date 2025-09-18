import { computed } from '@angular/core';
import { queryById } from '@ng-query/ngrx-signals';
import { TestBed } from '@angular/core/testing';
import { insertPrefetchNextData } from './insert-prefetch-next-data';

describe('insertPrefetchNextData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should prefetch next data', async () => {
    await TestBed.runInInjectionContext(async () => {
      const result = queryById(
        {
          params: () => ({
            id: '1',
          }),
          identifier: (params) => params.id,
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Test Name',
            };
          },
        },
        insertPrefetchNextData((context) => ({
          hasNextData: computed(() => {
            console.log('hasNextData');
            return context.resourceParamsSrc()?.id === '1';
          }),
          nextParams: () => ({
            ...context.resourceParamsSrc(),
            id: '2',
          }),
        }))
      );
      const finalResult = result({} as any, {} as any);

      await vi.runAllTimersAsync();
      const nextStatus = finalResult.queryByIdRef.insertionsOutputs
        .nextResource()
        ?.status();
      expect(nextStatus).toBe('resolved');
    });
  });

  it('should enable to prefetch data', async () => {
    await TestBed.runInInjectionContext(async () => {
      const result = queryById(
        {
          params: () => ({
            id: '1',
          }),
          identifier: (params) => params.id,
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Test Name',
            };
          },
        },
        insertPrefetchNextData((context) => ({
          hasNextData: computed(() => {
            return context.resourceParamsSrc()?.id === '1';
          }),
          nextParams: () => ({
            ...context.resourceParamsSrc(),
            id: '2',
          }),
        }))
      );
      const finalResult = result({} as any, {} as any);
      const prefetchedResource =
        finalResult.queryByIdRef.insertionsOutputs.prefetch({
          id: '3',
        });
      await vi.runAllTimersAsync();

      expect(prefetchedResource.status()).toBe('resolved');
    });
  });
});

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
