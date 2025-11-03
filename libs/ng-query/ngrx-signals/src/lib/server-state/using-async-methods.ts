import { ResourceRef, Signal, WritableSignal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { FilterPrivateFields } from './util/util.type';
import { ReadonlySource } from './util/source.type';
import { createMethodHandlers } from './util/util';

type SpecificUsingAsyncMethodsOutputs<
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = {
  props: { [key in StateName]: Signal<State> };
  methods: Methods extends undefined ? {} : FilterPrivateFields<Methods>;
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
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingAsyncMethodsOutputs<StateName, State, Methods>
>;

export type AsyncMethodRef<Value, Params> = {
  // used as output to trigger the async method loader
  method: (params: Params) => void;
  readonly value: Signal<Value | undefined>;
  readonly status: Signal<string>;
  readonly error: Signal<Error | undefined>;
  readonly isLoading: Signal<boolean>;
  hasValue(): boolean;
};

export function usingAsyncMethods<
  Context extends ContextConstraints,
  AsyncMethods extends Record<string, AsyncMethodRef<unknown, unknown>>
>(
  asyncMethodsFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => AsyncMethods
): UsingAsyncMethodsOutputs<Context, StateName, State, Methods> {
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
