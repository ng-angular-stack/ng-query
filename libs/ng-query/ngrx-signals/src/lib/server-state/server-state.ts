import { Prettify } from '@ngrx/signals';
import { __InternalSharedMutationConfig, MutationRef } from '../with-mutation';
import { QueryRef } from '../with-query';
import { InternalType } from '../types/util.type';

export type ContextConstraints = {
  props: {};
  methods: Record<string, Function>;
  __mutation: Record<
    string,
    {
      mutationRef: MutationRef<unknown, unknown, any, unknown>;
      __types: InternalType<unknown, unknown, unknown, boolean>;
    }
  >;
  __query: Record<
    string,
    {
      queryRef: QueryRef<unknown, unknown, unknown>;
      __types: InternalType<unknown, unknown, unknown, boolean>;
    }
  >;
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

type ToServerStateOutputs<Context extends ContextConstraints[]> = Prettify<
  MergeContexts<Context>['props'] & MergeContexts<Context>['methods']
>;

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

export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints,
  outputs3 extends ContextConstraints
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>,
  factory3: ServerStateFactory<[outputs2], outputs3>
): ToServerStateOutputs<[outputs1, outputs2, outputs3]>;
export function serverState<
  outputs1 extends ContextConstraints,
  outputs2 extends ContextConstraints
>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>,
  factory2: ServerStateFactory<[outputs1], outputs2>
): ToServerStateOutputs<[outputs1, outputs2]>;
export function serverState<outputs1 extends ContextConstraints>(
  factory1: ServerStateFactory<[EmptyContext], outputs1>
): ToServerStateOutputs<[outputs1]>;
export function serverState(
  ...factories: ServerStateFactory<EmptyContext[], EmptyContext>[]
): ToServerStateOutputs<EmptyContext[]> {
  const { propsAndMethods } = factories.reduce((acc, factory) => {
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
  return propsAndMethods as ToServerStateOutputs<EmptyContext[]>;
}
