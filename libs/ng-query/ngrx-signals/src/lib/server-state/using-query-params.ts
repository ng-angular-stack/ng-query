import { InjectionToken, Type } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';

type ProviderTokenWithoutAbstract<T> = Type<T> | InjectionToken<T>;

type InferProvidedType<T> = T extends ProviderTokenWithoutAbstract<infer U>
  ? U
  : never;

type SpecificUsingInjectionsOutputs<Injections extends {}> = {
  props: {};
  methods: {};
  inputs: {};
  __injections: {
    [key in keyof Injections as Uncapitalize<key & string>]: InferProvidedType<
      Injections[key]
    >;
  };
  __query: {};
  __mutation: {};
};

type UsingInputsOutputs<
  Context extends ContextConstraints,
  Injections extends {}
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingInjectionsOutputs<Injections>
>;

// todo exposer en plus de la fonction pour setLesQueryParams, getCurrentQueryParams,reset ?
// todo créer un utiliatire usingSources (privé par défaut et possible public) qui permet d'exposer des methodes/event s qui vont servir  a set les queryParams et aussi les états partagés
// Ca sera des signals qui seront exposés (avantage switchMap/debounce de base)

export function usingQueryParams<
  Context extends ContextConstraints,
  Injections extends {}
>(
  injections: (
    entries: Context['inputs'] & Context['__injections']
  ) => Injections
): UsingInputsOutputs<Context, Injections> {
  return (contextData, injector) => {
    const injectedInjections = Object.entries(
      injections({
        ...contextData.context.inputs,
        ...contextData.context.__injections,
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
      __injections: injectedInjections,
      __query: {},
      __mutation: {},
      methods: {},
    } as SpecificUsingInjectionsOutputs<Injections>;
  };
}

function uncapitalize(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
