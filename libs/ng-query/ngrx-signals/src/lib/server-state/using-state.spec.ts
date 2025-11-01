import { linkedSignal, Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import { serverState } from './server-state';
import { usingInputs } from './using-inputs';
import { usingQuery } from './using-query';
import { usingSources } from './using-sources';
import { source } from './source';
import { usingState } from './using-state';
import { on } from './on';

describe('usingState', () => {
  it('should enable to defined a state that react on sources and inputs and other states', async () => {
    await TestBed.runInInjectionContext(async () => {
      const globalReset = source<{}>();
      const { injectServerState } = serverState(
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
              reset: on(reset, (resetValue) => {
                expectTypeOf(resetValue).toEqualTypeOf<string>();
                return [];
              }),
              globalReset: on(globalReset, (resetValue) => {
                expectTypeOf(resetValue).toEqualTypeOf<{}>();
                return [42];
              }),
            };
          }
        )
      );
      const store = injectServerState();
      store.addNumber(2);

      expectTypeOf(store.numberList).toEqualTypeOf<Signal<number[]>>();

      expect(store.numberList()).toEqual([1, 2]);

      store.addNumber(3);
      expect(store.numberList()).toEqual([1, 2, 3]);

      store.setReset('localReset');
      await flushMicrotasks();
      expect(store.numberList()).toEqual([]);
      globalReset.set({});
      expect(store.numberList()).toEqual([42]);
    });
  });
});

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
