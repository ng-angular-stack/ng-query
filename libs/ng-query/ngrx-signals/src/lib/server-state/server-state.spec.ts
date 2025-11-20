import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import { EmptyContext, serverState } from './server-state';
import { usingQuery } from './using-query';
import { usingMutation } from './using-mutation';
import { mutation } from '../mutation';
import { mutationById } from '../mutation-by-id';
import { usingMutationById } from './using-mutation-by-id';
import { usingQueryById } from './using-query-by-id';
import { queryById } from '../query-by-id';
import { inject, linkedSignal, signal } from '@angular/core';
import { usingQueryParams } from './using-query-params';
import { usingInputs } from './using-inputs';
import { usingState } from './using-state';
import { source } from './source';
import { usingSources } from './using-sources';
import { on } from './on';
import { ReadonlySource } from './util/source.type';
import { Equal, Expect } from 'test-type';
import { IsAny } from '../types/util.type';
import { craftSetAllQueriesParamsStandalone } from './craft-set-all-queries-params-standalone';

describe('serverState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should enable creating queries and mutations', async () => {
    const { injectServerState } = serverState(
      {
        name: '',
        providedIn: 'root',
      },
      usingMutation('save', () =>
        mutation({
          method: (data: { id: number; name: string }) => data,
          loader: async ({ params }) => params,
        })
      ),
      usingQuery('test', () =>
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
    await TestBed.runInInjectionContext(async () => {
      const testServerState = injectServerState();

      await vi.runAllTimersAsync();
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
        {
          name: '',
          providedIn: 'root',
        },
        usingMutation('save', () =>
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
          () =>
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
        {
          name: '',
          providedIn: 'root',
        },
        usingMutationById('save', () =>
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
          () =>
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
        {
          name: '',
          providedIn: 'root',
        },
        usingMutationById('save', () =>
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
          () =>
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

  it('should enable exporting standalone outputs', async () => {
    const { injectServerState, setPaginationQueryParams } = serverState(
      {
        name: '',
        providedIn: 'root',
      },
      usingQueryParams('pagination', () => ({
        page: {
          defaultValue: 1,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
        pageSize: {
          defaultValue: 10,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
      }))
    );

    expect(setPaginationQueryParams).toBeDefined();
  });

  it('should enable to bind the inputs and the outputs of the store when using injectServerState', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingInputs({
          myParams: undefined as number | undefined,
        }),
        usingSources({
          reset: source<string>(),
        }),
        usingState(
          'numberList',
          ({ myParams }) => linkedSignal(() => [myParams() ?? 0]),
          ({ state, context: { reset } }) => {
            return {
              addNumber: (numberValue: number) => {
                console.log('addNumber numberValue', numberValue);
                const stateValue = state();
                return [...stateValue, numberValue];
              },
              filterNumber: (filterValue: number) => {
                const stateValue = state();
                return stateValue.filter((num) => num !== filterValue);
              },
              reset: on(reset, () => {
                return [];
              }),
            };
          }
        )
      );

      const addNumberSource = source<number>();
      const resetSource = source<string>();
      const store = injectServerState({
        inputs: {
          myParams: signal(10),
        },
        methods: {
          setReset: resetSource,
          addNumber: addNumberSource,
          // reset: resetSource,
          // addNumber: addNumberSource,
        },
        // sources: {
        //   reset: resetSource,
        // },
      });
      expectTypeOf<IsAny<typeof store>>().toEqualTypeOf<false>();

      expectTypeOf(store.filterNumber).toBeFunction();
      //@ts-expect-error it should not be exposed, because connected to a Source
      type resetNotExposed = (typeof store)['reset'];

      await vi.runAllTimersAsync();
      expect(store.numberList()).toEqual([10]);

      addNumberSource.set(2);
      expect(store.numberList()).toEqual([10, 2]);

      store.filterNumber(10);
      expect(store.numberList()).toEqual([2]);
    });
  });
  it('should enable to plug a store to another store. Standalone outputs should be transmitted. Inputs that are not bind should be transmitted', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { usingStore1ServerState } = serverState(
        {
          name: 'store1',
          providedIn: 'root',
        },
        usingInputs({
          myParams1: undefined as string | undefined,
          myParams2: undefined as string | undefined,
        }),
        usingSources({
          reset: source<string>(),
        }),
        usingState(
          'numberList1',
          () => signal([1]),
          ({ state, context: { reset } }) => {
            return {
              addNumber: (numberValue: number) => {
                const stateValue = state();
                return [...stateValue, numberValue];
              },
              filterNumber: (filterValue: number) => {
                const stateValue = state();
                return stateValue.filter((num) => num !== filterValue);
              },
              reset: on(reset, () => {
                return [];
              }),
            };
          }
        ),
        usingQueryParams('pagination', () => ({
          page: {
            defaultValue: 1,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
          pageSize: {
            defaultValue: 10,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
        }))
      );

      const { injectServerState, setPaginationQueryParams } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingInputs({
          myParams: undefined as string | undefined,
        }),
        usingSources({
          reset: source<string>(),
        }),
        usingStore1ServerState(({ myParams, reset }) => ({
          // here myParams2 is not required, but required when injecting the hist store
          inputs: {
            myParams1: myParams,
          },
          methods: {
            setReset: reset,
          },
        })),
        usingState(
          'numberList2',
          () => signal([1]),
          ({ state, context: { reset } }) => {
            return {
              addNumber2: (numberValue: number) => {
                console.log('addNumber numberValue', numberValue);
                const stateValue = state();
                return [...stateValue, numberValue];
              },
              filterNumber2: (filterValue: number) => {
                const stateValue = state();
                return stateValue.filter((num) => num !== filterValue);
              },
              reset2: on(reset, () => {
                return [];
              }),
            };
          }
        )
      );
      const addNumberSource = source<number>();
      const resetSource = source<string>();
      const store = injectServerState({
        inputs: {
          myParams: signal('PassMyParam'),
          // myParams2 must be provided here
          myParams2: signal('PassMyParam2'),
        },
        methods: {
          setReset: resetSource,
          addNumber: addNumberSource,
          addNumber2: addNumberSource,
          // reset: resetSource,
          // addNumber: addNumberSource,
        },
        // sources: {
        //   reset: resetSource,
        // },
      });
      expectTypeOf<IsAny<typeof store>>().toEqualTypeOf<false>();

      expectTypeOf(store.filterNumber).toBeFunction();
      expectTypeOf(store.filterNumber2).toBeFunction();
      //@ts-expect-error it should not be exposed, because connected to a Source
      type resetNotExposed = (typeof store)['reset'];

      // verify setPaginationQueryParams is exposed
      expectTypeOf<
        Parameters<typeof setPaginationQueryParams>[0]
      >().toEqualTypeOf<{
        page?: number | undefined;
        pageSize?: number | undefined;
      }>();
      expect(setPaginationQueryParams).toBeDefined();
    });
  });

  it('should enable to plug global store to another. The plugged global store will share an unique instance', async () => {
    const { usingDataPaginationServerState } = serverState(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      usingState(
        'numberList',
        () => signal([1]),
        ({ state }) => ({
          addNumber: (numberValue: number) => {
            const stateValue = state();
            return [...stateValue, numberValue];
          },
          reset: () => {
            return [];
          },
        })
      )
    );

    const { injectHost1ServerState } = serverState(
      {
        name: 'host1',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2ServerState } = serverState(
      {
        name: 'host2',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1ServerState();
    const host2 = injectHost2ServerState();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1, 2]);
  });

  it('should enable to plug local store to another. The plugged local store will not share an unique instance', async () => {
    const { usingSharedFeatureServerState } = serverState(
      {
        name: 'sharedFeature',
        providedIn: 'scoped',
      },
      usingInputs({
        defaultNumber: undefined as number | undefined,
      }),
      usingState(
        'numberList',
        ({ defaultNumber }) => linkedSignal(() => [defaultNumber() ?? 1]),
        ({ state, context: { defaultNumber } }) => ({
          addNumber: () => [...state(), defaultNumber() ?? 1],
          reset: () => {
            return [];
          },
        })
      )
    );

    const { injectHost1ServerState } = serverState(
      {
        name: 'host1',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingSharedFeatureServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2ServerState } = serverState(
      {
        name: 'host2',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingSharedFeatureServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1ServerState();
    const host2 = injectHost2ServerState();

    host1.addNumber();
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1]);
  });
  it('should enable to plug feature store to another. The plugged feature store will not share an unique instance', async () => {
    const { usingDataPaginationServerState } = serverState(
      {
        name: 'dataPagination',
        providedIn: 'feature',
      },
      usingState(
        'numberList',
        () => signal([1]),
        ({ state }) => ({
          addNumber: (numberValue: number) => {
            const stateValue = state();
            return [...stateValue, numberValue];
          },
          reset: () => {
            return [];
          },
        })
      )
    );

    const { injectHost1ServerState } = serverState(
      {
        name: 'host1',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2ServerState } = serverState(
      {
        name: 'host2',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1ServerState();
    const host2 = injectHost2ServerState();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1]);
  });

  it('should enable to plug global store to another. It is possible to not propagate the non set inputs (because, they can come from another place)', async () => {
    const { usingDataPaginationServerState } = serverState(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      usingInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      usingState(
        'numberList',
        () => signal([1]),
        ({ state }) => ({
          addNumber: (numberValue: number) => {
            const stateValue = state();
            return [...stateValue, numberValue];
          },
          reset: () => {
            return [];
          },
        })
      )
    );

    const { injectHost1ServerState } = serverState(
      {
        name: 'host1',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2ServerState } = serverState(
      {
        name: 'host2',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: 'EXTERNALLY_PROVIDED',
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1ServerState();
    // 👇 no error, because shouldNotBeExposed is not propagated
    const host2 = injectHost2ServerState();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1, 2]);
  });

  it('should enable to plug global store to another. It is possible to not propagate the non set inputs (because, they can come from another place)', async () => {
    const {
      usingDataPaginationServerState,
      _DATAPAGINATION_META_STORE_CONTEXT,
    } = serverState(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      usingInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      usingState(
        'numberList',
        () => signal([1]),
        ({ state }) => ({
          addNumber: (numberValue: number) => {
            const stateValue = state();
            return [...stateValue, numberValue];
          },
          reset: () => {
            return [];
          },
        })
      )
    );

    expectTypeOf(_DATAPAGINATION_META_STORE_CONTEXT).toEqualTypeOf<{
      providedIn: 'root';
      name: 'dataPagination';
    }>();

    const { injectHost1ServerState, _HOST1_META_STORE_CONTEXT } = serverState(
      {
        name: 'host1',
        providedIn: 'root',
      },
      usingSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      usingState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: on(increment, () => state() + 1),
          decrement: on(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      usingDataPaginationServerState(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
        },
        methods: {
          reset,
        },
      }))
    );
    expectTypeOf(_HOST1_META_STORE_CONTEXT).toEqualTypeOf<{
      providedIn: 'root';
      name: 'host1';
    }>();

    const host1 = injectHost1ServerState();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
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
        {
          name: 'user',
          providedIn: 'root',
        },
        usingMutation('save', () =>
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        usingQuery('test', () =>
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

  it('should provide a shared store  by default', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserServerState, UserServerState } = serverState(
        {
          name: 'user',
          providedIn: 'root',
        },
        usingMutation('save', () =>
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        usingQuery('test', () =>
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
      const userServerState = injectUserServerState();
      const sameUserServerState = inject(UserServerState);
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

      expect(sameUserServerState.test2Query.value).toBeDefined();
      expect(userServerState.saveMutation.value()).toEqual({
        id: 3,
        name: 'test',
      });
    });
  });
});

describe('serverState preserve all context', () => {
  it('should preserve the context when using serverState', async () => {
    await TestBed.runInInjectionContext(async () => {
      serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
      serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
      serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
      serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        },
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
    });
  });

  it('should preserve the context when using serverState', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { _TEST_META_STORE_CONTEXT } = serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        usingQueryParams('activeId', () => ({
          active: {
            defaultValue: undefined,
            parse: (value: string) => value,
            serialize: (value) => String(value),
          },
        })),
        (contextData, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
      expectTypeOf(_TEST_META_STORE_CONTEXT).toEqualTypeOf<{
        providedIn: 'root';
        name: 'test';
      }>();
    });
  });

  it('should preserve the context when used with `usingServerState`', async () => {
    await TestBed.runInInjectionContext(async () => {
      const {
        usingMySharedFeatureServerState,
        _MYSHAREDFEATURE_META_STORE_CONTEXT,
      } = serverState(
        {
          name: 'mySharedFeature',
          providedIn: 'feature',
        },
        usingQueryParams('pagination', () => ({
          page: {
            defaultValue: 1,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
          pageSize: {
            defaultValue: 10,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
        }))
      );
      expectTypeOf(_MYSHAREDFEATURE_META_STORE_CONTEXT).toEqualTypeOf<{
        providedIn: 'feature';
        name: 'mySharedFeature';
      }>();
      const { _TEST_META_STORE_CONTEXT } = serverState(
        {
          name: 'test',
          providedIn: 'root',
        },
        // ({ context }, injector, storeConfig) => {
        //   expectTypeOf(storeConfig).toEqualTypeOf<{
        //     name: 'test';
        //     providedIn: 'root';
        //   }>();
        //   return {} as EmptyContext;
        // },
        usingMySharedFeatureServerState(),
        ({ context }, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return {} as EmptyContext;
        }
      );
      expectTypeOf(_TEST_META_STORE_CONTEXT).toEqualTypeOf<{
        providedIn: 'root';
        name: 'test';
      }>();
    });
  });
});

describe('Expose standalone setter all query params function', () => {
  it('should expose setAllXQueryParams in standalone outputs', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectTestServerState, setAllTestQueryParams, testconf } =
        serverState(
          {
            name: 'test',
            providedIn: 'root',
          },
          usingQueryParams('pagination', () => ({
            page: {
              defaultValue: 1,
              parse: (value: string) => parseInt(value, 10),
              serialize: (value: unknown) => String(value),
            },
            pageSize: {
              defaultValue: 10,
              parse: (value: string) => parseInt(value, 10),
              serialize: (value: unknown) => String(value),
            },
          })),
          usingQueryParams('activeId', () => ({
            active: {
              defaultValue: undefined,
              parse: (value: string) => value,
              serialize: (value) => String(value),
            },
          })),
          craftSetAllQueriesParamsStandalone()
          // ({ context }, injector, storeConfig) => {
          //   expectTypeOf(storeConfig).toEqualTypeOf<{
          //     name: 'test';
          //     providedIn: 'root';
          //   }>();
          //   return {} as EmptyContext;
          // }
        );

      expect(setAllTestQueryParams).toBeDefined();
      expectTypeOf<
        Parameters<typeof setAllTestQueryParams>[0]
      >().toEqualTypeOf<{
        pagination?: { page?: number; pageSize?: number } | undefined;
        activeId?: { active?: string | undefined } | undefined;
      }>();
    });
  });
});

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
