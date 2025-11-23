import { InternalType, MergeObject } from '../types/util.type';
import {
  ContextConstraints,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  partialContext,
  PartialContext,
  StoreConfigConstraints,
} from './craft';
import { ResourceRef } from '@angular/core';
import { MutationRef } from '../with-mutation';

type SpecificCraftMutationOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = PartialContext<{
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
  _mutation: {
    [key in ResourceName]: {
      mutationRef: MutationRef<
        ResourceState,
        ResourceParams,
        ResourceArgsParams,
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
}>;

type CraftMutationOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftMutationOutputs<
    ResourceName,
    ResourceState,
    InsertionsOutputs,
    ResourceParams,
    ResourceArgsParams
  >
>;

export function craftMutation<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs,
  OtherProperties
>(
  resourceName: ResourceName,
  mutationFactory: (context: CraftFactoryEntries<Context>) => {
    // ! avoid to get the MutationRef directly, because it will return a ResourceRef that must be instantiated in an injectionContext
    // That why it is always wrapped in a function
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
): CraftMutationOutputs<
  Context,
  StoreConfig,
  ResourceName,
  ResourceState,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> {
  return (contextData) => {
    const mutationResult = mutationFactory(craftFactoryEntries(contextData));
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

    return partialContext({
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
      _mutation: {
        [resourceName as ResourceName]: mutationResult,
      },
      methods: method
        ? {
            [`mutate${capitalizedMutationName}`]: (data: any) => {
              const params = method(data);
              resourceParamsSrc.set(params);
            },
          }
        : {},
    }) as SpecificCraftMutationOutputs<
      ResourceName,
      ResourceState,
      InsertionsOutputs,
      ResourceParams,
      ResourceArgsParams
    >;
  };
}
