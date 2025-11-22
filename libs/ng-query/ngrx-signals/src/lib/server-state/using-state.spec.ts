import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { serverState } from './server-state';
import { usingSources } from './using-sources';
import { source } from './source';
import { usingState } from './using-state';
import { afterRecomputation } from './after-recomputation';

describe('usingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should enable to defined a state that react on sources and inputs and other states', async () => {
    await TestBed.runInInjectionContext(async () => {
      const globalReset = source<{}>();
      const { injectServerState } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingSources({
          reset: source<string>(),
        }),
        usingState(
          'numberList',
          () => signal([1]),
          ({ state, context: { reset } }) => {
            return {
              addNumber: (numberValue: number) => {
                console.log('addNumber numberValue', numberValue);
                const stateValue = state();
                return [...stateValue, numberValue];
              },
              reset: afterRecomputation(reset, (resetValue) => {
                expectTypeOf(resetValue).toEqualTypeOf<string>();
                return [];
              }),
              globalReset: afterRecomputation(globalReset, (resetValue) => {
                expectTypeOf(resetValue).toEqualTypeOf<{}>();
                return [42];
              }),
            };
          }
        )
      );
      const store = injectServerState();
      await vi.runAllTimersAsync();
      store.addNumber(2);

      expectTypeOf(store.numberList).toEqualTypeOf<Signal<number[]>>();

      expect(store.numberList()).toEqual([1, 2]);

      store.addNumber(3);
      expect(store.numberList()).toEqual([1, 2, 3]);

      store.setReset('localReset');
      await vi.runAllTimersAsync();
      expect(store.numberList()).toEqual([]);
      globalReset.set({});
      await vi.runAllTimersAsync();
      expect(store.numberList()).toEqual([42]);
    });
  });
});
