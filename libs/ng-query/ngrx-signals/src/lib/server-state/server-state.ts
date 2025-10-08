import { Prettify } from '@ngrx/signals';
import { __InternalSharedMutationConfig, MutationRef } from '../with-mutation';
import { QueryRef } from '../with-query';
import { InternalType } from '../types/util.type';
import { MutationByIdRef } from '../with-mutation-by-id';
import { QueryByIdRef } from '../with-query-by-id';
import { inject, InjectionToken } from '@angular/core';

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

export type ContextConstraints = {
  props: {};
  methods: Record<string, Function>;
  __mutation: {};
  __query: {};
};

type EmptyContext = {
  props: {};
  methods: Record<string, Function>;
  __mutation: {};
  __query: {};
};

type ContextInput<Context extends ContextConstraints> = {
  context: Context;
};
export type ServerStateFactory<
  Context extends ContextConstraints[],
  ServerStateActionOutputs extends ContextConstraints
> = (
  contextData: ContextInput<MergeContexts<Context>>
) => ServerStateActionOutputs;

type ToServerStateOutputs<
  Context extends ContextConstraints[],
  Name extends string,
  Outputs = Prettify<
    MergeContexts<Context>['props'] & MergeContexts<Context>['methods']
  >
> = {
  [key in `inject${Capitalize<Name>}ServerState`]: () => Outputs;
} & {
  [key in `${Capitalize<Name>}ServerState`]: InjectionToken<Outputs>;
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
  __mutation: A['__mutation'] & B['__mutation'];
  __query: A['__query'] & B['__query'];
};

type ServerStateOptions<Name> = {
  providedIn?: 'root' | 'scoped' | 'platform';
  name?: Name;
};

export function serverState<
  outputs1 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>
): ToServerStateOutputs<[outputs1], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>
  // options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>
): ToServerStateOutputs<[outputs1, outputs2], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>
  // options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1, outputs2], Name>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints,
  const Name extends string = ''
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>,
  factory3: ServerStateFactory<[outputs2], outputs3>
  // options?: ServerStateOptions<Name>
): ToServerStateOutputs<[outputs1, outputs2, outputs3], Name>;
export function serverState(
  ...data: any[]
): ToServerStateOutputs<EmptyContext[], string> {
  const [factories, optionsOrFactory] = data;
  const isLastFactory = typeof optionsOrFactory === 'function';

  const options = isLastFactory
    ? {}
    : (optionsOrFactory as ServerStateOptions<any> | undefined);
  const providedIn =
    options?.providedIn === 'scoped' ? null : options?.providedIn ?? 'root';
  const token = new InjectionToken('ServerStateStore', {
    providedIn,
    factory: () => {
      const { propsAndMethods } = [
        ...factories,
        ...(isLastFactory ? [optionsOrFactory] : []),
      ].reduce((acc, factory) => {
        const result = factory({ context: acc.context });
        return {
          context: { ...acc.context, ...result },
          propsAndMethods: {
            ...acc.propsAndMethods,
            ...result.props,
            ...result.methods,
          },
        };
      }, {} as { context: EmptyContext; propsAndMethods: {} });
      return propsAndMethods;
    },
  });
  const name = options?.name ?? '';
  const capitalizedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : '';
  const injectNameServerState = `inject${capitalizedName}ServerState`;
  return {
    [injectNameServerState]: () => inject(token),
    [`${capitalizedName}ServerState`]: token,
  } as ToServerStateOutputs<EmptyContext[], string>;
}
