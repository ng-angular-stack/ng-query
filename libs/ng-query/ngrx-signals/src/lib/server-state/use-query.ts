import { QueryDeclarativeEffect } from '../core/query.core';
import { InternalType, MergeObject } from '../types/util.type';
import { ContextConstraints, ServerStateFactory } from './server-state';
import { QueryRef } from '../with-query';
import { ResourceRef } from '@angular/core';
import { Prettify } from '@ngrx/signals';

type QueryOptions<
  Context extends ContextConstraints,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  OtherProperties
> = {
  on?: Context extends {
    __mutation: infer Mutations;
  }
    ? {
        [key in keyof Mutations as `${key &
          string}${'isGroupedResource' extends keyof Mutations[key]
          ? Mutations[key]['isGroupedResource'] extends true
            ? 'MutationById'
            : ''
          : never}`]?: Mutations[key] extends InternalType<
          infer MutationState,
          infer MutationParams,
          infer MutationArgsParams,
          infer MutationIsByGroup,
          infer MutationGroupIdentifier
        >
          ? QueryDeclarativeEffect<{
              query: InternalType<
                ResourceState,
                ResourceParams,
                ResourceArgsParams,
                false
              >;
              mutation: InternalType<
                MutationState,
                MutationParams,
                MutationArgsParams,
                MutationIsByGroup,
                MutationGroupIdentifier
              >;
            }>
          : never;
      }
    : never;
} & {
  [key in keyof OtherProperties]: OtherProperties[key];
};

type SpecificUseQueryOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = {
  props: {
    [key in `${ResourceName & string}Query`]: MergeObject<
      ResourceRef<ResourceState>,
      InsertionsOutputs
    >;
  };
  methods: {};
  __query: {
    [key in ResourceName & string]: {
      queryRef: QueryRef<
        NoInfer<ResourceState>,
        NoInfer<ResourceParams>,
        InsertionsOutputs
      >;
      __types: InternalType<
        ResourceState,
        ResourceParams,
        ResourceArgsParams,
        false
      >;
    };
  };
  __mutation: {};
};

type UseQueryOutputs<
  Context extends ContextConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = ServerStateFactory<
  [Context],
  SpecificUseQueryOutputs<
    ResourceName,
    ResourceState,
    InsertionsOutputs,
    ResourceParams,
    ResourceArgsParams
  >
>;

export function useQuery<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs,
  OtherProperties
>(
  resourceName: ResourceName,
  queryFactory:
    | {
        queryRef: QueryRef<
          NoInfer<ResourceState>,
          NoInfer<ResourceParams>,
          InsertionsOutputs
        >;
        __types: InternalType<
          ResourceState,
          ResourceParams,
          ResourceArgsParams,
          false
        >;
      }
    | (() => {
        queryRef: QueryRef<
          NoInfer<ResourceState>,
          NoInfer<ResourceParams>,
          InsertionsOutputs
        >;
        __types: InternalType<
          ResourceState,
          ResourceParams,
          ResourceArgsParams,
          false
        >;
      }),
  optionsFactory?: QueryOptions<
    Context,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    OtherProperties
  >
): UseQueryOutputs<
  Context,
  ResourceName,
  ResourceState,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> {
  return (context) => {
    const queryResult =
      typeof queryFactory === 'function' ? queryFactory() : queryFactory;
    const {
      queryRef: { resource: queryResource, insertionsOutputs },
    } = queryResult;
    return {
      props: {
        [`${resourceName as ResourceName}Query`]: Object.assign(
          queryResource,
          insertionsOutputs ?? {}
        ) as MergeObject<ResourceRef<ResourceState>, InsertionsOutputs>,
      },
      __query: {
        [resourceName as ResourceName]: queryResult,
      },
      __mutation: {},
      methods: {},
    } as SpecificUseQueryOutputs<
      ResourceName,
      ResourceState,
      InsertionsOutputs,
      ResourceParams,
      ResourceArgsParams
    >;
  };
}
