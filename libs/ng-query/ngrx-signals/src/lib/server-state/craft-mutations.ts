import {
  ContextConstraints,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  PartialContext,
  partialContext,
  StoreConfigConstraints,
} from './craft';
import { UnionToTuple } from '../types/util.type';
import { Prettify } from '@ngrx/signals';
import { capitalize } from './util/util';
import { FilterMethodsBoundToSources } from './util/util.type';
import { AsyncMethodRef } from './craft-async-methods';

type SpecificCraftMutationsOutputs<Mutations extends {}> = PartialContext<{
  props: {
    [key in keyof Mutations]: Prettify<Omit<Mutations[key], 'method'>>;
  };
  methods: FilterMethodsBoundToSources<
    Mutations,
    UnionToTuple<keyof Mutations>,
    'mutate'
  >;
  _mutations: {
    [key in keyof Mutations]: Prettify<Omit<Mutations[key], 'method'>>;
  };
}>;

type CraftMutationsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Mutations extends {}
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftMutationsOutputs<Mutations>
>;

export type MutationRef<
  Value,
  ArgParams,
  Params,
  Insertions,
  IsMethod,
  SourceParams,
  GroupIdentifier
> = AsyncMethodRef<
  Value,
  ArgParams,
  Params,
  Insertions,
  IsMethod,
  SourceParams,
  GroupIdentifier
>;

export function craftMutations<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  Mutations extends {}
>(
  mutationsFactory: (context: CraftFactoryEntries<Context>) => Mutations
): CraftMutationsOutputs<Context, StoreConfig, Mutations> {
  return (_cloudProxy) => (contextData) => {
    const mutations = mutationsFactory(
      craftFactoryEntries(contextData)
    ) as Record<
      string,
      MutationRef<unknown, unknown, unknown, unknown, unknown, unknown, unknown>
    >;

    const { methods, resourceRefs } = Object.entries(mutations ?? {}).reduce(
      (acc, [methodName, mutationRef]) => {
        const methodValue =
          'method' in mutationRef ? mutationRef.method : undefined;
        if (!methodValue) {
          acc.resourceRefs[methodName] = mutationRef;
          return acc;
        }
        acc.resourceRefs[methodName] = {
          ...mutationRef,
        };
        acc.methods[`mutate${capitalize(methodName)}`] =
          methodValue as Function;
        return acc;
      },
      {
        methods: {},
        resourceRefs: {},
      } as {
        resourceRefs: Record<
          string,
          Omit<
            MutationRef<
              unknown,
              unknown,
              unknown,
              unknown,
              unknown,
              unknown,
              unknown
            >,
            'method' | 'source'
          >
        >;
        methods: Record<string, Function>;
      }
    );

    return partialContext({
      props: resourceRefs,
      methods,
      _asyncMethods: resourceRefs,
    }) as unknown as SpecificCraftMutationsOutputs<Mutations>;
  };
}
