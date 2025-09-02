import {
  effect,
  EffectRef,
  inject,
  Injector,
  linkedSignal,
  ResourceRef,
  Signal,
  untracked,
} from '@angular/core';
import {
  patchState,
  Prettify,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  withProps,
  WritableStateSource,
} from '@ngrx/signals';
import { InternalType } from './types/util.type';
import { Merge } from '../../../util/types/merge';
import { __InternalSharedMutationConfig } from './with-mutation';
import { ResourceByIdRef } from '../resource-by-id';
import {
  AssociatedStateMapperFnById,
  BooleanOrMapperFnByPathById,
} from './types/boolean-or-mapper-fn-by-path-by-id.type';
import { nestedEffect } from './types/util';
import { createNestedStateUpdate } from './core/update-state.util';
import {
  ExtendsFactory,
  QueryDeclarativeEffect,
  setOptimisticPatchFromMutationOnQueryValue,
  setOptimisticUpdateFromMutationOnQueryValue,
  triggerQueryReloadOnMutationStatusChange,
} from './core/query.core';

export type QueryByIdRef<
  GroupIdentifier extends string | number,
  ResourceState,
  ResourceParams
> = {
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState>;
  resourceParamsSrc: Signal<ResourceParams | undefined>;
};

// TODO find a way to access to a resourceRef without userQueryById() because it will be updated each time the query is updated

type WithQueryByIdOutputStoreConfig<
  ResourceName,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string | number,
  ExtendedOutputs extends Record<string, unknown>
> = {
  state: {};
  props: Merge<
    {
      [key in `${ResourceName & string}QueryById`]: ResourceByIdRef<
        GroupIdentifier,
        ResourceState
      > &
        ExtendedOutputs;
    },
    {
      __query: {
        [key in ResourceName & string]: Prettify<
          InternalType<
            ResourceState,
            ResourceParams,
            ResourceArgsParams,
            true,
            GroupIdentifier
          >
        >;
      };
    }
  >;
  methods: {};
};

export type QueryByIdOptions<
  StoreInput extends Prettify<
    StateSignals<Input['state']> &
      Input['props'] &
      Input['methods'] &
      WritableStateSource<Prettify<Input['state']>>
  >,
  Input extends SignalStoreFeatureResult,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string | number,
  ResourceArgsParams,
  OtherProperties extends Record<string, unknown> = {}
> = (store: StoreInput) => {
  // Exclude path from the MergeObject, it will enable the const type inference, otherwise it will be inferred as string
  /**
   * Will update the state at the given path with the resource data (if the data id resolved or set 'local').
   * If the type of targeted state does not match the type of the resource,
   * a function is required.
   * - If the function is requested without the real needs, you may declare deliberately the store as a parameter of the option factory.
   */
  associatedClientState?: BooleanOrMapperFnByPathById<
    NoInfer<Input>['state'],
    NoInfer<ResourceState>,
    NoInfer<ResourceParams>,
    NoInfer<GroupIdentifier>
  > extends infer BooleanOrMapperFnByPath
    ? {
        [Path in keyof BooleanOrMapperFnByPath]?: BooleanOrMapperFnByPath[Path];
      }
    : never;
  on?: Input['props'] extends {
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
export function withQueryById<
  Input extends SignalStoreFeatureResult,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string | number,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> &
      Input['props'] &
      Input['methods'] &
      WritableStateSource<Prettify<Input['state']>>
  >,
  ExtendedOutputs extends Record<string, unknown> = {}
>(
  resourceName: ResourceName,
  queryFactory: (
    store: StoreInput,
    injector: Injector
  ) => (
    store: StoreInput,
    context: Input
  ) => {
    queryByIdRef: QueryByIdRef<
      NoInfer<GroupIdentifier>,
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>
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
  optionsFactory?: QueryByIdOptions<
    StoreInput,
    Input,
    ResourceState,
    ResourceParams,
    GroupIdentifier,
    ResourceArgsParams,
    ExtendedOutputs
  >
): SignalStoreFeature<
  Input,
  WithQueryByIdOutputStoreConfig<
    ResourceName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    GroupIdentifier,
    ExtendedOutputs
  >
> {
  return ((context: SignalStoreFeatureResult) => {
    return signalStoreFeature(
      withProps((store) => {
        const _injector = inject(Injector);

        const queryConfigData = queryFactory(
          store as unknown as StoreInput,
          _injector
        )(store as unknown as StoreInput, context as unknown as Input);

        const resourceParamsSrc =
          queryConfigData.queryByIdRef.resourceParamsSrc;
        const queryResourcesById = queryConfigData.queryByIdRef.resourceById;
        const queryOptions = optionsFactory?.(store as unknown as StoreInput);

        const associatedClientStates = Object.entries(
          (queryOptions?.associatedClientState ?? {}) as Record<
            string,
            | boolean
            | AssociatedStateMapperFnById<
                ResourceState,
                ResourceParams,
                unknown,
                GroupIdentifier
              >
          >
        ).filter(([, value]) => !!value);

        const mutationsConfigEffect = Object.entries(
          (queryOptions?.on ?? {}) as Record<
            string,
            QueryDeclarativeEffect<any>
          >
        );

        const newResourceRefForNestedEffect = linkedSignal<
          ResourceByIdRef<GroupIdentifier, ResourceState>,
          { newKeys: GroupIdentifier[] } | undefined
        >({
          source: queryResourcesById as any,
          computation: (currentSource, previous) => {
            if (!currentSource || !Object.keys(currentSource).length) {
              return undefined;
            }

            const currentKeys = Object.keys(currentSource) as GroupIdentifier[];
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
          [`${resourceName}QueryById`]: queryResourcesById,
          ...(associatedClientStates.length && {
            [`_${resourceName}EffectById`]: effect(() => {
              // todo add test for nestedEffect !

              if (!newResourceRefForNestedEffect()?.newKeys) {
                return;
              }
              newResourceRefForNestedEffect()?.newKeys.forEach(
                (incomingIdentifier) => {
                  nestedEffect(_injector, () => {
                    const queryResource =
                      queryResourcesById()[incomingIdentifier];

                    if (!queryResource) {
                      return;
                    }
                    const queryStatus = queryResource.status();
                    const queryValue = queryResource.value(); // track also the value
                    untracked(() => {
                      if (!['resolved', 'local'].includes(queryStatus)) {
                        return;
                      }
                      updateAssociatedClientStates<
                        ResourceState,
                        ResourceParams,
                        GroupIdentifier
                      >({
                        associatedClientStates,
                        store,
                        queryResource,
                        resourceParamsSrc,
                        incomingIdentifier,
                        queryResourcesById,
                      });
                    });
                  });
                }
              );
            }),
          }),
          ...(mutationsConfigEffect.length &&
            mutationsConfigEffect.reduce(
              (acc, [mutationName, mutationEffectOptions]) => {
                const mutationTargeted = (store as any)[mutationName] as
                  | ResourceRef<any>
                  | ResourceByIdRef<string | number, any>;
                if ('hasValue' in mutationTargeted) {
                  const mutationResource = mutationTargeted as ResourceRef<any>;
                  return {
                    ...acc,
                    [`_on${mutationName}${resourceName}QueryEffect`]: effect(
                      () => {
                        const mutationStatus = mutationResource.status();
                        const mutationParamsSrc = (store as any)['__mutation'][
                          mutationName
                        ].paramsSource as Signal<any>;
                        // use to track the value of the mutation
                        const mutationValueChanged = mutationResource.hasValue()
                          ? mutationResource.value()
                          : undefined;

                        if (mutationEffectOptions?.optimisticUpdate) {
                          untracked(() => {
                            setOptimisticUpdateFromMutationOnQueryValue({
                              mutationStatus,
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
                        if (mutationEffectOptions.optimisticPatch) {
                          untracked(() => {
                            setOptimisticPatchFromMutationOnQueryValue({
                              mutationStatus,
                              queryResourceTarget: queryResourcesById,
                              mutationEffectOptions:
                                mutationEffectOptions as any,
                              mutationResource,
                              mutationParamsSrc,
                              mutationIdentifier: undefined,
                              mutationResources: undefined,
                            });
                          });
                        }
                      }
                    ),
                  };
                }
                const newMutationResourceRefForNestedEffect = linkedSignal<
                  ResourceByIdRef<GroupIdentifier, ResourceState>,
                  { newKeys: GroupIdentifier[] } | undefined
                >({
                  source: mutationTargeted as any,
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
                  [`_on${mutationName}${resourceName}QueryEffect`]: effect(
                    () => {
                      if (!newMutationResourceRefForNestedEffect()?.newKeys) {
                        return;
                      }
                      newMutationResourceRefForNestedEffect()?.newKeys.forEach(
                        (mutationIdentifier) => {
                          nestedEffect(_injector, () => {
                            const mutationResource =
                              mutationTargeted()[mutationIdentifier];

                            if (!mutationResource) {
                              return;
                            }
                            const mutationStatus = mutationResource.status();
                            const mutationParamsSrc = (store as any)[
                              '__mutation'
                            ][mutationName].paramsSource as Signal<any>;
                            // use to track the value of the mutation
                            const mutationValueChanged =
                              mutationResource.hasValue()
                                ? mutationResource.value()
                                : undefined;

                            if (mutationEffectOptions?.optimisticUpdate) {
                              untracked(() => {
                                setOptimisticUpdateFromMutationOnQueryValue({
                                  mutationStatus,
                                  queryResourceTarget: queryResourcesById,
                                  mutationEffectOptions,
                                  mutationResource,
                                  mutationParamsSrc,
                                  mutationIdentifier,
                                  mutationResources: mutationTargeted,
                                });
                              });
                            }
                            const reloadCConfig = mutationEffectOptions.reload;
                            if (reloadCConfig) {
                              untracked(() => {
                                triggerQueryReloadOnMutationStatusChange({
                                  mutationStatus,
                                  queryResourceTarget: queryResourcesById,
                                  mutationEffectOptions,
                                  mutationResource,
                                  mutationParamsSrc,
                                  reloadCConfig,
                                  mutationIdentifier,
                                  mutationResources: mutationTargeted,
                                });
                              });
                            }
                            if (mutationEffectOptions.optimisticPatch) {
                              untracked(() => {
                                setOptimisticPatchFromMutationOnQueryValue({
                                  mutationStatus,
                                  queryResourceTarget: queryResourcesById,
                                  mutationEffectOptions:
                                    mutationEffectOptions as any,
                                  mutationResource,
                                  mutationParamsSrc,
                                  mutationIdentifier: mutationIdentifier,
                                  mutationResources: mutationTargeted,
                                });
                              });
                            }
                          });
                        }
                      );
                    }
                  ),
                };
              },
              {} as Record<`_on${string}${ResourceName}QueryEffect`, EffectRef>
            )),
        };
      })
      //@ts-ignore
    )(context);
  }) as unknown as SignalStoreFeature<
    Input,
    WithQueryByIdOutputStoreConfig<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      GroupIdentifier,
      ExtendedOutputs
    >
  >;
}

function updateAssociatedClientStates<
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string | number
>({
  associatedClientStates,
  store,
  queryResource,
  resourceParamsSrc,
  incomingIdentifier,
  queryResourcesById,
}: {
  associatedClientStates: [
    string,
    (
      | boolean
      | AssociatedStateMapperFnById<
          ResourceState,
          ResourceParams,
          unknown,
          GroupIdentifier
        >
    )
  ][];
  store: WritableStateSource<any>;
  queryResource: ResourceRef<NoInfer<ResourceState>>;
  resourceParamsSrc: Signal<NoInfer<ResourceParams> | undefined>;
  incomingIdentifier: GroupIdentifier;
  queryResourcesById: ResourceByIdRef<
    NoInfer<GroupIdentifier>,
    NoInfer<ResourceState>
  >;
}) {
  associatedClientStates.forEach(([path, associatedClientState]) => {
    patchState(store, (state) => {
      const resourceData = queryResource.hasValue()
        ? (queryResource.value() as ResourceState | undefined)
        : undefined;
      const value =
        typeof associatedClientState === 'boolean'
          ? resourceData
          : associatedClientState({
              queryResource: queryResource as ResourceRef<ResourceState>,
              //todo improve warn: it have a desynchronisation resourceParamsSrc() may change to fast and params will be for another queryById resource
              queryParams: resourceParamsSrc() as NonNullable<
                NoInfer<ResourceParams>
              >,
              queryIdentifier: incomingIdentifier,
              queryResources: queryResourcesById,
            });
      const keysPath = (path as string).split('.');
      const result = createNestedStateUpdate({
        state,
        keysPath,
        value,
      });
      return result;
    });
  });
}
