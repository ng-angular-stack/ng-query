import {
  effect,
  EffectRef,
  inject,
  Injector,
  linkedSignal,
  untracked,
  WritableSignal,
} from '@angular/core';

import {
  QueryDeclarativeEffect,
  setAllUpdatesFromMutationOnQueryValue,
  triggerQueryReloadOnMutationStatusChange,
  setAllPatchFromMutationOnQueryValue,
} from '../core/query.core';
import { ResourceByIdRef } from '../resource-by-id';
import { nestedEffect } from '../types/util';
import { MergeObject, InternalType } from '../types/util.type';
import {
  ContextConstraints,
  MutationDictionary,
  ServerStateFactoryUtility,
} from './server-state';

export type QueryByIdRef<
  GroupIdentifier extends string,
  ResourceState,
  ResourceParams,
  InsertionsOutput
> = {
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
  insertionsOutputs: InsertionsOutput;
};

type SpecificUsingQueryOutputs<
  GroupIdentifier extends string,
  ResourceName extends string,
  ResourceState extends object | undefined,
  InsertionsOutputs,
  ResourceParams,
  ResourceArgsParams
> = {
  props: {
    [key in `${ResourceName & string}QueryById`]: MergeObject<
      ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>,
      InsertionsOutputs
    >;
  };
  methods: {};
  inputs: {};
  __injections: {};
  queryParams: {};
  sources: {};
  standalone: {};
  __query: {
    [key in ResourceName & string]: {
      queryRef: QueryByIdRef<
        GroupIdentifier,
        ResourceState,
        ResourceParams,
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
  __mutation: {};
};

type UsingQueryOutputs<
  Context extends ContextConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingQueryOutputs<
    GroupIdentifier,
    ResourceName,
    ResourceState,
    InsertionsOutputs,
    ResourceParams,
    ResourceArgsParams
  >
>;

export type QueryByIdOptions<
  Context extends ContextConstraints,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string,
  ResourceArgsParams,
  OtherProperties
> = {
  test1?: Context['__mutation'] extends infer Mutations ? Mutations : 'lol';
  on?: Context['__mutation'] extends infer Mutations
    ? {
        [key in keyof Mutations as `${key &
          string}${'__types' extends keyof Mutations[key]
          ? Mutations[key]['__types'] extends InternalType<
              infer _State,
              infer _Params,
              infer _Args,
              infer IsGroupedResource
            >
            ? IsGroupedResource extends true
              ? 'MutationById'
              : 'Mutation'
            : never
          : never}`]?: '__types' extends keyof Mutations[key]
          ? Mutations[key]['__types'] extends InternalType<
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
                  true,
                  GroupIdentifier
                >;
                mutation: InternalType<
                  MutationState,
                  MutationParams,
                  MutationArgsParams,
                  MutationIsByGroup,
                  MutationGroupIdentifier
                >;
              }>
            : never
          : never;
      }
    : never;
} & {
  [key in keyof OtherProperties]: OtherProperties[key];
};

/**
 *
 * @param resourceName
 * @param queryFactory
 * @param options To help for type inference, you may always get the store as a parameter. Otherwise the mapResourceToState may be requested without the real needs
 * @example
 * ```ts
withQuery(
      'userDetails',
      (store) =>
        query(...),
      (store) => ({
        associatedClientState: {
          path: 'user',
        },
      })
    ),
 * ```
 * @returns
 */
export function usingQueryById<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string,
  InsertionsOutputs,
  OtherProperties
>(
  resourceName: ResourceName,
  queryFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['queryParams']
  ) => {
    queryRef: QueryByIdRef<
      NoInfer<GroupIdentifier>,
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      InsertionsOutputs
    >;
  } & {
    __types: InternalType<
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      true,
      GroupIdentifier
    >;
  },
  queryOptions?: QueryByIdOptions<
    Context,
    ResourceState,
    ResourceParams,
    GroupIdentifier,
    ResourceArgsParams,
    OtherProperties
  >
): UsingQueryOutputs<
  Context,
  ResourceName,
  ResourceState,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier,
  InsertionsOutputs
> {
  return (contextData, injector) => {
    console.log(
      'contextData.context.queryParams',
      contextData.context.queryParams
    );
    const queryResult = queryFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.queryParams,
    });
    const {
      queryRef: { resourceById: queryResourcesById, insertionsOutputs },
    } = queryResult;
    const mutationsConfigEffect = Object.entries(
      (queryOptions?.on ?? {}) as Record<string, QueryDeclarativeEffect<any>>
    );
    const context = contextData.context;

    handleQueryByIdMutationEffects<
      Context,
      ResourceName,
      ResourceState,
      ResourceParams,
      GroupIdentifier
    >(
      mutationsConfigEffect,
      context as unknown as Context,
      resourceName,
      queryResourcesById,
      injector
    );
    return {
      props: {
        [`${resourceName as ResourceName}QueryById`]: Object.assign(
          queryResourcesById,
          insertionsOutputs ?? {}
        ) as MergeObject<
          ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>,
          InsertionsOutputs
        >,
      },
      inputs: {},
      __injections: {},
      queryParams: {},
      sources: {},
      standalone: {},
      __query: {
        [resourceName as ResourceName]: queryResult,
      },
      __mutation: {},
      methods: {},
    } as SpecificUsingQueryOutputs<
      GroupIdentifier,
      ResourceName,
      ResourceState,
      InsertionsOutputs,
      ResourceParams,
      ResourceArgsParams
    >;
  };
}
function handleQueryByIdMutationEffects<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string
>(
  mutationsConfigEffect: [string, QueryDeclarativeEffect<any>][],
  context: Context,
  resourceName: ResourceName,
  queryResourcesById: ResourceByIdRef<
    NoInfer<GroupIdentifier>,
    NoInfer<ResourceState>,
    NoInfer<ResourceParams>
  >,
  _injector: Injector
) {
  return {
    ...(mutationsConfigEffect.length &&
      mutationsConfigEffect.reduce(
        (acc, [mutationName, mutationEffectOptions]) => {
          const formattedMutationName = mutationName
            .replace('Mutation', '')
            .replace('ById', '');
          const mutationTargeted = (context.__mutation as MutationDictionary)[
            formattedMutationName
          ]?.mutationRef;

          if ('resource' in mutationTargeted) {
            const mutationResource = mutationTargeted.resource;
            return {
              ...acc,
              [`_on${mutationName}${resourceName}QueryEffect`]: effect(() => {
                const mutationStatus = mutationResource.status();
                const mutationParamsSrc = mutationTargeted.resourceParamsSrc;
                // use to track the value of the mutation
                const _mutationValueChanged = mutationResource.hasValue()
                  ? mutationResource.value()
                  : undefined;

                if (
                  mutationEffectOptions?.optimisticUpdate ||
                  mutationEffectOptions.update
                ) {
                  untracked(() => {
                    setAllUpdatesFromMutationOnQueryValue({
                      mutationStatus,
                      //@ts-expect-error not understand from where the error come from
                      queryResourceTarget: queryResourcesById,
                      mutationEffectOptions,
                      mutationResource,
                      mutationParamsSrc,
                      mutationIdentifier: undefined,
                      mutationResources: undefined,
                    });
                  });
                }
                const reloadCConfig = mutationEffectOptions.reload;
                if (reloadCConfig) {
                  untracked(() => {
                    triggerQueryReloadOnMutationStatusChange({
                      mutationStatus,
                      //@ts-expect-error not understand from where the error come from
                      queryResourceTarget: queryResourcesById,
                      mutationEffectOptions,
                      mutationResource,
                      mutationParamsSrc,
                      reloadCConfig,
                      mutationIdentifier: undefined,
                      mutationResources: undefined,
                    });
                  });
                }
                if (
                  mutationEffectOptions.optimisticPatch ||
                  mutationEffectOptions.patch
                ) {
                  untracked(() => {
                    setAllPatchFromMutationOnQueryValue({
                      mutationStatus,
                      //@ts-expect-error not understand from where the error come from
                      queryResourceTarget: queryResourcesById,
                      mutationEffectOptions: mutationEffectOptions as any,
                      mutationResource,
                      mutationParamsSrc,
                      mutationIdentifier: undefined,
                      mutationResources: undefined,
                    });
                  });
                }
              }),
            };
          }
          const mutationResources = mutationTargeted.resourceById;
          const newMutationResourceRefForNestedEffect = linkedSignal<
            ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>,
            { newKeys: GroupIdentifier[] } | undefined
          >({
            source: mutationTargeted.resourceById as any,
            computation: (currentSource, previous) => {
              if (!currentSource || !Object.keys(currentSource).length) {
                return undefined;
              }

              const currentKeys = Object.keys(
                currentSource
              ) as GroupIdentifier[];
              const previousKeys = Object.keys(
                previous?.source || {}
              ) as GroupIdentifier[];

              // Find keys that exist in current but not in previous
              const newKeys = currentKeys.filter(
                (key) => !previousKeys.includes(key)
              );

              return newKeys.length > 0 ? { newKeys } : previous?.value;
            },
          });

          return {
            ...acc,
            [`_on${mutationName}${resourceName}QueryEffect`]: effect(() => {
              if (!newMutationResourceRefForNestedEffect()?.newKeys) {
                return;
              }
              newMutationResourceRefForNestedEffect()?.newKeys.forEach(
                (mutationIdentifier) => {
                  nestedEffect(_injector, () => {
                    const mutationResource =
                      mutationTargeted.resourceById()[mutationIdentifier];

                    if (!mutationResource) {
                      return;
                    }
                    const mutationStatus = mutationResource.status();
                    const mutationParamsSrc =
                      mutationTargeted.resourceParamsSrc;
                    // use to track the value of the mutation
                    const _mutationValueChanged = mutationResource.hasValue()
                      ? mutationResource.value()
                      : undefined;

                    if (
                      typeof mutationParamsSrc === 'function' &&
                      mutationParamsSrc()
                    ) {
                      // ! keep this check, it is used to track mutationParamsSrc, otherwise it does not works
                    }
                    if (
                      mutationEffectOptions?.optimisticUpdate ||
                      mutationEffectOptions.update
                    ) {
                      untracked(() => {
                        setAllUpdatesFromMutationOnQueryValue({
                          mutationStatus,
                          //@ts-expect-error not understand from where the error come from
                          queryResourceTarget: queryResourcesById,
                          mutationEffectOptions,
                          mutationResource,
                          mutationParamsSrc,
                          mutationIdentifier,
                          mutationResources,
                        });
                      });
                    }
                    const reloadCConfig = mutationEffectOptions.reload;
                    if (reloadCConfig) {
                      untracked(() => {
                        triggerQueryReloadOnMutationStatusChange({
                          mutationStatus,
                          //@ts-expect-error not understand from where the error come from
                          queryResourceTarget: queryResourcesById,
                          mutationEffectOptions,
                          mutationResource,
                          mutationParamsSrc,
                          reloadCConfig,
                          mutationIdentifier,
                          mutationResources,
                        });
                      });
                    }
                    if (
                      mutationEffectOptions.optimisticPatch ||
                      mutationEffectOptions.patch
                    ) {
                      untracked(() => {
                        setAllPatchFromMutationOnQueryValue({
                          mutationStatus,
                          //@ts-expect-error not understand from where the error come from
                          queryResourceTarget: queryResourcesById,
                          mutationEffectOptions,
                          mutationResource,
                          mutationParamsSrc,
                          mutationIdentifier: mutationIdentifier,
                          mutationResources,
                        });
                      });
                    }
                  });
                }
              );
            }),
          };
        },
        {} as Record<`_on${string}${ResourceName}QueryEffect`, EffectRef>
      )),
  };
}
