import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { Source } from './source';
import { capitalize } from './util/util';

// todo expose standalone methods

type InferSourceType<S> = S extends Source<infer T> ? T : never;

type SourceSetterMethods<Sources extends {}> = {
  [K in keyof Sources as `set${Capitalize<string & K>}`]: (
    payload: InferSourceType<Sources[K]>
  ) => void;
};

type SpecificUsingSourcesOutputs<Sources extends {}> = {
  props: {};
  methods: SourceSetterMethods<Sources>;
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
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingSourcesOutputs<Inputs>,
  SourceSetterMethods<Inputs>
>;

// todo Sources extends Record<string, Source<unknown>>
// todo expose setXSource as standalone ?
export function usingSources<
  Context extends ContextConstraints,
  Sources extends Record<string, Source<any>>
>(sources: Sources): UsingInputsOutputs<Context, Sources> {
  const methods = Object.entries(sources).reduce((acc, [key, source]) => {
    return {
      ...acc,
      [`set${capitalize(key)}`]: (payload: unknown) => {
        source.set(payload);
      },
    };
  }, {} as Record<string, (payload: unknown) => void>);
  return Object.assign((contextData: ContextConstraints) => {
    return {
      props: {},
      inputs: {},
      __injections: {},
      queryParams: {},
      sources,
      __query: {},
      __mutation: {},
      methods,
    } as SpecificUsingSourcesOutputs<Sources>;
  }, methods) as unknown as UsingInputsOutputs<Context, Sources>;
}
