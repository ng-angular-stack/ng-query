import { computed, signal } from '@angular/core';
import { serverState } from './server-state';
import { usingComputedStates } from './using-computed';
import { TestBed } from '@angular/core/testing';
import { usingState } from './using-state';

describe('usingComputed', () => {
  it('should enable to defined computed states', () => {
    const { injectServerState } = serverState(
      usingComputedStates(() => ({
        fullName: signal('John Doe'),
      }))
    );

    TestBed.runInInjectionContext(() => {
      const store = injectServerState();
      expect(store.fullName()).toBe('John Doe');
      expectTypeOf(store.fullName()).toEqualTypeOf<string>();
    });
  });

  it('should enable to defined computed states based on store states', () => {
    const { injectServerState } = serverState(
      usingState('firstName', () => signal('John')),
      usingComputedStates(({ firstName }) => ({
        fullName: computed(() => `${firstName()} Doe`),
        nameLength: computed(() => firstName().length),
      }))
    );

    TestBed.runInInjectionContext(() => {
      const store = injectServerState();
      expect(store.fullName()).toBe('John Doe');
      expectTypeOf(store.fullName()).toEqualTypeOf<string>();
      expect(store.nameLength()).toBe(4);
      expectTypeOf(store.nameLength()).toEqualTypeOf<number>();
    });
  });
});
