import { Signal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
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
};

type UsingInputsOutputs<
  Context extends ContextConstraints,
  Inputs extends {}
> = ServerStateFactoryUtility<Context, SpecificUsingInputsOutputs<Inputs>>;

export function usingInputs<
  Context extends ContextConstraints,
  Inputs extends {}
>(inputs: Inputs): UsingInputsOutputs<Context, Inputs> {
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
    } as SpecificUsingInputsOutputs<Inputs>;
  };
}
