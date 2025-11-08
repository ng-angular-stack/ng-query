import { AsyncMethodByIdRef, usingAsyncMethods } from './using-async-methods';
import { asyncMethod } from './async-method';
import { Signal } from '@angular/core';
import { on } from './on';
import { source } from './source';
import { ReadonlySource } from './util/source.type';
import { TestBed } from '@angular/core/testing';
import { Equal, Expect } from 'test-type';
describe('asyncMethod', () => {
  it('should enable to define async method and be called with a method', async () => {
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
          type ExpectTimeToWait = Expect<Equal<typeof timeToWait, number>>;
          type ExpectSearchChange = Expect<Equal<typeof searchChange, string>>;
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

  it('should enable to define async method bind to a source', async () => {
    TestBed.runInInjectionContext(async () => {
      const searchSource = source<{
        searchChange: string;
        timeToWait: number;
      }>();
      const test = on(searchSource, (searchConfig) => searchConfig);
      const result = test();
      const myAsyncMethod = asyncMethod({
        method: on(searchSource, (searchConfig) => searchConfig),
        loader: async ({ params: { timeToWait, searchChange } }) => {
          type ExpectTimeToWait = Expect<Equal<typeof timeToWait, number>>;
          type ExpectSearchChange = Expect<Equal<typeof searchChange, string>>;
          await new Promise((resolve) => setTimeout(resolve, timeToWait));
          return { searchChange };
        },
      });

      expect(myAsyncMethod.status()).toBe('idle');
      expectTypeOf(myAsyncMethod.source).toEqualTypeOf<
        ReadonlySource<{
          searchChange: string;
          timeToWait: number;
        }>
      >();
      searchSource.set({
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

describe('asyncMethod types without identifier', () => {
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
            type ExpectTimeToWait = Expect<Equal<typeof timeToWait, number>>;
            type ExpectSearchChange = Expect<
              Equal<typeof searchChange, string>
            >;
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
      type s = props['searchChange'];
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
          setSearchChange: (args: {
            timeToWait: number;
            searchChange: string;
          }) => {
            timeToWait: number;
            searchChange: string;
          };
        } & {
          setFilterChange: (args: { filter: string }) => {
            filter: string;
          };
        }
      >();
    });
  });

  it('should infer correctly the asyncMethod bind to a source type, and not exposed the method bind to a source', () => {
    TestBed.runInInjectionContext(() => {
      const searchSource = source<{ searchChangeText: string }>();
      const asyncMethodsOutput = usingAsyncMethods(() => ({
        // should enable to provide multiples status
        // should provide async method by id
        searchChange: asyncMethod({
          method: on(searchSource, (searchChange) => {
            return searchChange;
          }),
          loader: async ({ params: { searchChangeText } }) => {
            type ExpectSearchChangeText = Expect<
              Equal<typeof searchChangeText, string>
            >;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { searchChangeText };
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
          readonly error: Signal<Error | undefined>;
          readonly value: Signal<
            | {
                searchChangeText: string;
              }
            | undefined
          >;
          readonly status: Signal<string>;
          readonly isLoading: Signal<boolean>;
          hasValue: () => boolean;
          source: ReadonlySource<{
            searchChangeText: string;
          }>;
        };
        filterChange: {
          readonly error: Signal<Error | undefined>;
          readonly value: Signal<
            | {
                filter: string;
              }
            | undefined
          >;
          readonly status: Signal<string>;
          readonly isLoading: Signal<boolean>;
          hasValue: () => boolean;
          additionalInsertion: 'injectedValue';
        };
      }>();

      type methods = ReturnType<typeof asyncMethodsOutput>['methods'];
      //   ^?
      expectTypeOf<methods>().toEqualTypeOf<{
        setFilterChange: (args: { filter: string }) => {
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
        method: (args: string) => string;
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
          return { searchChangeResult: searchChange.searchChange };
        },
      });
      expectTypeOf<typeof _asyncMethodsOutput>().toEqualTypeOf<{
        readonly value: Signal<
          | {
              searchChangeResult: string;
            }
          | undefined
        >;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue: () => boolean;
        source: ReadonlySource<{
          searchChange: string;
        }>;
      }>();
    });
  });
});

describe('asyncMethod types with identifier', () => {
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
          identifier: (params) => params.searchChange,
          loader: async ({ params: { timeToWait, searchChange } }) => {
            type ExpectTimeToWait = Expect<Equal<typeof timeToWait, number>>;
            type ExpectSearchChange = Expect<
              Equal<typeof searchChange, string>
            >;
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
      type s = props['searchChange'];
      //.  ^?

      const searchType = {} as s;
      const signalValue = searchType();
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
          setSearchChange: (args: {
            timeToWait: number;
            searchChange: string;
          }) => {
            timeToWait: number;
            searchChange: string;
          };
        } & {
          setFilterChange: (args: { filter: string }) => {
            filter: string;
          };
        }
      >();
    });
  });

  it('should infer correctly the asyncMethod bind to a source type, and not exposed the method bind to a source', () => {
    TestBed.runInInjectionContext(() => {
      const searchSource = source<{ searchChangeText: string }>();
      const asyncMethodsOutput = usingAsyncMethods(() => ({
        // should enable to provide multiples status
        // should provide async method by id
        searchChange: asyncMethod({
          method: on(searchSource, (searchChange) => {
            return searchChange;
          }),
          loader: async ({ params: { searchChangeText } }) => {
            type ExpectSearchChangeText = Expect<
              Equal<typeof searchChangeText, string>
            >;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { searchChangeText };
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
          readonly error: Signal<Error | undefined>;
          readonly value: Signal<
            | {
                searchChangeText: string;
              }
            | undefined
          >;
          readonly status: Signal<string>;
          readonly isLoading: Signal<boolean>;
          hasValue: () => boolean;
          source: ReadonlySource<{
            searchChangeText: string;
          }>;
        };
        filterChange: {
          readonly error: Signal<Error | undefined>;
          readonly value: Signal<
            | {
                filter: string;
              }
            | undefined
          >;
          readonly status: Signal<string>;
          readonly isLoading: Signal<boolean>;
          hasValue: () => boolean;
          additionalInsertion: 'injectedValue';
        };
      }>();

      type methods = ReturnType<typeof asyncMethodsOutput>['methods'];
      //   ^?
      expectTypeOf<methods>().toEqualTypeOf<{
        setFilterChange: (args: { filter: string }) => {
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
        identifier: (searchChange) => searchChange,
        loader: async ({ params: searchChange }) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return { searchChange };
        },
      });
      const r = _asyncMethodsOutput()['test']?.value();
      expectTypeOf<typeof _asyncMethodsOutput>().toEqualTypeOf<{
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
        method: (args: string) => string;
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
          return { searchChangeResult: searchChange.searchChange };
        },
      });
      expectTypeOf<typeof _asyncMethodsOutput>().toEqualTypeOf<{
        readonly value: Signal<
          | {
              searchChangeResult: string;
            }
          | undefined
        >;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue: () => boolean;
        source: ReadonlySource<{
          searchChange: string;
        }>;
      }>();
    });
  });
});
