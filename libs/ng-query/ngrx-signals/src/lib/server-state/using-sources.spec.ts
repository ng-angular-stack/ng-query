import { serverState } from './server-state';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { usingSources } from './using-sources';
import { source } from './source';
import { usingState } from './using-state';
import { on } from './on';

describe('usingSources', () => {
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
    const appRef = TestBed.inject(ApplicationRef);
    const { injectServerState, setIncrement } = serverState(
      usingSources({
        increment: source<{}>(),
      }),
      usingState(
        'test',
        () => signal(0),
        ({ context: { increment }, state }) => ({
          increment: on(increment, () => {
            return state() + 1;
          }),
        })
      )
    );

    await TestBed.runInInjectionContext(async () => {
      const store = injectServerState({});

      expect(store.test()).toEqual(0);

      appRef.tick();
      setIncrement({});

      appRef.tick();

      expect(store.test()).toEqual(1);
    });
  });
});
