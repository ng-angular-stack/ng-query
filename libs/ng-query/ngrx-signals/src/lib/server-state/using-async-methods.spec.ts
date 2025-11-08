import { TestBed } from '@angular/core/testing';
import { serverState } from './server-state';
import { usingAsyncMethods } from './using-async-methods';
import { asyncMethod } from './async-method';

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
  it('should enable to define async methods that can update the state', async () => {
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
});
