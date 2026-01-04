import { effect, EffectRef, untracked } from '@angular/core';
import { Source } from './source';

export function afterRecomputation<State, SourceType>(
  source: Source<SourceType>,
  callback: (source: SourceType) => State
): EffectRef {
  const effectRef = effect(() => {
    const sourceValue = source();
    if (sourceValue !== undefined) {
      untracked(() => callback(sourceValue));
    }
  });
  return effectRef;
}
