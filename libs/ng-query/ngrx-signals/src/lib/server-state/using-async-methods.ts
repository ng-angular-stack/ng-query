import { Signal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { MergeObjects, UnionToTuple } from '../types/util.type';
import { ReadonlySource } from './util/source.type';
import { Prettify } from '@ngrx/signals';
import { capitalize } from './util/util';

type FilterMethodsBoundToSources<
  Methods extends {},
  Rest,
  Acc = {}
> = Rest extends [infer First, ...infer Next]
  ? First extends keyof Methods
    ? Methods[First] extends {
        method: infer Method;
      }
      ? [Method] extends [ReadonlySource<infer SourceState>]
        ? FilterMethodsBoundToSources<Methods, Next, Acc>
        : FilterMethodsBoundToSources<
            Methods,
            Next,
            Acc & {
              [K in First as `set${Capitalize<string & K>}`]: [Method] extends [
                Function
              ]
                ? Method
                : never;
            }
          >
      : FilterMethodsBoundToSources<Methods, Next, Acc>
    : FilterMethodsBoundToSources<Methods, Next, Acc>
  : Acc;

type SpecificUsingAsyncMethodsOutputs<AsyncMethods extends {}> = {
  props: {
    [key in keyof AsyncMethods]: Prettify<Omit<AsyncMethods[key], 'method'>>;
  };
  methods: FilterMethodsBoundToSources<
    AsyncMethods,
    UnionToTuple<keyof AsyncMethods>
  >;
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type UsingAsyncMethodsOutputs<
  Context extends ContextConstraints,
  AsyncMethods extends {}
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingAsyncMethodsOutputs<AsyncMethods>
>;

export type AsyncMethodRef<
  Value,
  ArgParams,
  Params,
  Insertions,
  IsMethod,
  SourceParams
> = MergeObjects<
  [
    {
      readonly value: Signal<Value | undefined>;
      readonly status: Signal<string>;
      readonly error: Signal<Error | undefined>;
      readonly isLoading: Signal<boolean>;
      hasValue(): boolean;
    },
    Insertions,
    IsMethod extends true
      ? {
          method: (args: ArgParams) => Params;
        }
      : {
          source: ReadonlySource<SourceParams>;
        }
  ]
>;

export function usingAsyncMethods<
  Context extends ContextConstraints,
  AsyncMethods extends {}
>(
  asyncMethodsFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => AsyncMethods
): UsingAsyncMethodsOutputs<Context, AsyncMethods> {
  return (contextData, injector) => {
    const asyncMethods = asyncMethodsFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.sources,
      ...contextData.context.props,
    }) as Record<
      string,
      AsyncMethodRef<unknown, unknown, unknown, unknown, unknown, unknown>
    >;

    const { methods, resourceRefs } = Object.entries(asyncMethods ?? {}).reduce(
      (acc, [methodName, asyncMethodRef]) => {
        const methodValue =
          'method' in asyncMethodRef ? asyncMethodRef.method : undefined;
        if (!methodValue) {
          acc.resourceRefs[methodName] = asyncMethodRef;
          return acc;
        }
        acc.resourceRefs[methodName] = {
          ...asyncMethodRef,
        };
        acc.methods[`set${capitalize(methodName)}`] = methodValue as Function;
        return acc;
      },
      {
        methods: {},
        resourceRefs: {},
      } as {
        resourceRefs: Record<
          string,
          Omit<
            AsyncMethodRef<
              unknown,
              unknown,
              unknown,
              unknown,
              unknown,
              unknown
            >,
            'method' | 'source'
          >
        >;
        methods: Record<string, Function>;
      }
    );

    return {
      props: resourceRefs,
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods,
      asyncMethods: {},
    } as unknown as SpecificUsingAsyncMethodsOutputs<AsyncMethods>;
  };
}
