import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import {
  craft,
  EmptyContext,
  MergeTwoContexts,
  partialContext,
  PartialContext,
} from './craft';
import { mutation } from '../mutation';
import { mutationById } from '../mutation-by-id';
import { queryById } from '../query-by-id';
import {
  inject,
  linkedSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  craftQueryParams,
  QueryParamNavigationOptions,
  QueryParamProps,
  QueryParamsToState,
  SpecificCraftQueryParamsOutputs,
} from './craft-query-params';
import { craftInputs } from './craft-inputs';
import { craftState } from './craft-state';
import { Source, source } from './source';
import { craftSources, SourceSetterMethods } from './craft-sources';
import { afterRecomputation } from './after-recomputation';
import { IsAny } from '../types/util.type';
import { craftSetAllQueriesParamsStandalone } from './craft-set-all-queries-params-standalone';
import { Prettify } from '@ngrx/signals';
import { craftMutation } from './craft-mutation';
import { craftQuery } from './craft-query';
import { craftMutationById } from './craft-mutation-by-id';
import { craftQueryById } from './craft-query-by-id';
import { ExcludeCommonKeys } from './util/util.type';
import { ReadonlySource } from './util/source.type';

describe('craft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should enable creating queries and mutations', async () => {
    const { injectCraft, __META_STORE_CONTEXT } = craft(
      {
        name: '',
        providedIn: 'root',
      },
      craftMutation('save', () =>
        mutation({
          method: (data: { id: number; name: string }) => data,
          loader: async ({ params }) => params,
        })
      ),
      craftQuery('test', () =>
        query({
          params: () => 5,
          loader: async ({ params: id }) => ({ id, name: 'test' }),
        })
      ),
      craftQuery('test2', () =>
        query({
          params: () => 3,
          loader: async ({ params: id }) => ({ id, name: 'test2' }),
        })
      )
    );
    await TestBed.runInInjectionContext(async () => {
      const testServerState = injectCraft();

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
      const { injectCraft } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftMutation('save', () =>
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
        craftQuery(
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
      const state = injectCraft();
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
      const { injectCraft } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftMutationById('save', () =>
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
        craftQuery(
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
      const q = injectCraft();
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

  it('should enable declaring useMutationById and craftQueryById', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectCraft } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftMutationById('save', () =>
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
        craftQueryById(
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
      const q = injectCraft();
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
    const { injectCraft, setPaginationQueryParams } = craft(
      {
        name: '',
        providedIn: 'root',
      },
      craftQueryParams('pagination', () => ({
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

  it('should enable to bind the inputs and the outputs of the store when using injectCraft', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectCraft } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftInputs({
          myParams: undefined as number | undefined,
        }),
        craftSources({
          reset: source<string>(),
        }),
        craftState(
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
              reset: afterRecomputation(reset, () => {
                return [];
              }),
            };
          }
        )
      );

      const addNumberSource = source<number>();
      const resetSource = source<string>();
      const store = injectCraft({
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
      const { craftStore1 } = craft(
        {
          name: 'store1',
          providedIn: 'root',
        },
        craftInputs({
          myParams1: undefined as string | undefined,
          myParams2: undefined as string | undefined,
        }),
        craftSources({
          reset: source<string>(),
        }),
        craftState(
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
              reset: afterRecomputation(reset, () => {
                return [];
              }),
            };
          }
        ),
        craftQueryParams('pagination', () => ({
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

      const {
        injectCraft,
        setPaginationQueryParams,
        __META_STORE_CONTEXT,
        _inputs,
      } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftInputs({
          myParams: undefined as string | undefined,
        }),
        craftSources({
          reset: source<string>(),
        }),
        craftStore1(({ myParams, reset }) => ({
          // here myParams2 is not required, but required when injecting the hist store
          inputs: {
            myParams1: myParams,
          },
          methods: {
            setReset: reset,
          },
        })),
        craftState(
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
              reset2: afterRecomputation(reset, () => {
                return [];
              }),
            };
          }
        )
      );
      type test = (typeof __META_STORE_CONTEXT)['context']['_inputs'];
      const addNumberSource = source<number>();
      const resetSource = source<string>();
      const store = injectCraft({
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
    const { craftDataPagination } = craft(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      craftState(
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

    const { injectHost1Craft } = craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset }) => ({
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2Craft } = craft(
      {
        name: 'host2',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset }) => ({
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1Craft();
    const host2 = injectHost2Craft();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1, 2]);
  });

  it('should enable to plug local store to another. The plugged local store will not share an unique instance', async () => {
    const { craftSharedFeature } = craft(
      {
        name: 'sharedFeature',
        providedIn: 'scoped',
      },
      craftInputs({
        defaultNumber: undefined as number | undefined,
      }),
      craftState(
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

    const { injectHost1Craft } = craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftSharedFeature(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2Craft } = craft(
      {
        name: 'host2',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftSharedFeature(({ reset, counter }) => ({
        inputs: {
          defaultNumber: counter,
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1Craft();
    const host2 = injectHost2Craft();

    host1.addNumber();
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1]);
  });
  it('should enable to plug feature store to another. The plugged feature store will not share an unique instance', async () => {
    const { craftDataPagination } = craft(
      {
        name: 'dataPagination',
        providedIn: 'feature',
      },
      craftState(
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

    const { injectHost1Craft } = craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset }) => ({
        methods: {
          reset,
        },
      }))
    );

    const { injectHost2Craft } = craft(
      {
        name: 'host2',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset }) => ({
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1Craft();
    const host2 = injectHost2Craft();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1]);
  });

  it('should enable to plug global store to another. It is possible to not propagate the non set inputs (because, they can come from another place)', async () => {
    const { craftDataPagination } = craft(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      craftInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      craftState(
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

    const { injectHost1Craft, _HOST1_META_STORE_CONTEXT } = craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
        },
        methods: {
          reset,
        },
      }))
    );

    type r =
      (typeof _HOST1_META_STORE_CONTEXT)['context']['_dependencies']['dataPagination'];

    const { injectHost2Craft } = craft(
      {
        name: 'host2',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: 'EXTERNALLY_PROVIDED',
        },
        methods: {
          reset,
        },
      }))
    );
    const host1 = injectHost1Craft();
    // 👇 no error, because shouldNotBeExposed is not propagated
    const host2 = injectHost2Craft();

    host1.addNumber(2);
    expect(host1.numberList()).toEqual([1, 2]);
    expect(host2.numberList()).toEqual([1, 2]);
  });

  it('should enable to plug global store to another. It is possible to not propagate the non set inputs (because, they can come from another place)', async () => {
    const { craftDataPagination, _DATAPAGINATION_META_STORE_CONTEXT } = craft(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      craftInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      craftState(
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
      storeConfig: {
        providedIn: 'root';
        name: 'dataPagination';
      };
      context: {
        methods: {
          addNumber: (numberValue: number) => number[];
          reset: () => never[];
        } & Record<string, Function>;
        props: {
          numberList: Signal<number[]>;
        };
        _inputs: {
          shouldNotBeExposed: Signal<number | undefined>;
        };
        _injections: {};
        _mutation: {};
        _query: {};
        _queryParams: {};
        _sources: {};
        _asyncMethods: {};
        _cloudProxy: {};
        _dependencies: {};
      };
    }>();

    const { injectHost1Craft, _HOST1_META_STORE_CONTEXT } = craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      craftDataPagination(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
          // test21: true,
        },
        methods: {
          reset,
        },
      }))
    );
    type t = Pick<
      (typeof _HOST1_META_STORE_CONTEXT)['context'],
      '_dependencies'
    >;
    expectTypeOf<
      (typeof _HOST1_META_STORE_CONTEXT)['storeConfig']
    >().toEqualTypeOf<{
      providedIn: 'root';
      name: 'host1';
    }>();

    expectTypeOf<
      (typeof _HOST1_META_STORE_CONTEXT)['context']['_dependencies']['dataPagination']['storeConfig']
    >().toEqualTypeOf<{
      providedIn: 'root';
      name: 'dataPagination';
    }>();

    const host1 = injectHost1Craft();

    host1.addNumber(2);
    host1.reset();
    expect(host1.numberList()).toEqual([1, 2]);
  });

  it('Typing: should add errorMethodMsg property  with the message You are trying to add methods that are not defined in the connected store..., If the connected methods name does not match', async () => {
    const { craftDataPagination, _DATAPAGINATION_META_STORE_CONTEXT } = craft(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      craftInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      craftState(
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
      storeConfig: {
        providedIn: 'root';
        name: 'dataPagination';
      };
      context: {
        methods: {
          addNumber: (numberValue: number) => number[];
          reset: () => never[];
        } & Record<string, Function>;
        props: {
          numberList: Signal<number[]>;
        };
        _inputs: {
          shouldNotBeExposed: Signal<number | undefined>;
        };
        _injections: {};
        _mutation: {};
        _query: {};
        _queryParams: {};
        _sources: {};
        _asyncMethods: {};
        _cloudProxy: {};
        _dependencies: {};
      };
    }>();

    craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      //@ts-expect-error test2 is not defined in the connected store methods, so errorMethodMsg is required
      craftDataPagination(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
        },
        methods: {
          reset,
          test2: true,
        },
      }))
    );
  });

  it('Typing: should add errorMethodMsg property  with the message You are trying to add methods that are not defined in the connected store..., If the connected methods name does not match', async () => {
    const { craftDataPagination, _DATAPAGINATION_META_STORE_CONTEXT } = craft(
      {
        name: 'dataPagination',
        providedIn: 'root',
      },
      craftInputs({
        shouldNotBeExposed: undefined as number | undefined,
      }),
      craftState(
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
      storeConfig: {
        providedIn: 'root';
        name: 'dataPagination';
      };
      context: {
        methods: {
          addNumber: (numberValue: number) => number[];
          reset: () => never[];
        } & Record<string, Function>;
        props: {
          numberList: Signal<number[]>;
        };
        _inputs: {
          shouldNotBeExposed: Signal<number | undefined>;
        };
        _injections: {};
        _mutation: {};
        _query: {};
        _queryParams: {};
        _sources: {};
        _asyncMethods: {};
        _cloudProxy: {};
        _dependencies: {};
      };
    }>();

    craft(
      {
        name: 'host1',
        providedIn: 'root',
      },
      craftSources({
        increment: source<{}>(),
        decrement: source<{}>(),
        reset: source<{}>(),
      }),
      craftState(
        'counter',
        () => signal(0),
        ({ context: { increment, decrement }, state }) => ({
          increment: afterRecomputation(increment, () => state() + 1),
          decrement: afterRecomputation(decrement, () => state() - 1),
          reset: () => 0,
        })
      ),
      //@ts-expect-error testNotExist is not defined in the connected store inputs, so errorInputMsg is required
      craftDataPagination(({ reset, counter }) => ({
        inputs: {
          shouldNotBeExposed: counter,
          testNotExist: true,
        },
        methods: {
          reset,
        },
      }))
    );
  });
});

describe('craft metadata', () => {
  const { _SHARED_META_STORE_CONTEXT, craftShared } = craft(
    {
      name: 'shared',
      providedIn: 'feature',
    },
    craftState(
      'test',
      () => signal(1),
      ({ state }) => ({
        increment: () => state() + 1,
      })
    )
  );
  expectTypeOf(_SHARED_META_STORE_CONTEXT).toEqualTypeOf<{
    storeConfig: {
      providedIn: 'feature';
      name: 'shared';
    };
    context: {
      methods: {
        increment: () => number;
      } & Record<string, Function>;
      props: {
        test: Signal<number>;
      };
      _inputs: {};
      _injections: {};
      _mutation: {};
      _query: {};
      _queryParams: {};
      _sources: {};
      _asyncMethods: {};
      _cloudProxy: {};
      _dependencies: {};
    };
  }>();

  const { _DATA_META_STORE_CONTEXT } = craft(
    {
      name: 'data',
      providedIn: 'root',
    },
    craftShared()
  );
  expectTypeOf(
    _DATA_META_STORE_CONTEXT['context']['_dependencies']['shared']
  ).toEqualTypeOf(_SHARED_META_STORE_CONTEXT);
});

describe('craft options', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should provide the store in the root injector when providedIn is "root"', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectUserCraft } = craft(
        {
          name: 'user',
          providedIn: 'root',
        },
        craftMutation('save', () =>
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        craftQuery('test', () =>
          query({
            params: () => 5,
            loader: async ({ params: id }) => ({ id, name: 'test' }),
          })
        ),
        craftQuery('test2', () =>
          query({
            params: () => 3,
            loader: async ({ params: id }) => ({ id, name: 'test2' }),
          })
        )
      );
      const userServerState = injectUserCraft();
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
      const { injectUserCraft, UserCraft } = craft(
        {
          name: 'user',
          providedIn: 'root',
        },
        craftMutation('save', () =>
          mutation({
            method: (data: { id: number; name: string }) => data,
            loader: async ({ params }) => params,
          })
        ),
        craftQuery('test', () =>
          query({
            params: () => 5,
            loader: async ({ params: id }) => ({ id, name: 'test' }),
          })
        ),
        craftQuery('test2', () =>
          query({
            params: () => 3,
            loader: async ({ params: id }) => ({ id, name: 'test2' }),
          })
        )
      );
      const userServerState = injectUserCraft();
      const sameUserServerState = inject(UserCraft);
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

describe('craft preserve all context', () => {
  it('should preserve the context when using craft', async () => {
    await TestBed.runInInjectionContext(async () => {
      craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          }
      );
      craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          }
      );
      craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          }
      );
      craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
          ({ context }, injector, storeConfig) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return EmptyContext;
          },
        () =>
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

  it('should preserve the context when using craft', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { _TEST_META_STORE_CONTEXT } = craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        craftQueryParams('activeId', () => ({
          active: {
            defaultValue: undefined,
            parse: (value: string) => value,
            serialize: (value) => String(value),
          },
        })),
        () => (contextData, injector, storeConfig) => {
          expectTypeOf(storeConfig).toEqualTypeOf<{
            name: 'test';
            providedIn: 'root';
          }>();
          return EmptyContext;
        }
      );
      type t = Prettify<
        Pick<(typeof _TEST_META_STORE_CONTEXT)['context'], '_queryParams'>
      >;
      expectTypeOf(_TEST_META_STORE_CONTEXT).toEqualTypeOf<{
        storeConfig: {
          providedIn: 'root';
          name: 'test';
        };
        context: {
          methods: {
            setActiveIdQueryParams: (
              params: Partial<{
                active: string;
              }>,
              options?: QueryParamNavigationOptions
            ) => void;
          } & {
            resetActiveIdQueryParams: (
              options?: QueryParamNavigationOptions
            ) => void;
          } & {
            [x: string]:
              | ((...args: any[]) => NoInfer<{
                  active: never;
                }>)
              | ReadonlySource<{
                  active: never;
                }>;
          } & Record<string, Function>;
          _inputs: {};
          props: QueryParamProps<{
            active: {
              defaultValue: undefined;
              parse: (value: string) => string;
              serialize: (value: unknown) => string;
            };
          }> & {
            activeId: Signal<{
              active: never;
            }>;
          };
          _injections: {};
          _mutation: {};
          _query: {};
          _queryParams: {
            activeId: {
              config: {
                active: {
                  defaultValue: undefined;
                  parse: (value: string) => string;
                  serialize: (value: unknown) => string;
                };
              };
              state: WritableSignal<
                QueryParamsToState<{
                  active: {
                    defaultValue: undefined;
                    parse: (value: string) => string;
                    serialize: (value: unknown) => string;
                  };
                }>
              >;
            };
          };
          _sources: {};
          _asyncMethods: {};
          _cloudProxy: {};
          _dependencies: {};
        };
      }>();
    });
  });

  it('should preserve the context "cloudProxy" when using craft', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { craftShared } = craft(
        {
          name: 'shared',
          providedIn: 'feature',
        },
        () => () => {
          return partialContext({
            _cloudProxy: {
              testPassingSharedValue: signal('share'),
            },
          }) as PartialContext<{
            _cloudProxy: {
              testPassingSharedValue: Signal<string>;
            };
          }>;
        }
      );
      const { _TEST_META_STORE_CONTEXT } = craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        (outOfInjectionContextCloudProxy) =>
          ({ context }, injector, storeConfig, cloudProxy) => {
            expectTypeOf(cloudProxy).toEqualTypeOf<{}>();
            return partialContext({
              _cloudProxy: {
                testPassingValue: signal('test'),
              },
            }) as PartialContext<{
              _cloudProxy: {
                testPassingValue: Signal<string>;
              };
            }>;
          },
        (outOfInjectionContextCloudProxy) => {
          expectTypeOf(outOfInjectionContextCloudProxy).toEqualTypeOf<{
            testPassingValue: Signal<string>;
          }>();
          return (contextData, injector, storeConfig, cloudProxy) => {
            expectTypeOf(cloudProxy).toEqualTypeOf<{
              testPassingValue: Signal<string>;
            }>();
            return partialContext({});
          };
        },
        craftShared()
      );
      expectTypeOf<
        Omit<(typeof _TEST_META_STORE_CONTEXT)['context'], '_dependencies'>
      >().toEqualTypeOf<{
        _inputs: ExcludeCommonKeys<{}, {}>;
        methods: Record<string, Function> &
          ExcludeCommonKeys<Record<string, Function>, {}>;
        props: {};
        _queryParams: {};
        _sources: {};
        _injections: {};
        _asyncMethods: {};
        _mutation: {};
        _query: {};
        _cloudProxy: {
          testPassingValue: Signal<string>;
        } & {
          testPassingSharedValue: Signal<string>;
        };
      }>();
    });
  });

  it('should preserve the context when used with `craftX`', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { craftMySharedFeature, _MYSHAREDFEATURE_META_STORE_CONTEXT } =
        craft(
          {
            name: 'mySharedFeature',
            providedIn: 'feature',
          },
          craftQueryParams('pagination', () => ({
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
      expectTypeOf<
        (typeof _MYSHAREDFEATURE_META_STORE_CONTEXT)['storeConfig']
      >().toEqualTypeOf<{
        providedIn: 'feature';
        name: 'mySharedFeature';
      }>();
      const { _TEST_META_STORE_CONTEXT } = craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        craftMySharedFeature(),
        (_cloudProxy) =>
          ({ context }, injector, storeConfig, _cloudProxy) => {
            expectTypeOf(storeConfig).toEqualTypeOf<{
              name: 'test';
              providedIn: 'root';
            }>();
            return {} as EmptyContext;
          }
      );
      type t = Pick<
        (typeof _TEST_META_STORE_CONTEXT)['context'],
        '_dependencies'
      >;
      expectTypeOf<
        (typeof _TEST_META_STORE_CONTEXT)['storeConfig']
      >().toEqualTypeOf<{
        providedIn: 'root';
        name: 'test';
      }>();
      expectTypeOf<
        (typeof _TEST_META_STORE_CONTEXT)['context']['_dependencies']['mySharedFeature']['storeConfig']
      >().toEqualTypeOf<{
        providedIn: 'feature';
        name: 'mySharedFeature';
      }>();
    });
  });
});

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
