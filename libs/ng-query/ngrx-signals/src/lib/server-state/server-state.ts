import { Prettify } from '@ngrx/signals';
import { __InternalSharedMutationConfig, MutationRef } from '../with-mutation';
import { QueryRef } from '../with-query';
import { InternalType } from '../types/util.type';
import { MutationByIdRef } from '../with-mutation-by-id';
import { QueryByIdRef } from '../with-query-by-id';
import {
  assertInInjectionContext,
  inject,
  InjectionToken,
  Injector,
  signal,
} from '@angular/core';
import { createSignalProxy } from '../signal-proxy';

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
// todo ajouter standalone ? (s'exporte en plus de l'injection token ?)
export type ContextConstraints = {
  props: {};
  methods: Record<string, Function>;
  inputs: {};
  __injections: {};
  standalone: {};
  queryParams: {};
  sources: {};
  __mutation: {};
  __query: {};
};

type EmptyContext = {
  props: {};
  methods: Record<string, Function>;
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  standalone: {};
  __mutation: {};
  __query: {};
};

type ContextInput<Context extends ContextConstraints> = {
  context: Context;
};

/**
 * ! Do not use it to generate the output of utilities like (usingQuery, usingMutation, etc..),
 * ! the context is not correctly inferred (use ServerStateFactoryUtility instead)
 */
export type ServerStateFactory<
  Context extends ContextConstraints[],
  ServerStateActionOutputs extends ContextConstraints
> = (
  contextData: ContextInput<MergeContexts<Context>>,
  injector: Injector
) => ServerStateActionOutputs;

export type ServerStateFactoryUtility<
  Context extends ContextConstraints,
  ServerStateActionOutputs extends ContextConstraints
> = (
  contextData: ContextInput<Context>,
  injector: Injector
) => ServerStateActionOutputs;

type ToServerStateOutputs<
  Context extends ContextConstraints[],
  Name extends string,
  Outputs = Prettify<
    MergeContexts<Context>['props'] & MergeContexts<Context>['methods']
  >,
  InputsToPlugin = MergeContexts<Context>['inputs'],
  StandaloneOutputs = MergeContexts<Context>['standalone']
> = {
  [key in `inject${Capitalize<Name>}ServerState`]: keyof InputsToPlugin extends never
    ? () => Outputs
    : (inputs: Partial<InputsToPlugin>) => Outputs;
} & {
  [key in `${Capitalize<Name>}ServerState`]: InjectionToken<Outputs>;
} & StandaloneOutputs;

type ServerStateOptions<Name> = {
  providedIn?: 'root' | 'scoped' | 'platform';
  name?: Name;
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
  : EmptyContext;

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
  standalone: A['standalone'] & B['standalone'];
};

export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints,
  outputs4 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>,
  factory3: ServerStateFactory<[outputs1, outputs2], outputs3>,
  factory4: ServerStateFactory<[outputs1, outputs2, outputs3], outputs4>,
  options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1, outputs2, outputs3, outputs4], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>,
  factory3: ServerStateFactory<[outputs1, outputs2], outputs3>,
  options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1, outputs2, outputs3], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>,
  options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1, outputs2], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1], Name>;
export function serverState(
  ...data: any[]
): ToServerStateOutputs<EmptyContext[], string> {
  const factories = data.slice(0, -1);
  const [optionsOrFactory] = data.slice(-1);

  const isLastFactory = typeof optionsOrFactory === 'function';

  const options = isLastFactory
    ? {}
    : (optionsOrFactory as ServerStateOptions<any> | undefined);
  const providedIn =
    options?.providedIn === 'scoped' ? null : options?.providedIn ?? 'root';
  const pluggableInputs = createSignalProxy(signal({}));
  const token = new InjectionToken('ServerStateStore', {
    providedIn,
    factory: () => {
      const injector = inject(Injector);
      // todo standalone should be extracted before
      const { propsAndMethodsAndStandalone } = [
        ...factories,
        ...(isLastFactory ? [optionsOrFactory] : []),
      ].reduce(
        (acc, factory) => {
          const result = (
            factory as ServerStateFactory<
              [ContextConstraints],
              ContextConstraints
            >
          )(
            {
              context: { ...acc.context, inputs: pluggableInputs },
            },
            injector
          );
          Object.entries(result.inputs).forEach(([key, value]) => {
            const hasValue = pluggableInputs.$ref(key as never);
            if (!hasValue) {
              pluggableInputs.$patch({ [key]: value } as any);
            }
          });
          return {
            context: {
              inputs: { ...acc.context.inputs, ...result.inputs }, // not really useful
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
              standalone: {
                ...acc.context.standalone,
                ...result.standalone,
              },
            },
            propsAndMethodsAndStandalone: {
              ...acc.propsAndMethodsAndStandalone,
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
            standalone: {},
            __mutation: {},
            __query: {},
          } as EmptyContext,
          propsAndMethodsAndStandalone: {},
        } as {
          context: EmptyContext;
          propsAndMethodsAndStandalone: {};
        }
      );
      return propsAndMethodsAndStandalone;
    },
  });
  const name = options?.name ?? '';
  const capitalizedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : '';
  const injectNameServerState = `inject${capitalizedName}ServerState`;
  return {
    [injectNameServerState]: (inputs: unknown) => {
      assertInInjectionContext(serverState);
      if (inputs) {
        pluggableInputs.$patch(inputs as ContextConstraints['inputs']);
      }
      return inject(token);
    },
    [`${capitalizedName}ServerState`]: token,

    // todo expose standalone outputs
  } as ToServerStateOutputs<EmptyContext[], string>;
}
