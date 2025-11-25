import { Signal, WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  PartialContext,
  StoreConfigConstraints,
} from './craft';
import { ReadonlySource } from './util/source.type';
import { createMethodHandlers } from './util/util';
import { Prettify } from '@ngrx/signals';

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
> = PartialContext<{
  props: { [key in StateName]: Signal<State> };
  methods: Methods extends undefined
    ? {}
    : Prettify<FilterConnectedToSourceMethods<Methods>>;
}>;

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
    context: CraftFactoryEntries<Context>
  ) => WritableSignal<State>,
  methodsFactory?: (state: {
    state: Signal<NoInfer<State>>;
    context: CraftFactoryEntries<Context>;
  }) => Methods
): CraftStateOutputs<Context, StoreConfig, StateName, State, Methods> {
  return (contextData, injector) => {
    const stateResult = stateFactory(craftFactoryEntries(contextData));

    const state = stateResult;
    const readonlyState = stateResult.asReadonly();
    const methodsData = methodsFactory?.({
      state: readonlyState,
      context: craftFactoryEntries(contextData),
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
