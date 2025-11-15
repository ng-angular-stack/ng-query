import { Signal, WritableSignal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { ReadonlySource } from './util/source.type';
import { createMethodHandlers } from './util/util';

type FilterConnectedToSourceMethods<Methods> = {
  [K in keyof Methods as Methods[K] extends ReadonlySource<any>
    ? never
    : K]: Methods[K];
};

// todo enable to sync with localStorage or sessionStorage

type SpecificUsingStateOutputs<
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

type UsingStateOutputs<
  Context extends ContextConstraints,
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingStateOutputs<StateName, State, Methods>
>;

export function usingState<
  Context extends ContextConstraints,
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
): UsingStateOutputs<Context, StateName, State, Methods> {
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
    } as unknown as SpecificUsingStateOutputs<StateName, State, Methods>;
  };
}
