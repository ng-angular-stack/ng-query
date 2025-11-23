import { Signal } from '@angular/core';
import {
  ContextConstraints,
  CraftFactoryUtility,
  StoreConfigConstraints,
} from './craft';

type SpecificCraftComputedOutputs<Computed extends {}> = {
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

type CraftComputedStatesOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Computed extends {}
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftComputedOutputs<Computed>
>;

export function craftComputedStates<
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
): CraftComputedStatesOutputs<Context, StoreConfig, Computed> {
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
    } as unknown as SpecificCraftComputedOutputs<Computed>;
  };
}
