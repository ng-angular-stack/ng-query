import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import { serverState } from './server-state';
import { usingQuery } from './using-query';
import { usingMutation } from './using-mutation';
import { mutation } from '../mutation';
import { mutationById } from '../mutation-by-id';
import { usingMutationById } from './using-mutation-by-id';
import { usingQueryById } from './using-query-by-id';
import { queryById } from '../query-by-id';

describe('serverState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should enable creating queries and mutations', async () => {
    await TestBed.runInInjectionContext(async () => {
      const q = serverState(
        usingMutation(
          'save',
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        usingQuery(
          'test',
          query({
            params: () => 5,
            loader: async ({ params: id }) => ({ id, name: 'test' }),
          })
        ),
        usingQuery('test2', () =>
          query({
            params: () => 3,
            loader: async ({ params: id }) => ({ id, name: 'test2' }),
          })
        )
      );
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQuery.value).toBeDefined();
      expect(q.testQuery.value()).toEqual({ id: 5, name: 'test' });
      expect(q.test2Query.value).toBeDefined();
      expect(q.test2Query.value()).toEqual({ id: 3, name: 'test2' });

      expect(q.mutateSave).toBeDefined();
      q.mutateSave({ id: 3, name: 'test' });
      await vi.runAllTimersAsync();
      expect(q.saveMutation.value()).toEqual({ id: 3, name: 'test' });
    });
  });

  it('a query can react to a mutation change', async () => {
    await TestBed.runInInjectionContext(async () => {
      const q = serverState(
        usingMutation(
          'save',
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => {
              if (params.name === 'error') {
                throw new Error('Error');
              }
              return params;
            },
          })
        ),
        usingQuery(
          'test',
          query({
            params: () => 3,
            loader: async ({ params: id }) => {
              await wait(10000);
              return { id, name: 'test' };
            },
          }),
          {
            on: {
              saveMutation: {
                optimisticUpdate: ({ mutationParams }) => mutationParams,
                reload: {
                  onMutationError: true,
                },
              },
            },
          }
        )
      );
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQuery.value).toBeDefined();
      expect(q.testQuery.value()).toEqual({ id: 3, name: 'test' });

      q.mutateSave({ id: 3, name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(q.testQuery.value()).toEqual({ id: 3, name: 'testMutated' });

      q.mutateSave({ id: 3, name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(q.testQuery.status()).toEqual('reloading');
    });
  });

  it('should enable declaring useMutationById and useQuery', async () => {
    await TestBed.runInInjectionContext(async () => {
      const q = serverState(
        usingMutationById(
          'save',
          mutationById({
            method: (data: { id: string; name: string }) => data,
            identifier: (params) => params.id,
            loader: async ({ params }) => {
              if (params.name === 'error') {
                throw new Error('Error');
              }
              return params;
            },
          })
        ),
        usingQuery(
          'test',
          query({
            params: () => '3',
            loader: async ({ params: id }) => {
              await wait(10000);
              return { id, name: 'test' };
            },
          }),
          {
            on: {
              saveMutationById: {
                filter: ({ mutationParams, queryResource }) =>
                  mutationParams.id === queryResource.value()?.id,
                optimisticUpdate: ({ mutationParams }) => mutationParams,
                reload: {
                  onMutationError: true,
                },
              },
            },
          }
        )
      );
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQuery.value).toBeDefined();
      expect(q.testQuery.value()).toEqual({ id: '3', name: 'test' });

      q.mutateSaveById({ id: '3', name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(q.testQuery.value()).toEqual({ id: 3, name: 'testMutated' });

      q.mutateSaveById({ id: '3', name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(q.testQuery.status()).toEqual('reloading');
    });
  });

  it('should enable declaring useMutationById and usingQueryById', async () => {
    await TestBed.runInInjectionContext(async () => {
      const q = serverState(
        usingMutationById(
          'save',
          mutationById({
            method: (data: { id: string; name: string }) => data,
            identifier: (params) => '' + params.id,
            loader: async ({ params }) => {
              if (params.name === 'error') {
                throw new Error('Error');
              }
              return params;
            },
          })
        ),
        usingQueryById(
          'test',
          queryById({
            params: () => '3',
            identifier: (data) => data,
            loader: async ({ params: id }) => {
              await wait(10000);
              return { id, name: 'test' };
            },
          }),
          {
            on: {
              saveMutationById: {
                filter: ({ mutationParams, queryIdentifier }) =>
                  mutationParams.id === queryIdentifier,
                optimisticUpdate: ({ mutationParams }) => mutationParams,
                reload: {
                  onMutationError: true,
                },
              },
            },
          }
        )
      );
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQueryById()['3']?.value).toBeDefined();
      expect(q.testQueryById()['3']?.value()).toEqual({ id: 3, name: 'test' });

      q.mutateSaveById({ id: '3', name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(q.testQueryById()['3']?.value()).toEqual({
        id: 3,
        name: 'testMutated',
      });

      q.mutateSaveById({ id: '3', name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(q.testQueryById()['3']?.status()).toEqual('reloading');
    });
  });
});

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
