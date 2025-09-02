import {
  linkedSignal,
  ResourceRef,
} from '@angular/core';
import { rxResource, RxResourceOptions } from '@angular/core/rxjs-interop';

export function preservedRxResource<T, R>(
  config: RxResourceOptions<T, R>
): ResourceRef<T | undefined> {
  const original = rxResource(config);
  const originalCopy = { ...original };
  const preserved = linkedSignal({
    source: () => ({
      value: originalCopy.value(),
      status: originalCopy.status(),
      isLoading: originalCopy.isLoading(),
    }),
    computation: (current, previous) => {
      if (current.isLoading) {
        return previous?.value;
      }
      return current.value;
    },
  });
  Object.assign(original, {
    value: preserved,
  });
  return original;
}
