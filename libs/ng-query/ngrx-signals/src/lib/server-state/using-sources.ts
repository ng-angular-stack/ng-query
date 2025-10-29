import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { Source } from './source';

// todo expose standalone methods

type InferSourceType<S> = S extends Source<infer T> ? T : never;

type SpecificUsingSourcesOutputs<Sources extends {}> = {
  props: {};
  methods: {
    [K in keyof Sources as `set${Capitalize<string & K>}`]: (
      payload: InferSourceType<Sources[K]>
    ) => void;
  };
  inputs: {};
  __injections: {};
  queryParams: {};
  sources: Sources;
  __query: {};
  __mutation: {};
};

type UsingInputsOutputs<
  Context extends ContextConstraints,
  Inputs extends {}
> = ServerStateFactoryUtility<Context, SpecificUsingSourcesOutputs<Inputs>>;

// todo Sources extends Record<string, Source<unknown>>
export function usingSources<
  Context extends ContextConstraints,
  Sources extends Record<string, Source<any>>
>(sources: Sources): UsingInputsOutputs<Context, Sources> {
  return (contextData) => {
    return {
      props: {},
      inputs: {},
      __injections: {},
      queryParams: {},
      sources,
      __query: {},
      __mutation: {},
      methods: Object.entries(sources).reduce((acc, [key, source]) => {
        return {
          ...acc,
          [`set${capitalize(key)}`]: (payload: unknown) => {
            source.set(payload);
          },
        };
      }, {} as Record<string, (payload: unknown) => void>),
    } as SpecificUsingSourcesOutputs<Sources>;
  };
}

// todo make it util function
function capitalize<S extends string>(str: S): Capitalize<S> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;
}
