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
  queryFactory: {
    queryRef: QueryRef<
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      InsertionsOutputs
    >;
  } & {
    __types: InternalType<
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      false
    >;
  },
  optionsFactory?: QueryOptions<
    Context,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    OtherProperties
  >
): ServerStateFactory<
  [Context],
  {
    props: {
      [key in `${ResourceName & string}Query`]: MergeObject<
        ResourceRef<ResourceState>,
        InsertionsOutputs
      >;
    };
    methods: {};
    __query: {
      [key in ResourceName & string]: Prettify<
        InternalType<ResourceState, ResourceParams, ResourceArgsParams, false>
      >;
    };
    __mutation: {};
    __types: {};
  }
> {
  return ((context: SignalStoreFeatureResult) => {
    return signalStoreFeature(
      withProps((store) => {
        const _injector = inject(Injector);
        const queryConfigData = queryFactory(
          store as unknown as StoreInput,
          _injector
        )(store as unknown as StoreInput, context as unknown as Input);

        const queryResourceParamsSrc =
          queryConfigData.queryRef.resourceParamsSrc;

        const queryResource = queryConfigData.queryRef.resource;

        const queryOptions = optionsFactory?.(store as unknown as StoreInput);

        const associatedClientStates = Object.entries(
          (queryOptions?.associatedClientState ?? {}) as Record<
            string,
            | boolean
            | AssociatedStateMapperFn<ResourceState, ResourceParams, unknown>
          >
        ).filter(([, value]) => !!value);

        const mutationsConfigEffect = Object.entries(
          (queryOptions?.on ?? {}) as Record<
            string,
            QueryDeclarativeEffect<any>
          >
        );

        const insertionsOutputs = queryConfigData.queryRef.insertionsOutputs;

        return {
          [`${resourceName}Query`]: Object.assign(
            queryResource,
            insertionsOutputs ?? {}
          ),
          ...(associatedClientStates.length && {
            [`_${resourceName}Effect`]: effect(() => {
              if (!['resolved', 'local'].includes(queryResource.status())) {
                return;
              }
              untracked(() =>
                updateAssociatedClientStates<ResourceState, ResourceParams>({
                  associatedClientStates,
                  store,
                  queryResource,
                  queryResourceParamsSrc,
                })
              );
            }),
          }),
          ...(mutationsConfigEffect.length &&
            mutationsConfigEffect.reduce(
              (acc, [mutationName, mutationEffectOptions]) => {
                const mutationTargeted = (store as any)[mutationName] as
                  | ResourceRef<any>
                  | ResourceByIdRef<string | number, any, ResourceParams>;
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

                        if (
                          mutationEffectOptions?.optimisticUpdate ||
                          mutationEffectOptions?.update
                        ) {
                          untracked(() => {
                            setAllUpdatesFromMutationOnQueryValue({
                              mutationStatus,
                              queryResourceTarget: queryResource,
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
                              queryResourceTarget: queryResource,
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
                              queryResourceTarget: queryResource,
                              mutationEffectOptions,
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
                  ResourceByIdRef<
                    string | number,
                    ResourceState,
                    ResourceParams
                  >,
                  { newKeys: (string | number)[] } | undefined
                >({
                  source: mutationTargeted as any,
                  computation: (currentSource, previous) => {
                    if (!currentSource || !Object.keys(currentSource).length) {
                      return undefined;
                    }

                    const currentKeys = Object.keys(currentSource) as (
                      | string
                      | number
                    )[];
                    const previousKeys = Object.keys(
                      previous?.source || {}
                    ) as (string | number)[];

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
                            const _mutationValueChanged =
                              mutationResource.hasValue()
                                ? mutationResource.value()
                                : undefined;
                            if (
                              mutationEffectOptions?.optimisticUpdate ||
                              mutationEffectOptions?.update
                            ) {
                              untracked(() => {
                                setAllUpdatesFromMutationOnQueryValue({
                                  mutationStatus,
                                  queryResourceTarget: queryResource,
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
                                  queryResourceTarget: queryResource,
                                  mutationEffectOptions,
                                  mutationResource,
                                  mutationParamsSrc,
                                  reloadCConfig,
                                  mutationIdentifier,
                                  mutationResources: mutationTargeted,
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
                                  queryResourceTarget: queryResource,
                                  mutationEffectOptions,
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
      //@ts-expect-error force the type
    )(context);
  }) as unknown as SignalStoreFeature<
    Input,
    WithQueryOutputStoreConfig<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      false,
      InsertionsOutputs
    >
  >;
}
