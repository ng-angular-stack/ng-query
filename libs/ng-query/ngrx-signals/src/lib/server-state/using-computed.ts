import { Signal } from '@angular/core';
import {
  ContextConstraints,
  ServerStateFactoryUtility,
  StoreConfigConstraints,
} from './server-state';

type SpecificUsingComputedOutputs<Computed extends {}> = {
  props: Computed;
  methods: {};
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type UsingComputedStatesOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Computed extends {}
> = ServerStateFactoryUtility<
  Context,
  StoreConfig,
  SpecificUsingComputedOutputs<Computed>
>;

export function usingComputedStates<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Computed extends {}
>(
  computedFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => Computed
): UsingComputedStatesOutputs<Context, StoreConfig, Computed> {
  return (contextData, injector) => {
    const computedValues = computedFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.sources,
      ...contextData.context.props,
    }) as Record<string, Signal<unknown>>;

    return {
      props: computedValues,
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods: {},
      asyncMethods: {},
    } as unknown as SpecificUsingComputedOutputs<Computed>;
  };
}
