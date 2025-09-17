import { ResourceStatus, signal, Signal } from '@angular/core';
import { insertPaginationPlaceholderData } from './insert-pagination-place-holder-data';
import { TestBed } from '@angular/core/testing';
import { globalQueries, queryById, QueryByIdRef } from '../../../src';

describe('insertPaginationPlaceholderData', () => {
  it('should return the data of the currentPage', () => {
    TestBed.runInInjectionContext(() => {
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
        insertPaginationPlaceholderData
      );
      const finalResult = result({} as any, {} as any);

      expectTypeOf(finalResult.queryByIdRef).toEqualTypeOf<
        QueryByIdRef<
          string,
          NoInfer<{
            id: string;
            name: string;
          }>,
          NoInfer<{
            id: string;
          }>,
          {
            currentPageData: Signal<
              | NoInfer<{
                  id: string;
                  name: string;
                }>
              | undefined
            >;
            currentPageStatus: Signal<ResourceStatus>;
            isPlaceHolderData: Signal<boolean>;
          }
        >
      >();
      expect(
        finalResult.queryByIdRef.insertionsOutputs.currentPageData
      ).toBeDefined();
    });
  });

  it('should return a placeholder data during loading', async () => {
    vi.useFakeTimers();
    await TestBed.runInInjectionContext(async () => {
      const pagination = signal(1);
      const { injectUsersQueryById } = globalQueries({
        queriesById: {
          users: {
            queryById: () =>
              queryById(
                {
                  params: pagination,
                  loader: async ({ params: pagination }) => {
                    await wait(10000);
                    return Promise.resolve([
                      {
                        name: 'User' + pagination,
                      },
                    ]);
                  },
                  identifier: (params) => params,
                },
                insertPaginationPlaceholderData
              ),
          },
        },
      });
      const userQuery = injectUsersQueryById();

      expect(userQuery.currentPageData()).toEqual(undefined);
      await vi.advanceTimersByTimeAsync(15000);
      expect(userQuery.currentPageData()).toEqual([{ name: 'User1' }]);
      pagination.set(2);
      await vi.advanceTimersByTimeAsync(5000);
      expect(userQuery.currentPageData()).toEqual([{ name: 'User1' }]);
      expect(userQuery.currentPageStatus()).toEqual('loading');
      await vi.advanceTimersByTimeAsync(7000);
      expect(userQuery.currentPageData()).toEqual([{ name: 'User2' }]);
      expect(userQuery.currentPageStatus()).toEqual('resolved');

      vi.restoreAllMocks();
    });
  });
});

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
