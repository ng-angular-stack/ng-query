import { Signal } from '@angular/core';
import {
  ContextConstraints,
  ServerStateFactoryUtility,
  StoreConfigConstraints,
} from './server-state';
import { Prettify } from '@ngrx/signals';

type ToSignalObject<T> = {
  [K in keyof T]: Signal<T[K]>;
};

type SpecificUsingInputsOutputs<Inputs extends {}> = {
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

type UsingInputsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Inputs extends {}
> = ServerStateFactoryUtility<
  Context,
  StoreConfig,
  SpecificUsingInputsOutputs<Inputs>
>;

export function usingInputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Inputs extends {}
>(inputs: Inputs): UsingInputsOutputs<Context, StoreConfig, Inputs> {
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
    } as SpecificUsingInputsOutputs<Inputs>;
  };
}
