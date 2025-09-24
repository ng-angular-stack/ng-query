import { Prettify } from '@ngrx/signals';
import { __InternalSharedMutationConfig } from '../with-mutation';
import { useQuery } from './use-query';
import { query } from '../query';

export type ContextConstraints = {
  props: {};
  methods: Record<string, Function>;
  __mutation: {};
  __query: {};
  __types: object;
};

type EmptyContext = {
  props: {};
  methods: Record<string, Function>;
  __mutation: {};
  __query: {};
  __types: {};
};

type InsertionParams<Context extends ContextConstraints> = {
  input: Context;
};
export type ServerStateFactory<
  Context extends ContextConstraints[],
  ServerStateActionOutputs extends ContextConstraints
> = (
  context: InsertionParams<MergeContexts<Context>>
) => ServerStateActionOutputs;

type ToServerStateOutputs<Context extends ContextConstraints[]> = Prettify<
  MergeContexts<Context>
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
  __types: A['__types'] & B['__types'];
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
  // return (context: InsertionParams<Context>): outputs1 => {
  //   return factory(context);
  // };
  return {} as any;
}

// type SS =

const s1 = serverState(() => ({
  __mutation: { a: 1 },
  __query: { a: 1 },
  methods: {
    b: () => {
      return true;
    },
  },
  __types: { c: '' },
  props: { d: 1 },
}));

const s2 = serverState(
  () => ({
    __mutation: { a: 1 },
    __query: { a: 1 },
    methods: {
      b1: () => {
        return true;
      },
    },
    __types: { c1: '' },
    props: { d: 1 },
  }),
  (context) => ({
    __mutation: { a2: 1 },
    __query: { a2: 1 },
    methods: {
      b2: () => {
        return true;
      },
    },
    __types: { c2: '' },
    props: { d: 1 },
  })
);

const q = serverState(
  useQuery(
    'test',
    query({
      params: () => 5,
      loader: async ({ params: id }) => ({ id, name: 'test' }),
    })
  )
);
