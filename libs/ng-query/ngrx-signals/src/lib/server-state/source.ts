import { linkedSignal, Signal, signal, ValueEqualityFn } from '@angular/core';

export interface Source<T> extends Signal<T | undefined> {
  set: (value: T) => void;
  preserveLastValue: Signal<T | undefined>;
}

export function source<T>(options?: {
  equal?: ValueEqualityFn<NoInfer<T> | undefined>;
  debugName?: string;
}): Source<T> {
  const sourceState = signal<T | undefined>(undefined, {
    ...(options?.equal && { equal: options?.equal }), // add the equal function here, it may helps to detect changes when using scalar values
    ...(options?.debugName && {
      debugName: options?.debugName + '_sourceState',
    }),
  });

  const listener = (listenerOptions: { nullishFirstValue?: boolean }) =>
    linkedSignal<T, T | undefined>({
      source: sourceState as Signal<T>,
      computation: (currentSourceState, previousData) => {
        // always when first listened return undefined
        if (!previousData && listenerOptions?.nullishFirstValue !== false) {
          return undefined;
        }

        return currentSourceState;
      },
      ...(options?.equal && { equal: options?.equal }),
      ...(options?.debugName && { debugName: options?.debugName }),
    });
  return Object.assign(
    listener({
      nullishFirstValue: true,
    }),
    {
      preserveLastValue: listener({
        nullishFirstValue: false,
      }),
      set: sourceState.set,
    }
  ) as Source<T>;
}
