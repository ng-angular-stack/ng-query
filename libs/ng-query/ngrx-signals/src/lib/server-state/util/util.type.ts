import { Source } from '../source';
import { ReadonlySource } from './source.type';

export type FilterPrivateFields<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

export type ToConnectableSourceFromInject<Sources> = {
  [K in keyof Sources]: Sources[K] extends Source<infer SourceType>
    ? ReadonlySource<SourceType>
    : never;
};

export type ToConnectableMethodFromInject<Methods> = RemoveIndexSignature<{
  [K in keyof Methods]?: Methods[K] extends (payload: infer Payload) => any
    ? ReadonlySource<Payload>
    : never;
}>;

export type IsUnknown<T> = unknown extends T
  ? [T] extends [unknown]
    ? true
    : false
  : false;

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : symbol extends K
    ? never
    : K]: T[K];
};

export type ExcludeCommonKeys<Origin, Target> = {
  [key in keyof Origin as key extends keyof Target ? never : key]: Origin[key];
};
