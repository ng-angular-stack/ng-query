import {
  ContextConstraints,
  CraftFactoryUtility,
  StoreConfigConstraints,
} from './craft';
import { Source } from './source';
import { capitalize } from './util/util';

// todo expose standalone methods
// todo Context['sources'] & Context['queryParams'] & Context['asyncMethods'];

type InferSourceType<S> = S extends Source<infer T> ? T : never;

type SourceSetterMethods<Sources extends {}> = {
  [K in keyof Sources as `set${Capitalize<string & K>}`]: (
    payload: InferSourceType<Sources[K]>
  ) => void;
};

type SpecificCraftSourcesOutputs<Sources extends {}> = {
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

type CraftSourcesOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Inputs extends {}
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftSourcesOutputs<Inputs>,
  SourceSetterMethods<Inputs>
>;

/**
 * Sources can be plugged into methods by using `on(mySource, (state, payload) => ...)`)`.
 * Trigger the source:
 * - store.setMySource(payload)
 * - outside of injection context:
 *    const { store, setMySource } = craft();
 *    setMySource(payload); // can be called outside of an injection context
 *
 * The sources can also be bind to external sources when the store is injected by using:
 *  - private readonly store = injectCraft({mySource: this.componentSource}), or usingCraft({mySource: this.componentSource}),
 *
 * @example
 * ```ts
 * const { injectCraft, setIncrement } = craft(
 *   craftSources({
 *     increment: source<{}>(),
 *   }),
 *   craftState(
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
export function craftSources<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Sources extends Record<string, Source<any>>
>(sources: Sources): CraftSourcesOutputs<Context, StoreConfig, Sources> {
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
    } as SpecificCraftSourcesOutputs<Sources>;
  }, methods) as unknown as CraftSourcesOutputs<Context, StoreConfig, Sources>;
}
