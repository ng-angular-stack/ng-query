import { InternalType, MergeObject } from '../types/util.type';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
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

type SpecificUseMutationByIdOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs
> = {
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
  inputs: {};
  __mutation: {
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
  __query: {};
};

type UsingMutationOutputs<
  Context extends ContextConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string
> = ServerStateFactoryUtility<
  Context,
  SpecificUseMutationByIdOutputs<
    ResourceName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    GroupIdentifier,
    InsertionsOutputs
  >
>;

export function usingMutationById<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs,
  OtherProperties // maybe add options only for this ?
>(
  resourceName: ResourceName,
  mutationFactory:
    | {
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
    | (() => {
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
      })
): UsingMutationOutputs<
  Context,
  ResourceName,
  ResourceState,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier
> {
  return (context) => {
    const mutationResult =
      typeof mutationFactory === 'function'
        ? mutationFactory()
        : mutationFactory;
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

    return {
      props: {
        [`${resourceName as ResourceName}MutationById`]: Object.assign(
          mutationResource,
          insertionsOutputs ?? {},
          method ? method : {}
        ),
      },
      __mutation: {
        [resourceName as ResourceName]: mutationResult,
      },
      inputs: {},
      __query: {},
      methods: method
        ? {
            [`mutate${capitalizedMutationName}ById`]: (data: any) => {
              const params = method(data);
              resourceParamsSrc.set(params);
            },
          }
        : {},
    } as SpecificUseMutationByIdOutputs<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      GroupIdentifier,
      InsertionsOutputs
    >;
  };
}
