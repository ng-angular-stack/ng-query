import {
  resource,
  linkedSignal,
  ResourceRef,
  ResourceOptions,
} from '@angular/core';

export function preservedResource<T, R>(
  config: ResourceOptions<T, R>
): ResourceRef<T | undefined> {
  const original = resource(config);
  const originalCopy = { ...original };
  const preserved = linkedSignal({
    source: () => ({
      value: originalCopy.value(),
      status: originalCopy.status(),
      isLoading: originalCopy.isLoading(),
    }),
    computation: (current, previous) => {
      if (current.isLoading) {
        if (previous) {
          return previous.value;
        } else {
          return config.fallbackValue;
        }
      }
      return current.value;
    },
  });
  Object.assign(original, {
    value: preserved,
  });
  if (config.fallbackValue) {
    original.set(config.fallbackValue);
  }
  return original;
}
