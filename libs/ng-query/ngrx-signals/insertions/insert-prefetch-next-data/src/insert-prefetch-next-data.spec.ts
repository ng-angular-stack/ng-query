import { ResourceStatus, signal, Signal } from '@angular/core';
import { queryById, QueryByIdRef, globalQueries } from '@ng-query/ngrx-signals';
import { TestBed } from '@angular/core/testing';
import { insertPrefectData } from '../../insert-prefect-data/src/insert-prefect-data';

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
        insertPrefectData
      );
      const finalResult = result({}, {} as any);

      // todo
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

      // todo
      vi.restoreAllMocks();
    });
  });
});

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
