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
import { MutationByIdRef } from '../with-mutation-by-id';
import { ResourceByIdRef } from '../resource-by-id';

type MutationByIdPropsOutput<
  ResourceName extends string,
  GroupIdentifier extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  InsertionsOutputs
> = {
  [key in `${ResourceName}MutationById`]: MergeObject<
    ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>,
    InsertionsOutputs
  >;
};

type SpecificCraftMutationByIdOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs
> = PartialContext<{
  props: MutationByIdPropsOutput<
    ResourceName,
    GroupIdentifier,
    ResourceState,
    ResourceParams,
    InsertionsOutputs
  >;
  methods: [ResourceArgsParams] extends [unknown]
    ? {
        [key in `mutate${Capitalize<ResourceName>}ById`]: (
          payload: ResourceArgsParams
        ) => void;
      }
    : {};
  _mutation: {
    [key in ResourceName]: {
      mutationRef: MutationByIdRef<
        GroupIdentifier,
        ResourceState,
        ResourceParams,
        ResourceArgsParams,
        InsertionsOutputs
      >;
      __types: InternalType<
        ResourceState,
        ResourceParams,
        ResourceArgsParams,
        true,
        GroupIdentifier
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
  ResourceArgsParams,
  GroupIdentifier extends string
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftMutationByIdOutputs<
    ResourceName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    GroupIdentifier,
    InsertionsOutputs
  >
>;

export function craftMutationById<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs,
  OtherProperties // maybe add options only for this ?
>(
  resourceName: ResourceName,
  mutationFactory: (context: CraftFactoryEntries<Context>) => {
    // ! avoid to get the MutationRef directly, because it will return a ResourceRef that must be instantiated in an injectionContext
    // That why it is always wrapped in a function
    mutationRef: MutationByIdRef<
      NoInfer<GroupIdentifier>,
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      NoInfer<ResourceArgsParams>,
      InsertionsOutputs
    >;
    __types: InternalType<
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      true,
      GroupIdentifier
    >;
  }
): CraftMutationOutputs<
  Context,
  StoreConfig,
  ResourceName,
  ResourceState,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier
> {
  return (_cloudProxy) => (contextData) => {
    const mutationResult = mutationFactory(craftFactoryEntries(contextData));
    const {
      mutationRef: {
        resourceById: mutationResource,
        insertionsOutputs,
        method,
        resourceParamsSrc,
      },
    } = mutationResult;
    const capitalizedMutationName =
      resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

    return partialContext({
      props: {
        [`${resourceName as ResourceName}MutationById`]: Object.assign(
          mutationResource,
          insertionsOutputs ?? {},
          method ? method : {}
        ),
      },
      _mutation: {
        [resourceName as ResourceName]: mutationResult,
      },
      methods: method
        ? {
            [`mutate${capitalizedMutationName}ById`]: (data: any) => {
              if (method) {
                const mutationParamsResult = method(data);

                if (mutationParamsResult) {
                  mutationResource.add(mutationParamsResult);
                }
                resourceParamsSrc.set(mutationParamsResult);
              }
            },
          }
        : {},
    }) as SpecificCraftMutationByIdOutputs<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      GroupIdentifier,
      InsertionsOutputs
    >;
  };
}
