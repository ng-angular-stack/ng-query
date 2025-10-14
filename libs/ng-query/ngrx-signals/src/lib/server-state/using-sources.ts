import { InjectionToken, signal, Type } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';

type ProviderTokenWithoutAbstract<T> = Type<T> | InjectionToken<T>;

type InferProvidedType<T> = T extends ProviderTokenWithoutAbstract<infer U>
  ? U
  : never;

type SpecificUsingInjectionsOutputs<Injections extends {}> = {
  props: {};
  methods: {};
  inputs: {};
  queryParams: {};
  sources: {};
  __sources: {};
  __injections: {
    [key in keyof Injections as Uncapitalize<key & string>]: InferProvidedType<
      Injections[key]
    >;
  };
  __query: {};
  __mutation: {};
};

type UsingSourcesOutputs<
  Context extends ContextConstraints,
  Injections extends {}
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingInjectionsOutputs<Injections>
>;

// todo créer un utiliatire usingSources (privé par défaut et possible public) qui permet d'exposer des methodes/event s qui vont servir  a set les queryParams et aussi les états partagés
// Ca sera des signals qui seront exposés (avantage switchMap/debounce de base)
export function usingSources<
  Context extends ContextConstraints,
  SourcesKey extends string,
  Sources extends {
    [key in SourcesKey]: (data: unknown) => unknown;
  }
>(sources: Sources): UsingSourcesOutputs<Context, Sources> {
  return (contextData, injector) => {
    const sourcesSignals = Object.entries(sources).reduce(
      (acc, [key, sourceMapper]) => {
        const sourceSignal = signal(undefined); // todo use a symbol like EMPTY
        return {
          ...acc,

          [key]: (data: any) => {
            const result = sourceMapper(data);
            sourceSignal.set(result);
            return result;
          },
        };
      },
      {}
    );
    return {
      props: {},
      inputs: {},
      sources: sourcesSignals,
      __sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods: {},
    } as SpecificUsingInjectionsOutputs<Sources>;
  };
}
