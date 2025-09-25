import { InternalType, MergeObject } from '../types/util.type';
import { ContextConstraints, ServerStateFactory } from './server-state';
import { ResourceRef } from '@angular/core';
import { MutationRef } from '../with-mutation';

type SpecificUseMutationOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = {
  props: {
    [key in `${ResourceName}Mutation`]: MergeObject<
      ResourceRef<ResourceState>,
      InsertionsOutputs
    >;
  };
  methods: [ResourceArgsParams] extends [unknown]
    ? {
        [key in `mutate${Capitalize<ResourceName>}`]: (
          payload: ResourceArgsParams
        ) => void;
      }
    : {};
  __mutation: {
    [key in ResourceName]: {
      mutationRef: MutationRef<
        NoInfer<ResourceState>,
        NoInfer<ResourceParams>,
        NoInfer<ResourceArgsParams>,
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
  __query: {};
};

type UseMutationOutputs<
  Context extends ContextConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = ServerStateFactory<
  [Context],
  SpecificUseMutationOutputs<
    ResourceName,
    ResourceState,
    InsertionsOutputs,
    ResourceParams,
    ResourceArgsParams
  >
>;

export function useMutation<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs,
  OtherProperties
>(
  resourceName: ResourceName,
  mutationFactory:
    | {
        mutationRef: MutationRef<
          NoInfer<ResourceState>,
          NoInfer<ResourceParams>,
          NoInfer<ResourceArgsParams>,
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
        mutationRef: MutationRef<
          NoInfer<ResourceState>,
          NoInfer<ResourceParams>,
          NoInfer<ResourceArgsParams>,
          InsertionsOutputs
        >;
        __types: InternalType<
          ResourceState,
          ResourceParams,
          ResourceArgsParams,
          false
        >;
      })
): UseMutationOutputs<
  Context,
  ResourceName,
  ResourceState,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> {
  return (context) => {
    const mutationResult =
      typeof mutationFactory === 'function'
        ? mutationFactory()
        : mutationFactory;
    const {
      mutationRef: {
        resource: mutationResource,
        insertionsOutputs,
        method,
        resourceParamsSrc,
      },
    } = mutationResult;
    const capitalizedMutationName =
      resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

    return {
      props: {
        [`${resourceName as ResourceName}Mutation`]: Object.assign(
          mutationResource,
          insertionsOutputs ?? {},
          method ? method : {}
        ) as MergeObject<ResourceRef<ResourceState>, InsertionsOutputs> &
          ResourceArgsParams extends unknown
          ? {}
          : (data: ResourceArgsParams) => void,
      },
      __mutation: {
        [resourceName as ResourceName]: mutationResult,
      },
      __query: {},
      methods: method
        ? {
            [`mutate${capitalizedMutationName}`]: (data: any) => {
              const params = method(data);
              resourceParamsSrc.set(params);
            },
          }
        : {},
    } as SpecificUseMutationOutputs<
      ResourceName,
      ResourceState,
      InsertionsOutputs,
      ResourceParams,
      ResourceArgsParams
    >;
  };
}
