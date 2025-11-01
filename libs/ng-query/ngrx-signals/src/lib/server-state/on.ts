import { Source } from './source';
import { toSource } from './to-source';
import { ReadonlySource } from './util/source.type';

export function on<State, SourceType>(
  source: Source<SourceType>,
  reducer: (source: SourceType) => State
): ReadonlySource<State> {
  return toSource(source, {
    computed: (sourceValue) => reducer(sourceValue as SourceType),
  }) as ReadonlySource<State>;
}
