import { computed, signal } from '@angular/core';
import { serverState } from './craft';
import { craftComputedStates } from './craft-computed';
import { TestBed } from '@angular/core/testing';
import { craftState } from './craft-state';

describe('craftComputed', () => {
  it('should enable to defined computed states', () => {
    const { injectServerState } = serverState(
      {
        name: '',
        providedIn: 'root',
      },
      craftComputedStates(() => ({
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
      {
        name: '',
        providedIn: 'root',
      },
      craftState('firstName', () => signal('John')),
      craftComputedStates(({ firstName }) => ({
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
