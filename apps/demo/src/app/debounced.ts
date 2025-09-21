import { effect, signal, Signal } from '@angular/core';

// Inspired from https://stackoverflow.com/questions/76597307/angular-signals-debounce-in-effect

export type DebounceStatus = 'loading' | 'resolved' | 'idle';

export interface DebouncedSignal<T> {
  value: Signal<T>;
  status: Signal<DebounceStatus>;
}

export function debouncedSignal<T>(
  sourceSignal: Signal<T>,
  debounceTimeInMs = 0
): DebouncedSignal<T> {
  const debouncedValue = signal(sourceSignal());
  const status = signal<'loading' | 'resolved' | 'idle'>('idle');
  effect(
    (onCleanup) => {
      const value = sourceSignal();
      status.set('loading');
      const timeout = setTimeout(() => {
        debouncedValue.set(value);
        status.set('resolved');
      }, debounceTimeInMs);

      // The `onCleanup` argument is a function which is called when the effect
      // runs again (and when it is destroyed).
      // By clearing the timeout here we achieve proper debouncing.
      // See https://angular.io/guide/signals#effect-cleanup-functions
      onCleanup(() => clearTimeout(timeout));
    },
    { allowSignalWrites: true }
  );
  return {
    value: debouncedValue,
    status,
  };
}
