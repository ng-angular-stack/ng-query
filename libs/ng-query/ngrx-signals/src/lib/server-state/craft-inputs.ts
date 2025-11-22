import { Signal } from '@angular/core';
import {
  ContextConstraints,
  ServerStateFactoryUtility,
  StoreConfigConstraints,
} from './craft';
import { Prettify } from '@ngrx/signals';

type ToSignalObject<T> = {
  [K in keyof T]: Signal<T[K]>;
};

type SpecificCraftInputsOutputs<Inputs extends {}> = {
  props: {};
  methods: {};
  inputs: Prettify<ToSignalObject<Inputs>>;
  __injections: {};
  queryParams: {};
  sources: {};
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type CraftInputsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Inputs extends {}
> = ServerStateFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftInputsOutputs<Inputs>
>;

export function craftInputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Inputs extends {}
>(inputs: Inputs): CraftInputsOutputs<Context, StoreConfig, Inputs> {
  // todo expose setXInputs as standalone ?
  return (contextData) => {
    return {
      props: {},
      inputs: inputs,
      __injections: {},
      queryParams: {},
      sources: {},
      __query: {},
      __mutation: {},
      methods: {},
      asyncMethods: {},
    } as SpecificCraftInputsOutputs<Inputs>;
  };
}
