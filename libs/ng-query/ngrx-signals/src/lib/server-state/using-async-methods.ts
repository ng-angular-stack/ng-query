import { Signal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { createMethodHandlers } from './util/util';
import { MergeObject } from '../types/util.type';

type SpecificUsingAsyncMethodsOutputs<AsyncMethods extends {}> = {
  props: {
    [key in keyof AsyncMethods]: Omit<AsyncMethods[key], 'method'>;
  };
  methods: {
    [key in keyof AsyncMethods]: AsyncMethods[key] extends { method: infer M }
      ? [M] extends [Function]
        ? M
        : never
      : never;
  };
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

export type AsyncMethodRef<Value, ArgParams, Params, Insertions> = MergeObject<
  {
    // used as output to trigger the async method loader
    method: (args: ArgParams) => Params;
    readonly value: Signal<Value | undefined>;
    readonly status: Signal<string>;
    readonly error: Signal<Error | undefined>;
    readonly isLoading: Signal<boolean>;
    hasValue(): boolean;
  },
  Insertions
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
    const stateResult = stateFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.sources,
      ...contextData.context.props,
    });

    const state = stateResult;
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
