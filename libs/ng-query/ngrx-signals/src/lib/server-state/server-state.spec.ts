import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import { serverState } from './server-state';
import { useQuery } from './use-query';
import { useMutation } from './use-mutation';
import { mutation } from '../mutation';

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
        useMutation(
          'save',
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        useQuery(
          'test',
          query({
            params: () => 5,
            loader: async ({ params: id }) => ({ id, name: 'test' }),
          })
        ),
        useQuery('test2', () =>
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
        useMutation(
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
        useQuery(
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
});

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
