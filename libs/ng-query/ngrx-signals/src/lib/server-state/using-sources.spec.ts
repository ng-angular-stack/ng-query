import { usingQuery } from './using-query';
import { serverState } from './server-state';
import { query } from '../query';
import { usingInputs } from './using-inputs';
import { ApplicationRef, computed, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { usingSources } from './using-sources';
import { source, Source } from './source';
import { toSource } from './to-source';
import { computedSource } from './computed-source';
import { usingState } from './using-state';
import { on } from './on';

describe('usingSources', () => {
  // it('1- Should expose a way to set serverState inputs', async () => {
  //   await TestBed.runInInjectionContext(async () => {
  //     const { injectServerState } = serverState(
  //       usingSources({
  //         params: source<string>(),
  //         reset: source<string>(),
  //       }),
  //     );
  //     const myParamsInput = signal('1');
  //     const paramsSource = signal('1');
  //     const resetSource = source<{ id: string }>();
  //     const store = injectServerState({
  //       myParams: myParamsInput, // required
  //       connectParamsSourceTo: computedSource(
  //         resetSource,
  //         (sourceValue) => sourceValue.id
  //       ),
  //       // params: paramsSource, // not required
  //       // connectResetSourceTo: (resetSourceValue) => resetSourceValue.id,
  //     });

  //     store.setParams('1');

  //     expect(store.userQuery).toBeDefined();
  //     await vi.runAllTimersAsync();
  //     expect(store.userQuery.value()).toEqual({
  //       id: '1',
  //       name: 'John Doe',
  //       email: 'test@a.com',
  //     });
  //   });
  // });

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a way to use local sources', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        usingSources({
          increment: source<{}>(),
        }),
        usingState(
          'test',
          () => signal(0),
          ({ context: { increment }, state }) => ({
            increment: on(increment, () => state() + 1),
          })
        )
      );

      const store = injectServerState();
      appRef.tick();

      expect(store.test()).toEqual(0);

      store.setIncrement({});

      appRef.tick();
      expect(store.test()).toEqual(1);
    });
  });

  it('2- Should expose a way to call setXSource outside injection context', async () => {
    const { injectServerState, setIncrement } = serverState(
      usingSources({
        increment: source<{}>(),
      }),
      usingState(
        'test',
        () => signal(0),
        ({ context: { increment }, state }) => ({
          increment: on(increment, () => state() + 1),
        })
      )
    );
    await TestBed.runInInjectionContext(async () => {
      const store = injectServerState();

      expect(store.test()).toEqual(0);
    });

    setIncrement({});

    await TestBed.runInInjectionContext(async () => {
      const store = injectServerState();

      await vi.runAllTimersAsync();
      expect(store.test()).toEqual(1);
    });
  });
});
