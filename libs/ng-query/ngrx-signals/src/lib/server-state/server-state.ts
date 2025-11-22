import { Prettify } from '@ngrx/signals';
import { __InternalSharedMutationConfig, MutationRef } from '../with-mutation';
import { QueryRef } from '../with-query';
import { InternalType, MergeObject, MergeObjects } from '../types/util.type';
import { MutationByIdRef } from '../with-mutation-by-id';
import { QueryByIdRef } from '../with-query-by-id';
import {
  assertInInjectionContext,
  effect,
  inject,
  InjectionToken,
  Injector,
  signal,
  untracked,
} from '@angular/core';
import { createSignalProxy, SignalProxy } from '../signal-proxy';
import {
  ExcludeCommonKeys,
  RemoveIndexSignature,
  ReplaceStoreConfigToken,
  ToConnectableMethodFromInject,
} from './util/util.type';

//todo using inouts should not accepts other params
// todo inputs query&queryParams
// todo rename craft ?
// todo filter private fields and methods ?
// todo keep each state dependencies (will enable to use some functionalities that will require to know the dependencies of other states, like setQueryParamsAnPrefetch (that can only works for root stores/states))

// ! when adding standalone outputs make sure to assign like this: const c = Object.assign(() => true, {a: 5}) (function first)

export type MutationDictionary = Record<
  string,
  {
    mutationRef:
      | MutationRef<unknown, unknown, any, unknown>
      | MutationByIdRef<string, unknown, unknown, unknown, unknown>;
    __types: InternalType<unknown, unknown, unknown, boolean, unknown>;
  }
>;

export type QueryDictionary = Record<
  string,
  {
    queryRef:
      | QueryRef<unknown, unknown, unknown>
      | QueryByIdRef<string, unknown, unknown, unknown>;
    __types: InternalType<unknown, unknown, unknown, boolean, unknown>;
  }
>;

// todo rename __query/__mutation asyncMethods ?
// todo find a way to simplify that, props exposed everywhere, _props only in stores and __props only in current store ?

export type ContextConstraints = {
  props: {};
  methods: Record<string, Function>; //? (editable in injectServerState/usingServerState)
  inputs: {}; //? (editable in injectServerState/usingServerState)
  __injections: {};
  queryParams: {};
  sources: {}; //? (editable in injectServerState/usingServerState)
  __mutation: {};
  __query: {};
  asyncMethods: {};
  // todo cloud: {}; // A proxy that is used to share data between the injectable context and standalone outputs functions, composed store merge this proxy values
  // _generatedDeps: {[name]: {propsKeys: string[], methodsKeys: string[]}};
  // _usedDeps: {[storeAlias]: {[storeName]: {[props]: string[]; [methods]: string[], [inputs]: string[], [sources]: string[]...};}}
};

// ! do not expose it
type _EmptyContext = {
  props: {};
  methods: Record<string, Function>;
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  asyncMethods: {};
  __mutation: {};
  __query: {};
};

export const EmptyContext = {
  props: {},
  methods: {},
  inputs: {},
  queryParams: {},
  sources: {},
  __injections: {},
  asyncMethods: {},
  __mutation: {},
  __query: {},
};

export type EmptyContext = typeof EmptyContext;

type EmptyStandaloneContext = {};

export type ContextInput<Context extends ContextConstraints> = {
  context: Context;
};

/**
 * ! Do not use it to generate the output of utilities like (usingQuery, usingMutation, etc..),
 * ! the context is not correctly inferred (use ServerStateFactoryUtility instead)
 */
export type ServerStateFactory<
  Context extends ContextConstraints[],
  StoreConfig,
  ServerStateActionOutputs extends ContextConstraints,
  StandaloneContextOutputs extends {}
> = (<HostStoreConfig extends StoreConfigConstraints>( // todo add HostStoreConfig to deps
  contextData: ContextInput<MergeContexts<Context>>,
  injector: Injector,
  storeConfig: StoreConfig // do not use HostStoreConfig
) => ServerStateActionOutputs) & {
  standaloneOutputs?: StandaloneContextOutputs;
};

export type ServerStateFactoryUtility<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints, // todo try to keep this info
  ServerStateActionOutputs extends ContextConstraints,
  StandaloneOutputs extends {} = {}
> = (<HostStoreConfig extends StoreConfigConstraints>(
  contextData: ContextInput<Context>,
  injector: Injector,
  storeConfig: HostStoreConfig
) => ServerStateActionOutputs) & {
  standaloneOutputs?: StandaloneOutputs;
};
export const EXTERNALLY_PROVIDED = 'EXTERNALLY_PROVIDED' as const;

type EnableInputsToBeExternallyProvided<Inputs, Enable> = {
  [key in keyof Inputs]: Enable extends true
    ? Inputs[key] | typeof EXTERNALLY_PROVIDED
    : Inputs[key];
};

type IsNotFeature<ProvidedIn extends ProvidedInOption> =
  ProvidedIn extends 'feature' ? false : true;

type ReplaceStandaloneStoreToken<
  StandaloneOutputs extends StandaloneOutputsConstraints,
  StoreConfig extends StoreConfigConstraints
> = {
  [K in keyof StandaloneOutputs as ReplaceStoreConfigToken<
    K & string,
    StoreConfig
  >]: StandaloneOutputs[K];
};
// ! Plugged methods are not exposed in the final store (at type level, at runtime they exists and they are not hiding)
type ToServerStateOutputs<
  Context extends ContextConstraints[],
  StandaloneContextOutputs extends StandaloneOutputsConstraints[],
  StoreConfig extends StoreConfigConstraints,
  MergedContext extends MergeContexts<Context> = MergeContexts<Context>,
  StandaloneOutputs = ReplaceStandaloneStoreToken<
    MergeStandaloneContexts<StandaloneContextOutputs>,
    StoreConfig
  >,
  StandaloneSetAllQueryParams = StandaloneOutputs, // todo
  InputsToPlugin = EnableInputsToBeExternallyProvided<
    MergedContext['inputs'],
    IsNotFeature<StoreConfig['providedIn']>
  >,
  HasInputs = keyof InputsToPlugin extends never ? false : true,
  MethodsToConnect = ToConnectableMethodFromInject<MergedContext['methods']>,
  HasMethods = keyof MethodsToConnect extends never ? false : true,
  StandardOutputs = Prettify<
    MergedContext['props'] &
      ExcludeCommonKeys<MergedContext['methods'], MethodsToConnect>
  >,
  MethodsConnected extends MethodsToConnect = MethodsToConnect
> = {
  [key in `inject${Capitalize<StoreConfig['name']>}ServerState`]: <
    Config extends MergeObjects<
      [
        HasInputs extends true
          ? {
              inputs: InputsToPlugin;
            }
          : {},
        HasMethods extends true
          ? {
              methods?: Prettify<MethodsConnected>;
            }
          : {}
      ]
    >
  >(
    ...args: HasInputs extends true
      ? [pluggableConfig: Config]
      : [pluggableConfig?: Config]
  ) => Prettify<
    RemoveIndexSignature<
      MergedContext['props'] &
        ExcludeCommonKeys<
          MergedContext['methods'],
          'methods' extends keyof Config ? Config['methods'] : {}
        >
    >
  >;
} & {
  [key in `using${Capitalize<StoreConfig['name']>}ServerState`]: <
    Context extends ContextConstraints,
    Config extends MergeObjects<
      [
        HasInputs extends true
          ? {
              inputs: Partial<InputsToPlugin>;
            }
          : {},
        HasMethods extends true
          ? {
              methods?: Prettify<MethodsConnected>;
            }
          : {}
      ]
    >
  >( // todo user should not be able to add not expected inputs/methods
    pluggableConfig?: (
      configFactory: Context['inputs'] &
        Context['__injections'] &
        Context['sources'] &
        Context['props']
    ) => Config
  ) => ServerStateFactoryUtility<
    Context,
    StoreConfig,
    {
      props: MergedContext['props'];
      methods: ExcludeCommonKeys<
        MergedContext['methods'],
        'methods' extends keyof Config ? Config['methods'] : {}
      >;
      inputs: ExcludeCommonKeys<
        MergedContext['inputs'],
        'inputs' extends keyof Config ? Config['inputs'] : {}
      >;
      queryParams: MergedContext['queryParams'];
      sources: MergedContext['sources'];
      __injections: MergedContext['__injections'];
      asyncMethods: MergedContext['asyncMethods'];
      __mutation: MergedContext['__mutation'];
      __query: MergedContext['__query'];
    },
    [StandaloneOutputs] extends [{}] ? StandaloneOutputs : {}
  >;
} & {
  [key in `${Capitalize<
    StoreConfig['name']
  >}ServerState`]: InjectionToken<StandardOutputs>;
} & StandaloneOutputs & {
    setAllQueryParams: StandaloneSetAllQueryParams;
  } & {
    /**
     * Mainly used for debug and testing purposes
     * Not instantiated at runtime
     */
    [k in `_${Uppercase<StoreConfig['name']>}_META_STORE_CONTEXT`]: StoreConfig;
  };

type ProvidedInOption = 'root' | 'scoped' | 'feature';
// todo handle feature to not expose the inject and the provide but only the using...
export type StoreConfigConstraints = {
  providedIn: ProvidedInOption;
  name: string;
};

type MergeContexts<C extends ContextConstraints[]> = C extends [
  infer First,
  ...infer Rest
]
  ? First extends ContextConstraints
    ? Rest extends ContextConstraints[]
      ? MergeTwoContexts<First, MergeContexts<Rest>>
      : First
    : never
  : _EmptyContext;

type MergeStandaloneContexts<C extends StandaloneOutputsConstraints[]> =
  C extends [infer First, ...infer Rest]
    ? First extends StandaloneOutputsConstraints
      ? Rest extends StandaloneOutputsConstraints[]
        ? First & MergeStandaloneContexts<Rest>
        : First
      : never
    : _EmptyContext;

type MergeTwoContexts<
  A extends ContextConstraints,
  B extends ContextConstraints
> = {
  methods: A['methods'] & B['methods'];
  props: A['props'] & B['props'];
  inputs: A['inputs'] & B['inputs'];
  __injections: A['__injections'] & B['__injections'];
  __mutation: A['__mutation'] & B['__mutation'];
  __query: A['__query'] & B['__query'];
  queryParams: A['queryParams'] & B['queryParams'];
  sources: A['sources'] & B['sources'];
  asyncMethods: A['asyncMethods'] & B['asyncMethods'];
};

type StandaloneOutputsConstraints = {};
// todo make storeconfig to accumulate
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints,
  outputs4 extends ContextConstraints,
  standaloneOutputs1 extends StandaloneOutputsConstraints,
  standaloneOutputs2 extends StandaloneOutputsConstraints,
  standaloneOutputs3 extends StandaloneOutputsConstraints,
  standaloneOutputs4 extends StandaloneOutputsConstraints,
  const ProvidedIn extends ProvidedInOption,
  const Name extends string
>(
  options: {
    providedIn: ProvidedIn;
    name: Name;
  },
  factory1: ServerStateFactory<
    [_EmptyContext],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs1,
    standaloneOutputs1
  >,
  factory2: ServerStateFactory<
    [outputs1],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs2,
    standaloneOutputs2
  >,
  factory3: ServerStateFactory<
    [outputs1, outputs2],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs3,
    standaloneOutputs3
  >,
  factory4: ServerStateFactory<
    [outputs1, outputs2, outputs3],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs4,
    standaloneOutputs4
  >
): ToServerStateOutputs<
  [outputs1, outputs2, outputs3, outputs4],
  [
    standaloneOutputs1,
    standaloneOutputs2,
    standaloneOutputs3,
    standaloneOutputs4
  ],
  {
    providedIn: NoInfer<ProvidedIn>;
    name: NoInfer<Name>;
  }
>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints,
  standaloneOutputs1 extends StandaloneOutputsConstraints,
  standaloneOutputs2 extends StandaloneOutputsConstraints,
  standaloneOutputs3 extends StandaloneOutputsConstraints,
  const Name extends string,
  const ProvidedIn extends ProvidedInOption
>(
  options: {
    providedIn: ProvidedIn;
    name: Name;
  },
  factory1: ServerStateFactory<
    [_EmptyContext],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs1,
    standaloneOutputs1
  >,
  factory2: ServerStateFactory<
    [outputs1],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs2,
    standaloneOutputs2
  >,
  factory3: ServerStateFactory<
    [outputs1, outputs2],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs3,
    standaloneOutputs3
  >
): ToServerStateOutputs<
  [outputs1, outputs2, outputs3],
  [standaloneOutputs1, standaloneOutputs2, standaloneOutputs3],
  {
    providedIn: NoInfer<ProvidedIn>;
    name: NoInfer<Name>;
  }
>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  standaloneOutputs1 extends StandaloneOutputsConstraints,
  standaloneOutputs2 extends StandaloneOutputsConstraints,
  const ProvidedIn extends ProvidedInOption,
  const Name extends string
>(
  options: {
    providedIn: ProvidedIn;
    name: Name;
  },
  factory1: ServerStateFactory<
    [_EmptyContext],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs1,
    standaloneOutputs1
  >,
  factory2: ServerStateFactory<
    [outputs1],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs2,
    standaloneOutputs2
  >
): ToServerStateOutputs<
  [outputs1, outputs2],
  [standaloneOutputs1, standaloneOutputs2],
  {
    providedIn: NoInfer<ProvidedIn>;
    name: NoInfer<Name>;
  }
>;
export function serverState<
  outputs1 extends ContextConstraints,
  standaloneOutputs1 extends StandaloneOutputsConstraints,
  const ProvidedIn extends ProvidedInOption,
  const Name extends string
>(
  options: {
    providedIn: ProvidedIn;
    name: Name;
  },
  factory1: ServerStateFactory<
    [_EmptyContext],
    {
      providedIn: NoInfer<ProvidedIn>;
      name: NoInfer<Name>;
    },
    outputs1,
    standaloneOutputs1
  >
): ToServerStateOutputs<
  [outputs1],
  [standaloneOutputs1],
  {
    providedIn: NoInfer<ProvidedIn>;
    name: NoInfer<Name>;
  }
>;
export function serverState(
  options: StoreConfigConstraints,
  ...factoriesList: ServerStateFactory<
    [_EmptyContext],
    {
      providedIn: ProvidedInOption;
      name: string;
    },
    ContextConstraints,
    {}
  >[]
): ToServerStateOutputs<
  _EmptyContext[],
  EmptyStandaloneContext[],
  {
    name: string;
    providedIn: ProvidedInOption;
  }
> {
  const providedIn =
    options.providedIn && ['scoped', 'feature'].includes(options.providedIn)
      ? null
      : 'root';
  const storeConfig: StoreConfigConstraints = {
    providedIn: options?.providedIn,
    name: options?.name,
  };
  console.log('optionsName', options?.name);

  const extractedStandaloneOutputs = factoriesList.reduce(
    (acc, factoryWithStandalone) => {
      acc = {
        ...acc,
        ...(factoryWithStandalone ?? {}),
      };
      return acc;
    },
    {} as Record<string, unknown>
  );

  // used to share context, when providedIn is not root and also used with 'inject' and with 'using'
  let sharedContext: ContextConstraints | undefined = undefined;

  const pluggableInputs = createSignalProxy(signal({}));
  let inputsKeysSet: Set<string> | undefined = undefined;
  const token = new InjectionToken('ServerStateStore', {
    providedIn,
    factory: () => {
      console.log('optionsName', options?.name);
      const injector = inject(Injector);
      const { propsAndMethods, context } = mergeContextAndProps({
        factoriesList,
        pluggableInputs,
        injector,
        storeConfig,
      });
      inputsKeysSet = new Set(
        Object.keys((context as ContextConstraints).inputs)
      );
      sharedContext = context;

      return propsAndMethods;
    },
  });
  const name = options?.name ?? '';
  const capitalizedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : '';
  const injectNameServerState = `inject${capitalizedName}ServerState`;
  const usingNameServerState = `using${capitalizedName}ServerState`;
  return {
    [injectNameServerState]: (entries?: {
      inputs?: Record<string, unknown>;
      methods?: Record<string, unknown>;
    }) => {
      assertInInjectionContext(serverState);
      const tokenValue = inject(token); // inject will enable to set inputsKeysSet
      const entriesInputs = entries?.inputs;
      if (entriesInputs) {
        let hasInputs = false;
        const inputs = Array.from(inputsKeysSet ?? []).reduce(
          (acc, inputKey) => {
            if (inputKey in entriesInputs) {
              hasInputs = true;
              const value = (entriesInputs as any)[inputKey];
              if (value !== EXTERNALLY_PROVIDED) {
                acc[inputKey] = (entries as any)[inputKey];
              }
              return acc;
            }
            return acc;
          },
          {} as Record<string, unknown>
        );
        if (hasInputs) {
          pluggableInputs.$patch(inputs as ContextConstraints['inputs']);
        }
      }

      // for each methods associated to a source, trigger the targeted method when the source change
      const entriesMethods = entries?.methods;
      if (entriesMethods) {
        Object.entries(entriesMethods).forEach(([methodName, source]) => {
          effect(() => {
            const newValue = (source as Function)();
            untracked(() => {
              if (newValue !== undefined) {
                (tokenValue as any)[methodName](newValue);
              }
            });
          });
        });
      }

      return tokenValue;
    },
    [usingNameServerState]: (
      pluggableConfig?: (context: ContextConstraints) => {
        inputs?: Record<string, unknown>;
        methods?: Record<string, Function>;
      }
    ) => {
      return (
        contextData: ContextInput<ContextConstraints>,
        injector: Injector // todo add store config
      ) => {
        console.log('optionsName using', options?.name);
        const entries =
          pluggableConfig?.({
            ...contextData.context.inputs,
            ...contextData.context.__injections,
            ...contextData.context.sources,
            ...contextData.context.props,
          } as any) ?? {};
        const entriesInputs = entries?.inputs;

        let storeContext: ContextConstraints | undefined = undefined;

        if (options?.providedIn !== 'root') {
          const { context } = mergeContextAndProps({
            factoriesList,
            pluggableInputs,
            injector,
            storeConfig,
          });
          storeContext = context;
        } else {
          const _getOrGenerateStore = inject(token);
          storeContext = sharedContext;
        }

        inputsKeysSet = new Set(
          Object.keys((storeContext as ContextConstraints).inputs)
        );
        if (entriesInputs) {
          let hasInputs = false;
          const inputs = Array.from(inputsKeysSet ?? []).reduce(
            (acc, inputKey) => {
              if (inputKey in entriesInputs) {
                hasInputs = true;
                const value = (entriesInputs as any)[inputKey];
                if (value !== EXTERNALLY_PROVIDED) {
                  acc[inputKey] = (entriesInputs as any)[inputKey];
                }
                return acc;
              }
              return acc;
            },
            {} as Record<string, unknown>
          );
          if (hasInputs) {
            pluggableInputs.$patch(inputs as ContextConstraints['inputs']);
          }
        }
        // todo if provided global use the injected one, otherwise trigger manuually
        return Object.assign(
          storeContext as ContextConstraints,
          extractedStandaloneOutputs
        );
      };
    },
    [`${capitalizedName}ServerState`]: token,
    ...extractedStandaloneOutputs,
  } as ToServerStateOutputs<
    _EmptyContext[],
    EmptyStandaloneContext[],
    {
      name: string;
      providedIn: ProvidedInOption;
    }
  >;
}

function mergeContextAndProps({
  factoriesList,
  pluggableInputs,
  injector,
  storeConfig,
}: {
  factoriesList: ServerStateFactory<
    [ContextConstraints],
    StoreConfigConstraints,
    any,
    any
  >[];
  pluggableInputs: SignalProxy<{}, true>;
  injector: Injector;
  storeConfig: StoreConfigConstraints;
}): { propsAndMethods: any; context: any } {
  return factoriesList.reduce(
    (acc, factory) => {
      const result = (
        factory as ServerStateFactory<
          [ContextConstraints],
          StoreConfigConstraints,
          ContextConstraints,
          StandaloneOutputsConstraints
        >
      )(
        {
          context: { ...acc.context, inputs: pluggableInputs },
        },
        injector,
        storeConfig
      );
      Object.entries(result.inputs).forEach(([key, value]) => {
        const hasValue = pluggableInputs.$ref(key as never);
        if (!hasValue) {
          pluggableInputs.$patch({ [key]: value } as any);
        }
      });
      return {
        context: {
          inputs: { ...acc.context.inputs, ...result.inputs },
          __injections: {
            ...acc.context.__injections,
            ...result.__injections,
          },
          props: {
            ...acc.context.props,
            ...result.props,
          },
          methods: {
            ...acc.context.methods,
            ...result.methods,
          },
          __query: {
            ...acc.context.__query,
            ...result.__query,
          },
          __mutation: {
            ...acc.context.__mutation,
            ...result.__mutation,
          },
          queryParams: {
            ...acc.context.queryParams,
            ...result.queryParams,
          },
          sources: {
            ...acc.context.sources,
            ...result.sources,
          },
          asyncMethods: {
            ...acc.context.asyncMethods,
            ...result.asyncMethods,
          },
        },
        propsAndMethods: {
          ...acc.propsAndMethods,
          ...result.props,
          ...result.methods,
        },
      };
    },
    {
      context: {
        props: {},
        methods: {},
        inputs: {}, // passing pluggableInputs here seems to not works
        queryParams: {},
        sources: {},
        __injections: {},
        __mutation: {},
        __query: {},
        asyncMethods: {},
      } as _EmptyContext,
      propsAndMethods: {},
    } as {
      context: _EmptyContext;
      propsAndMethods: {};
    }
  );
}
