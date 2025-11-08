import { TestBed } from '@angular/core/testing';
import { serverState } from './server-state';
import { usingAsyncMethods } from './using-async-methods';
import { asyncMethod } from './async-method';
import { source } from './source';
import { on } from './on';
import { usingSources } from './using-sources';

// todo async methods and query/mutations should expose source
// todo penser aux //asyncMethodsById
// todo penser à toast service ?-)
describe('usingAsyncMethods', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should enable to define async method', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        usingAsyncMethods(() => ({
          // should enable to provide multiples status
          // should provide async method by id
          searchChange: asyncMethod({
            method: ({
              timeToWait,
              searchChange,
            }: {
              timeToWait: number;
              searchChange: string;
            }) => ({
              timeToWait,
              searchChange,
            }),
            loader: async ({ params: { timeToWait, searchChange } }) => {
              await new Promise((resolve) => setTimeout(resolve, timeToWait));
              return { searchChange };
            },
          }),
        }))
      );
      const store = injectServerState();
      expect(store.searchChange.status()).toBe('idle');
      store.setSearchChange({
        searchChange: 'test',
        timeToWait: 1000,
      });
      await vi.advanceTimersByTimeAsync(500);
      expect(store.searchChange.status()).toBe('loading');
      await vi.runAllTimersAsync();
      expect(store.searchChange.status()).toBe('resolved');
      expect(store.searchChange.value()).toEqual({ searchChange: 'test' });
    });
  });

  it('should enable to define async methods bind to a local and global source', async () => {
    await TestBed.runInInjectionContext(async () => {
      const myGlobalSource = source<{
        timeToWait: number;
        searchChange: string;
      }>();
      const { injectServerState } = serverState(
        usingSources({
          myLocalSource: source<{
            timeToWait: number;
            searchChange: string;
          }>(),
        }),
        usingAsyncMethods(({ myLocalSource }) => ({
          searchGlobalChange: asyncMethod({
            method: on(myGlobalSource, (payload) => payload),
            loader: async ({ params: { timeToWait, searchChange } }) => {
              await new Promise((resolve) => setTimeout(resolve, timeToWait));
              return { searchChange };
            },
          }),
          searchLocalChange: asyncMethod({
            method: on(myLocalSource, (payload) => payload),
            loader: async ({ params: { timeToWait, searchChange } }) => {
              await new Promise((resolve) => setTimeout(resolve, timeToWait));
              return { searchChange };
            },
          }),
        }))
      );
      const store = injectServerState();
      expect(store.searchGlobalChange.status()).toBe('idle');
      myGlobalSource.set({
        searchChange: 'global',
        timeToWait: 1000,
      });
      await vi.advanceTimersByTimeAsync(500);
      expect(store.searchGlobalChange.status()).toBe('loading');
      await vi.runAllTimersAsync();
      expect(store.searchGlobalChange.status()).toBe('resolved');
      expect(store.searchGlobalChange.value()).toEqual({
        searchChange: 'global',
      });

      expect(store.searchLocalChange.status()).toBe('idle');
      store.setMyLocalSource({
        searchChange: 'local',
        timeToWait: 1000,
      });
      await vi.advanceTimersByTimeAsync(500);
      expect(store.searchLocalChange.status()).toBe('loading');
      await vi.runAllTimersAsync();
      expect(store.searchLocalChange.status()).toBe('resolved');
      expect(store.searchLocalChange.value()).toEqual({
        searchChange: 'local',
      });
    });
  });
});
