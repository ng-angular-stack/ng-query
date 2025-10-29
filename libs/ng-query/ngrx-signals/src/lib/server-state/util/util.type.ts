import { Source } from '../source';
import { ReadonlySource } from './source.type';

export type FilterPrivateFields<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

export type ToConnectableSource<Sources, State> = {
  [K in keyof Sources as `connectTo${Capitalize<
    string & K
  >}Source`]: Sources[K] extends Source<infer SourceType>
    ? <Expose extends boolean = false>(
        reducer: (source: SourceType) => State,
        options?: {
          expose?: Expose;
        }
      ) => () => State
    : never;
};

export type ToConnectableSourceFromInject<Sources> = {
  [K in keyof Sources as `connect${Capitalize<
    string & K
  >}SourceTo`]: Sources[K] extends Source<infer SourceType>
    ? ReadonlySource<SourceType>
    : never;
};

export type IsUnknown<T> = unknown extends T
  ? [T] extends [unknown]
    ? true
    : false
  : false;
