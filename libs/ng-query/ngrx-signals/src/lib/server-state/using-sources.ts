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
  asyncMethods: {};
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
// todo checker si les méthodes bien exposées
/**
 * Sources can be plugged into methods by using `on(mySource, (state, payload) => ...)`)`.
 * Trigger the source:
 * - store.setMySource(payload)
 * - outside of injection context:
 *    const { store, setMySource } = serverState();
 *    setMySource(payload); // can be called outside of an injection context
 *
 * The sources can also be bind to external sources when the store is injected by using:
 *  - private readonly store = injectServerState({mySource: this.componentSource}), or usingServerState({mySource: this.componentSource}),
 *
 * @example
 * ```ts
 * const { injectServerState, setIncrement } = serverState(
 *   usingSources({
 *     increment: source<{}>(),
 *   }),
 *   usingState(
 *     'test',
 *     () => signal(0),
 *     ({ context: { increment }, state }) => ({
 *       increment: on(increment, () => {
 *         return state() + 1;
 *       }),
 *     })
 *   )
 * );
 *
 * // somewhere (no need to be in injection context)
 * setIncrement({}); // trigger increment source
 * ```
 */
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
      asyncMethods: {},
      methods,
    } as SpecificUsingSourcesOutputs<Sources>;
  }, methods) as unknown as UsingInputsOutputs<Context, Sources>;
}
