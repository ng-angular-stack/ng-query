import { TestBed } from '@angular/core/testing';
import { serverState } from './server-state';
import { usingAsyncMethods } from './using-async-methods';
import { asyncMethod, AsyncMethodOutput } from './async-method';
import { Signal } from '@angular/core';

// todo async methods and query/mutations should expose source
// todo penser aux //asyncMethods
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
      store.searchChange(2000, 'test');
      expect(store.searchChange.status()).toBe('loading');
      await vi.runAllTimersAsync();
      expect(store.searchChange.status()).toBe('resolved');
      expect(store.searchChange.value()).toBe('test');
    });
  });
});

describe('asyncMethod types', () => {
  it('should infer correctly the types of asyncMethod', () => {
    const asyncMethodsOutput = usingAsyncMethods(() => ({
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
      filterChange: asyncMethod(
        {
          method: ({ filter }: { filter: string }) => ({
            filter,
          }),
          loader: async ({ params: { filter } }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { filter };
          },
        },
        () => ({
          additionalInsertion: 'injectedValue' as const,
        })
      ),
    }));

    type props = ReturnType<typeof asyncMethodsOutput>['props'];
    expectTypeOf<props>().toEqualTypeOf<{
      searchChange: {
        readonly value: Signal<
          | {
              searchChange: string;
            }
          | undefined
        >;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue(): boolean;
      };
      filterChange: {
        readonly value: Signal<
          | {
              filter: string;
            }
          | undefined
        >;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue(): boolean;
      } & {
        additionalInsertion: 'injectedValue';
      };
    }>();

    type methods = ReturnType<typeof asyncMethodsOutput>['methods'];
    expectTypeOf<methods>().toEqualTypeOf<{
      searchChange: (args: { timeToWait: number; searchChange: string }) => {
        timeToWait: number;
        searchChange: string;
      };
      filterChange: (args: { filter: string }) => {
        filter: string;
      };
    }>();
  });
});
