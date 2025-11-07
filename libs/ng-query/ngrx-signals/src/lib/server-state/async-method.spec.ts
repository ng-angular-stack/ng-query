import { usingAsyncMethods } from './using-async-methods';
import { asyncMethod } from './async-method';
import { Signal } from '@angular/core';
import { on } from './on';
import { source } from './source';
import { ReadonlySource } from './util/source.type';
import { TestBed } from '@angular/core/testing';
describe('asyncMethod', () => {
  it('should enable to define async methods and be called with a method', async () => {
    TestBed.runInInjectionContext(async () => {
      const myAsyncMethod = asyncMethod({
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
      });

      expect(myAsyncMethod.status()).toBe('idle');
      myAsyncMethod.method({
        searchChange: 'test',
        timeToWait: 1000,
      });
      expect(myAsyncMethod.status()).toBe('loading');
      await vi.runAllTimersAsync();
      expect(myAsyncMethod.status()).toBe('resolved');
      expect(myAsyncMethod.value()).toBe('test');
    });
  });
});

describe('asyncMethod types', () => {
  it('should infer correctly the types of asyncMethod', () => {
    TestBed.runInInjectionContext(() => {
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
          hasValue: () => boolean;
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
          hasValue: () => boolean;
          additionalInsertion: 'injectedValue';
        };
      }>();

      type methods = ReturnType<typeof asyncMethodsOutput>['methods'];
      expectTypeOf<methods>().toEqualTypeOf<
        {
          searchChange: (args: {
            timeToWait: number;
            searchChange: string;
          }) => {
            timeToWait: number;
            searchChange: string;
          };
        } & {
          filterChange: (args: { filter: string }) => {
            filter: string;
          };
        }
      >();
    });
  });

  it('should infer correctly the asyncMethod bind to a source type, and not exposed the method bind to a source', () => {
    TestBed.runInInjectionContext(() => {
      const searchSource = source<{ searchChange: string }>();
      const asyncMethodsOutput = usingAsyncMethods(() => ({
        // should enable to provide multiples status
        // should provide async method by id
        searchChange: asyncMethod({
          method: on(searchSource, (searchChange) => {
            return searchChange;
          }),
          loader: async ({ params: searchChange }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
                searchChange: unknown;
              }
            | undefined
          >;
          readonly status: Signal<string>;
          readonly error: Signal<Error | undefined>;
          readonly isLoading: Signal<boolean>;
          hasValue: () => boolean;
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
          hasValue: () => boolean;
          additionalInsertion: 'injectedValue';
        };
      }>();

      type methods = ReturnType<typeof asyncMethodsOutput>['methods'];
      //   ^?
      expectTypeOf<methods>().toEqualTypeOf<{
        filterChange: (args: { filter: string }) => {
          filter: string;
        };
      }>();
    });
  });

  it('should infer correctly the asyncMethod bind to a method', () => {
    TestBed.runInInjectionContext(() => {
      const _asyncMethodsOutput = asyncMethod({
        method: (searchChange: string) => {
          return searchChange;
        },
        loader: async ({ params: searchChange }) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return { searchChange };
        },
      });
      expectTypeOf<typeof _asyncMethodsOutput>().toEqualTypeOf<{
        method: (args: string) => string;
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
      }>();
    });
  });

  it('should infer correctly the asyncMethod bind to a source', () => {
    TestBed.runInInjectionContext(() => {
      const searchSource = source<{ searchChange: string }>();

      const _asyncMethodsOutput = asyncMethod({
        method: on(searchSource, (searchChange) => {
          return searchChange;
        }),
        loader: async ({ params: searchChange }) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return { searchChange };
        },
      });
      expectTypeOf<typeof _asyncMethodsOutput>().toEqualTypeOf<{
        method: ReadonlySource<{
          searchChange: string;
        }>;
        readonly value: Signal<
          | {
              searchChange: unknown;
            }
          | undefined
        >;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue(): boolean;
      }>();
    });
  });
});
