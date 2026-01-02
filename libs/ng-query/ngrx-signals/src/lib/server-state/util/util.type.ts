import { UnionToTuple } from '../../types/util.type';
import { StoreConfigConstraints } from '../craft';
import { Source } from '../source';
import { ExtractSignalPropsAndMethods } from './extract-signal-props-and-methods';
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

export type IsEmptyObject<T> = keyof T extends never ? true : false;

export type ExcludeCommonKeys<Origin, Target> = {
  [key in keyof Origin as key extends keyof Target ? never : key]: Origin[key];
};

export const STORE_CONFIG_TOKEN = {
  NAME: '_STORE_NAME_',
  PROVIDED_IN: '_STORE_PROVIDED_IN_',
} as const;
export type StoreConfigToken = typeof STORE_CONFIG_TOKEN;

export type ReplaceStoreConfigToken<
  StandaloneOutputName extends string,
  StoreConfig extends StoreConfigConstraints
> = StandaloneOutputName extends `${infer StoreNamePrefix}${typeof STORE_CONFIG_TOKEN.NAME}${infer StoreNameSuffix}`
  ? ReplaceStoreConfigToken<
      `${StoreNamePrefix}${Capitalize<StoreConfig['name']>}${StoreNameSuffix}`,
      StoreConfig
    >
  : StandaloneOutputName extends `${infer StoreProvidedInPrefix}${typeof STORE_CONFIG_TOKEN.PROVIDED_IN}${infer StoreProvidedInSuffix}`
  ? ReplaceStoreConfigToken<
      `${StoreProvidedInPrefix}${Capitalize<
        StoreConfig['providedIn']
      >}${StoreProvidedInSuffix}`,
      StoreConfig
    >
  : StandaloneOutputName;

export type FilterMethodsBoundToSources<
  Methods extends {},
  Rest,
  MethodPrefix extends string,
  Acc = {}
> = Rest extends [infer First, ...infer Next]
  ? First extends keyof Methods
    ? Methods[First] extends {
        method: infer Method;
      }
      ? [Method] extends [ReadonlySource<infer SourceState>]
        ? FilterMethodsBoundToSources<Methods, Next, MethodPrefix, Acc>
        : FilterMethodsBoundToSources<
            Methods,
            Next,
            MethodPrefix,
            Acc & {
              [K in First as `${MethodPrefix}${Capitalize<string & K>}`]: [
                Method
              ] extends [Function]
                ? Method
                : never;
            }
          >
      : FilterMethodsBoundToSources<Methods, Next, MethodPrefix, Acc>
    : FilterMethodsBoundToSources<Methods, Next, MethodPrefix, Acc>
  : Acc;

export type FilterReadonlySource<Insertions> = {
  [K in keyof Insertions as Insertions[K] extends ReadonlySource<any>
    ? never
    : K]: Insertions[K];
};

// Helper type to defer evaluation and avoid infinite recursion
export type DeferredExtract<Insertions> = UnionToTuple<
  keyof Insertions
> extends infer Keys
  ? ExtractSignalPropsAndMethods<
      Insertions,
      Keys,
      { props: {}; methods: Record<string, Function> }
    >
  : never;

export type HasKeys<T> = T extends object
  ? keyof T extends never
    ? false
    : true
  : false;
