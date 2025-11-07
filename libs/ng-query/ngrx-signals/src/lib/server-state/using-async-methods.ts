import { Signal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { createMethodHandlers } from './util/util';
import { MergeObjects, UnionToTuple } from '../types/util.type';
import { ReadonlySource } from './util/source.type';
import { Prettify } from '@ngrx/signals';

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
              [K in First & string]: [Method] extends [Function]
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
          method: ReadonlySource<SourceParams>;
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
      AsyncMethodRef<unknown, unknown, unknown, unknownx, unknown, unknown>
    >;

    const readonlyState = stateResult.asReadonly();
    const methodsData = methodsFactory?.({
      state: readonlyState,
      context: {
        ...contextData.context.inputs,
        ...contextData.context.__injections,
        ...contextData.context.props,
        ...contextData.context.sources,
      },
    });
    const finalMethods = createMethodHandlers<State>(methodsData, state);

    return {
      props: { [stateName]: readonlyState },
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods: finalMethods,
      asyncMethods: {},
    } as unknown as SpecificUsingAsyncMethodsOutputs<StateName, State, Methods>;
  };
}
