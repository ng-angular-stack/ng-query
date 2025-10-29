import { linkedSignal, Signal, ValueEqualityFn } from '@angular/core';
import { ReadonlySource } from './util/source.type';
import { Source } from './source';

export function computedSource<SourceState, ComputedValue>(
  signalOrigin: Source<SourceState> | ReadonlySource<SourceState>,
  computedFn: (sourceValue: NoInfer<SourceState>) => ComputedValue,
  options?: {
    equal?: ValueEqualityFn<NoInfer<ComputedValue> | undefined>;
    debugName?: string;
  }
): ReadonlySource<ComputedValue> {
  const sourceState = linkedSignal<ComputedValue | undefined>(
    computedFn(
      //@ts-expect-error I do not understand why ts is complaining here
      () => computedFn(signalOrigin()) as ComputedValue
    ) as Signal<ComputedValue>,
    {
      ...(options?.equal && { equal: options?.equal }), // add the equal function here, it may helps to detect changes when using scalar values
      ...(options?.debugName && {
        debugName: options?.debugName + '_computedSourceState',
      }),
    }
  );

  const listener = (listenerOptions: { nullishFirstValue?: boolean }) =>
    linkedSignal<ComputedValue, ComputedValue | undefined>({
      source: sourceState as Signal<ComputedValue>,
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
  ) as ReadonlySource<any>;
}
