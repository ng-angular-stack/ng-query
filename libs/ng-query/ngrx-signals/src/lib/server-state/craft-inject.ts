import { InjectionToken, Type } from '@angular/core';
import {
  ContextConstraints,
  CraftFactoryUtility,
  StoreConfigConstraints,
} from './craft';

type ProviderTokenWithoutAbstract<T> = Type<T> | InjectionToken<T>;

type InferProvidedType<T> = T extends ProviderTokenWithoutAbstract<infer U>
  ? U
  : never;

type SpecificCraftInjectionsOutputs<Injections extends {}> = {
  props: {};
  methods: {};
  inputs: {};
  queryParams: {};
  sources: {};

  __injections: {
    [key in keyof Injections as Uncapitalize<key & string>]: InferProvidedType<
      Injections[key]
    >;
  };
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type CraftInputsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Injections extends {}
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftInjectionsOutputs<Injections>
>;

// todo checker si ok avec les token si valeur bien infer / service / token et générics

export function craftInject<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Injections extends {}
>(
  injections: (
    entries: Context['inputs'] & Context['__injections'] & Context['sources']
  ) => Injections
): CraftInputsOutputs<Context, StoreConfig, Injections> {
  return (contextData, injector) => {
    const injectedInjections = Object.entries(
      injections({
        ...contextData.context.inputs,
        ...contextData.context.__injections,
        ...contextData.context.sources,
      })
    ).reduce(
      (acc, [key, injection]) => ({
        ...acc,
        [uncapitalize(key)]: injector.get(injection as any),
      }),
      {}
    );
    return {
      props: {},
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: injectedInjections,
      __query: {},
      __mutation: {},
      methods: {},
      asyncMethods: {},
    } as SpecificCraftInjectionsOutputs<Injections>;
  };
}

function uncapitalize(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
