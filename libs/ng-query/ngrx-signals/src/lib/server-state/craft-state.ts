import { Signal, WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  CraftFactoryUtility,
  StoreConfigConstraints,
} from './craft';
import { ReadonlySource } from './util/source.type';
import { createMethodHandlers } from './util/util';

type FilterConnectedToSourceMethods<Methods> = {
  [K in keyof Methods as Methods[K] extends ReadonlySource<any>
    ? never
    : K]: Methods[K];
};

// todo enable to sync with localStorage or sessionStorage

type SpecificCraftStateOutputs<
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = {
  props: { [key in StateName]: Signal<State> };
  methods: Methods extends undefined
    ? {}
    : FilterConnectedToSourceMethods<Methods>;
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type CraftStateOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftStateOutputs<StateName, State, Methods>
>;

export function craftState<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  const StateName extends string,
  State,
  Methods extends
    | Record<
        string,
        ((...args: any[]) => NoInfer<State>) | ReadonlySource<State>
      >
    | undefined
>(
  stateName: StateName,
  stateFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => WritableSignal<State>,
  methodsFactory?: (state: {
    state: Signal<NoInfer<State>>;
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props'];
  }) => Methods
): CraftStateOutputs<Context, StoreConfig, StateName, State, Methods> {
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
      asyncMethods: {},
      methods: finalMethods,
    } as unknown as SpecificCraftStateOutputs<StateName, State, Methods>;
  };
}
