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
import { inject } from '@angular/core';

describe('serverState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should enable creating queries and mutations', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
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
      const testServerState = injectServerState();
      expect(testServerState).toBeDefined();
      expect(testServerState.testQuery.value).toBeDefined();
      expect(testServerState.testQuery.value()).toEqual({
        id: 5,
        name: 'test',
      });
      expect(testServerState.test2Query.value).toBeDefined();
      expect(testServerState.test2Query.value()).toEqual({
        id: 3,
        name: 'test2',
      });

      expect(testServerState.mutateSave).toBeDefined();
      testServerState.mutateSave({ id: 3, name: 'test' });
      await vi.runAllTimersAsync();
      expect(testServerState.saveMutation.value()).toEqual({
        id: 3,
        name: 'test',
      });
    });
  });

  it('a query can react to a mutation change', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
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
      const state = injectServerState();
      await vi.runAllTimersAsync();
      expect(state).toBeDefined();
      expect(state.testQuery.value).toBeDefined();
      expect(state.testQuery.value()).toEqual({ id: 3, name: 'test' });

      state.mutateSave({ id: 3, name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(state.testQuery.value()).toEqual({ id: 3, name: 'testMutated' });

      state.mutateSave({ id: 3, name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(state.testQuery.status()).toEqual('reloading');
    });
  });

  it('should enable declaring useMutationById and useQuery', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
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
      const q = injectServerState();
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQuery.value).toBeDefined();
      expect(q.testQuery.value()).toEqual({ id: '3', name: 'test' });

      q.mutateSaveById({ id: '3', name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(q.testQuery.value()).toEqual({ id: '3', name: 'testMutated' });

      q.mutateSaveById({ id: '3', name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(q.testQuery.status()).toEqual('reloading');
    });
  });

  it('should enable declaring useMutationById and usingQueryById', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
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
      const q = injectServerState();
      await vi.runAllTimersAsync();
      expect(q).toBeDefined();
      expect(q.testQueryById()['3']?.value).toBeDefined();
      expect(q.testQueryById()['3']?.value()).toEqual({
        id: '3',
        name: 'test',
      });

      q.mutateSaveById({ id: '3', name: 'testMutated' });
      await vi.runAllTimersAsync();
      expect(q.testQueryById()['3']?.value()).toEqual({
        id: '3',
        name: 'testMutated',
      });

      q.mutateSaveById({ id: '3', name: 'error' });
      await vi.advanceTimersByTimeAsync(5000);
      expect(q.testQueryById()['3']?.status()).toEqual('reloading');
    });
  });
});

describe('serverState options', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should provide the store in the root injector when providedIn is "root"', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserServerState } = serverState(
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
        ),
        {
          name: 'user',
        }
      );
      const userServerState = injectUserServerState();
      // todo fix exposed functions
      await vi.runAllTimersAsync();
      expect(userServerState).toBeDefined();
      expect(userServerState.testQuery.value).toBeDefined();
      expect(userServerState.testQuery.value()).toEqual({
        id: 5,
        name: 'test',
      });
      expect(userServerState.test2Query.value).toBeDefined();
      expect(userServerState.test2Query.value()).toEqual({
        id: 3,
        name: 'test2',
      });

      expect(userServerState.mutateSave).toBeDefined();
      userServerState.mutateSave({ id: 3, name: 'test' });
      await vi.runAllTimersAsync();
      expect(userServerState.saveMutation.value()).toEqual({
        id: 3,
        name: 'test',
      });
    });
  });

  // todo test shared instance
  it('should provide a shared store  by default', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserServerState, UserServerState } = serverState(
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
        ),
        {
          name: 'user',
        }
      );
      const userServerState = injectUserServerState();
      await vi.runAllTimersAsync();
      expect(userServerState).toBeDefined();
      expect(userServerState.testQuery.value).toBeDefined();
      expect(userServerState.testQuery.value()).toEqual({
        id: 5,
        name: 'test',
      });
      expect(userServerState.test2Query.value).toBeDefined();
      expect(userServerState.test2Query.value()).toEqual({
        id: 3,
        name: 'test2',
      });

      expect(userServerState.mutateSave).toBeDefined();
      userServerState.mutateSave({ id: 3, name: 'test' });
      await vi.runAllTimersAsync();
      expect(userServerState.saveMutation.value()).toEqual({
        id: 3,
        name: 'test',
      });
      const sameUserServerState = inject(UserServerState);
      expect(sameUserServerState.test2Query.value).toBeDefined();
      expect(userServerState.saveMutation.value()).toEqual({
        id: 3,
        name: 'test',
      });
    });
  });
});

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
