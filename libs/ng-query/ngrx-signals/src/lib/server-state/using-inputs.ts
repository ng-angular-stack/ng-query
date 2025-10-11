import { Signal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { Prettify } from '@ngrx/signals';

type ToSignalObject<T> = {
  [K in keyof T]: Signal<T[K]>;
};

type SpecificUsingQueryOutputs<Inputs extends {}> = {
  props: {};
  methods: {};
  inputs: Prettify<ToSignalObject<Inputs>>;
  __query: {};
  __mutation: {};
};

type UsingInputsOutputs<
  Context extends ContextConstraints,
  Inputs extends {}
> = ServerStateFactoryUtility<Context, SpecificUsingQueryOutputs<Inputs>>;

export function usingInputs<
  Context extends ContextConstraints,
  Inputs extends {}
>(inputs: Inputs): UsingInputsOutputs<Context, Inputs> {
  return (contextData) => {
    return {
      props: {},
      inputs: inputs,
      __query: {},
      __mutation: {},
      methods: {},
    } as SpecificUsingQueryOutputs<Inputs>;
  };
}
