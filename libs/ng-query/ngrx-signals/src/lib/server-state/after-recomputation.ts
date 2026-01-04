import { effect, EffectRef, signal, untracked } from '@angular/core';
import { Source, source } from './source';
import { ReadonlySource } from './util/source.type';

export function afterRecomputation<State, SourceType>(
  _source: Source<SourceType>,
  callback: (source: SourceType) => State
): EffectRef & ReadonlySource<State> {
  const derivedSource = source<State>();
  // todo faire un linkedSignal et el retourner ?
  const effectRef = effect(() => {
    const sourceValue = _source();
    if (sourceValue !== undefined) {
      untracked(() => {
        const newState = callback(sourceValue);
        derivedSource.set(newState);
      });
    }
  });
  return Object.assign(effectRef, derivedSource);
}
