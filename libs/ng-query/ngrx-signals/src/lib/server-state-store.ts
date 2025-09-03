import { inject, signal, Type } from '@angular/core';
import {
  EmptyFeatureResult,
  Prettify,
  signalStore,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  withProps,
  withState,
} from '@ngrx/signals';
import { InferInjectedType, MergeObject } from './types/util.type';
import {
  createSignalProxy,
  SignalProxy,
  SignalWrapperParams,
} from './signal-proxy';
import { SignalStoreHooks } from './inner-signal-store';

// todo add more tests with withUserServerState, is global or not, pluggable or not

/**
 * pluggableConfig is only used by the withGlobalServerState.
 * It enables to plug some source to the server state store.
 * Si c'est un signalStore de provided, le withServerState expose le server store via consumerStore.ServerStateName....
 * Si c'est une signalStoreFeature, le withServerState expose le server store via consumerStore...
 **/
export function ServerStateStore<
  const ServerStateName extends string,
  PluggableParams extends object,
  State,
  Props,
  Methods,
  SignalStoreFeatureResultInfer extends {
    state: State extends [object] ? State : {};
    props: [Props] extends [object] ? Props : {};
    methods: [Methods] extends [Record<string, Function>] ? Methods : {};
  },
  IsPluggable extends true | false = false
>(
  serverStateName: ServerStateName,
  feature:
    | SignalStoreFeature<EmptyFeatureResult, SignalStoreFeatureResultInfer>
    // the proxy is used to enable to access the properties of config data that does not exist when the store is created
    // it may only works with one level of properties
    | ((
        data: SignalProxy<PluggableParams>
      ) => SignalStoreFeature<
        EmptyFeatureResult,
        SignalStoreFeatureResultInfer
      >),
  options?: {
    /**
     * If 'root', the store will be provided in the root injector.
     * If not provided, the store will not be provided (used for local store)
     */
    providedIn?: 'root';
    /**
     * Flag that indicates if the store is pluggable or not.
     * Since the the signalStoreFeature returns a function, it is not possible to distinguish if the user passed a pluggable config or not.
     */
    isPluggable?: IsPluggable;
  }
) {
  const capitalizedStateMutationName =
    serverStateName.charAt(0).toUpperCase() + serverStateName.slice(1);
  const isGlobalStore = options?.providedIn === 'root';
  const isPluggable = options?.isPluggable ?? false;

  const pluggableConfig = createSignalProxy(signal({}));
  //@ts-ignore
  const featureResult = isPluggable ? feature(pluggableConfig) : feature;

  const ServerStateStore =
    options?.providedIn === 'root'
      ? signalStore(
          { providedIn: 'root' },
          featureResult as unknown as SignalStoreFeature
        )
      : signalStore(featureResult as unknown as SignalStoreFeature);

  const injectPluggableUserServerState = (pluggableData: PluggableParams) => {
    const store = inject(ServerStateStore);
    pluggableConfig.$set(pluggableData);
    return store;
  };

  const withServerState = <
    Input extends SignalStoreFeatureResult,
    PluggableConfigInner
  >(
    config?: PluggableConfigInner extends {}
      ? (
          store: Prettify<
            StateSignals<Input['state']> & Input['props'] & Input['methods']
          >
        ) => PluggableConfigInner
      : never
  ): SignalStoreFeature<Input, SignalStoreFeatureResultInfer> => {
    if (isGlobalStore) {
      return signalStoreFeature(
        withProps(() => {
          //@ts-ignore
          const globalServerStateStore = inject(ServerStateStore);
          return {
            //@ts-ignore
            ...globalServerStateStore,
          };
        })
      ) as unknown as SignalStoreFeature<Input, SignalStoreFeatureResultInfer>;
    }
    return featureResult as unknown as SignalStoreFeature<
      Input,
      SignalStoreFeatureResultInfer
    >;
  };
  return {
    [`${capitalizedStateMutationName}ServerStateStore`]: ServerStateStore,
    [`with${capitalizedStateMutationName}ServerState`]: withServerState,
    ...(isPluggable
      ? {
          [`inject${capitalizedStateMutationName}ServerState`]:
            injectPluggableUserServerState,
          [`set${capitalizedStateMutationName}ServerStateConfig`]: (
            config: PluggableParams | undefined
          ) => {
            if (config) {
              pluggableConfig.$set(config);
            } else {
              pluggableConfig.$set({});
            }
          },
        }
      : {}),
  } as any as MergeObject<
    {
      [key in `${Capitalize<ServerStateName>}ServerStateStore`]: ReturnType<
        typeof signalStore<SignalStoreFeatureResultInfer>
      >;
    } & {
      [key in `with${Capitalize<ServerStateName>}ServerState`]: typeof withServerState;
    } & {
      isPluggable: IsPluggable;
      test: SignalStoreFeatureResultInfer;
    },
    IsPluggable extends false
      ? {}
      : {
          [key in `inject${Capitalize<ServerStateName>}ServerState`]: (
            data: SignalWrapperParams<PluggableParams>
          ) => InferInjectedType<
            NonNullable<
              ReturnType<
                typeof inject<
                  ReturnType<typeof signalStore<SignalStoreFeatureResultInfer>>
                >
              >
            >
          >;
        } & {
          [key in `set${Capitalize<ServerStateName>}ServerStateConfig`]: (
            config: SignalWrapperParams<PluggableParams> | undefined
          ) => void;
        }
  >;
}

function testGetSignalStoreOrFeature<
  State,
  Props,
  Methods,
  Result extends {
    state: State;
    props: Props;
    methods: Methods;
  },
  Entity extends SignalStoreFeature<EmptyFeatureResult, InferInnerSS<Result>>
>(entity: Entity): Entity;
function testGetSignalStoreOrFeature<
  // store
  State,
  Props,
  Methods,
  Result extends {
    state: {
      count: number;
    };
    props: {};
    methods: {};
  },
  Entity extends Type<
    SignalStoreMembers<{
      state: [State] extends [object] ? State : {};
      props: [Props] extends [object] ? Props : {};
      methods: [Methods] extends [Record<string, Function>] ? Methods : {};
    }>
  >
>(entity: Entity): Entity;
function testGetSignalStoreOrFeature(entity: any) {
  return {} as any;
}

const tSS = testGetSignalStoreOrFeature(
  signalStore(
    withState({
      count: 0,
      count2: 0,
    })
  )
);

const tSSF = testGetSignalStoreOrFeature(
  signalStoreFeature(
    withState({
      count: 0,
    })
  )
);

type SignalStoreMembers<FeatureResult extends SignalStoreFeatureResult> =
  Prettify<
    StateSignals<FeatureResult['state']> &
      FeatureResult['props'] &
      FeatureResult['methods']
  >;

export type InnerSignalStore<
  State extends object = object,
  Props extends object = object,
  Methods extends Record<string, Function> = Record<string, Function>
> = {
  stateSignals: StateSignals<State>;
  props: Props;
  methods: Methods;
  hooks: SignalStoreHooks;
} & WritableStateSource<State>;

type InferInnerSS<T> = T extends InnerSignalStore<infer S, infer P, infer M>
  ? {
      state: S;
      props: P;
      methods: M;
    }
  : {
      state: {};
      props: {};
      methods: {};
    };
