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
          }),
          {
            on: {
              saveMutation: {
                optimisticUpdate: ({ mutationParams }) => mutationParams,
              },
            },
          }
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
});
