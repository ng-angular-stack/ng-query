import {
  effect,
  inject,
  Injector,
  linkedSignal,
  ResourceRef,
  untracked,
  WritableSignal,
} from '@angular/core';
import {
  Prettify,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { InternalType, MergeObject } from './types/util.type';
import {
  OptimisticPathMutationQuery,
  ReloadQueriesConfig,
  QueryAndMutationRecordConstraints,
  FilterQueryById,
  ResourceMethod,
  PublicSignalStore,
} from './types/shared.type';
import {
  QueriesMutation,
  QueryImperativeEffect,
  reloadQueriesOnMutationChange,
  setOptimisticPatchQueriesValue,
  setOptimisticQueryValues,
} from './with-mutation';
import { ResourceByIdRef } from './resource-by-id';
import { nestedEffect } from './types/util';

export type MutationByIdRef<
  GroupIdentifier extends string | number,
  ResourceState,
  ResourceParams,
  ParamsArgs,
  InsertionsOutput
> = {
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
  method: ResourceMethod<ParamsArgs, ResourceParams> | undefined;
  insertionsOutputs: InsertionsOutput;
};

// TODO find a way to access to a resourceRef without userQueryById() because it will be updated each time the query is updated

type WithMutationByIdOutputStoreConfig<
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string | number,
  InsertionsOutput
> = {
  state: {};
  props: MergeObject<
    {
      [key in `${ResourceName & string}MutationById`]: MergeObject<
        ResourceByIdRef<GroupIdentifier, ResourceState>,
        InsertionsOutput
      >;
    },
    {
      __mutation: {
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
  // todo add only if there is a mutation  fn and MutationArgsParams
  methods: {
    [key in ResourceName as `mutate${Capitalize<key>}`]: (
      mutationParams: ResourceArgsParams
    ) => ResourceParams;
  };
};

type QueryDeclarativeEffect<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = {
  optimisticUpdate?: ({
    queryIdentifier,
    queryResource,
    mutationResource,
    mutationParams,
  }: {
    queryIdentifier: NoInfer<
      QueryAndMutationRecord['query']['groupIdentifier']
    >;
    queryResource: ResourceRef<QueryAndMutationRecord['query']['state']>;
    mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
    mutationParams: NoInfer<QueryAndMutationRecord['mutation']['params']>;
  }) => NoInfer<QueryAndMutationRecord['query']['state']>;
  reload?: ReloadQueriesConfig<QueryAndMutationRecord>;
  /**
   * Will patch the query specific state with the mutation data.
   * If the query is loading, it will not patch.
   * If the mutation data is not compatible with the query state, it will not patch.
   * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
   */
  optimisticPatch?: OptimisticPathMutationQuery<QueryAndMutationRecord>;
  filter: FilterQueryById<QueryAndMutationRecord>;
};

/**
 *
 * @param mutationName
 * @param mutationFactory
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
export function withMutationById<
  Input extends SignalStoreFeatureResult,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  GroupIdentifier extends string | number,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput
>(
  mutationName: ResourceName,
  mutationFactory: (store: StoreInput) => (
    store: StoreInput,
    context: Input
  ) => {
    mutationByIdRef: MutationByIdRef<
      NoInfer<GroupIdentifier>,
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      NoInfer<ResourceArgsParams>,
      InsertionsOutput
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
  queriesEffectsFn?: (
    store: StoreInput
  ) => QueriesMutation<
    Input,
    StoreInput,
    NoInfer<ResourceState>,
    NoInfer<ResourceParams>,
    NoInfer<ResourceArgsParams>,
    true,
    NoInfer<GroupIdentifier>
  >
): SignalStoreFeature<
  Input,
  WithMutationByIdOutputStoreConfig<
    ResourceName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    GroupIdentifier,
    InsertionsOutput
  >
> {
  return ((context: SignalStoreFeatureResult) => {
    const capitalizedMutationName =
      mutationName.charAt(0).toUpperCase() + mutationName.slice(1);

    return signalStoreFeature(
      withProps((store) => {
        const _injector = inject(Injector);

        const mutationConfigData = mutationFactory(
          store as unknown as StoreInput
        )(store as unknown as StoreInput, context as unknown as Input);

        const mutationResourceParamsSrc =
          mutationConfigData.mutationByIdRef.resourceParamsSrc;
        const mutationResourcesById =
          mutationConfigData.mutationByIdRef.resourceById;

        const queriesMutation = (queriesEffectsFn?.(
          store as unknown as StoreInput
        )?.queriesEffects ?? {}) as Record<string, QueryImperativeEffect<any>>;

        const queriesWithOptimisticMutation = Object.entries(
          queriesMutation
        ).filter(([, queryMutationConfig]) => queryMutationConfig.optimistic);
        const queriesWithOptimisticPatch = Object.entries(
          queriesMutation
        ).filter(
          ([, queryMutationConfig]) => queryMutationConfig.optimisticPatch
        );
        const queriesWithReload = Object.entries(queriesMutation).filter(
          ([, queryMutationConfig]) => queryMutationConfig.reload
        );

        const hasQueriesEffects =
          queriesWithOptimisticMutation.length ||
          queriesWithOptimisticPatch.length ||
          queriesWithReload.length;

        const newResourceRefForNestedEffect = linkedSignal<
          ResourceByIdRef<GroupIdentifier, ResourceState>,
          { newKeys: GroupIdentifier[] } | undefined
        >({
          source: mutationResourcesById as any,
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
        const insertionsOutputs =
          mutationConfigData.mutationByIdRef.insertionsOutputs ?? {};
        return {
          [`${mutationName}MutationById`]: Object.assign(
            mutationResourcesById,
            insertionsOutputs
          ),
          ...(hasQueriesEffects && {
            [`_${mutationName}EffectById`]: effect(() => {
              // todo add test for nestedEffect !

              if (!newResourceRefForNestedEffect()?.newKeys) {
                return;
              }
              newResourceRefForNestedEffect()?.newKeys.forEach(
                (incomingMutationIdentifier) => {
                  nestedEffect(_injector, () => {
                    const mutationResource =
                      mutationResourcesById()[incomingMutationIdentifier];

                    if (!mutationResource) {
                      return;
                    }
                    const mutationStatus = mutationResource.status();
                    const _mutationValue = mutationResource.value(); // track also the value
                    const _mutationParamsChange = mutationResourceParamsSrc();
                    // Handle optimistic updates on loading
                    untracked(() => {
                      setOptimisticQueryValues({
                        store: store as any,
                        queriesWithOptimisticMutation,
                        mutationStatus,
                        mutationResource:
                          mutationResource as ResourceRef<ResourceState>,
                        mutationParamsSrc: mutationResourceParamsSrc,
                        mutationIdentifier: incomingMutationIdentifier,
                        mutationResources: mutationResourcesById,
                      });
                    });

                    // Handle optimistic patch
                    untracked(() => {
                      setOptimisticPatchQueriesValue({
                        mutationStatus,
                        queriesWithOptimisticPatch,
                        store: store as any,
                        mutationResource,
                        mutationParamsSrc: mutationResourceParamsSrc,
                        mutationIdentifier: incomingMutationIdentifier,
                        mutationResources: mutationResourcesById,
                      });
                    });

                    // Handle reload queries
                    untracked(() => {
                      reloadQueriesOnMutationChange({
                        queriesWithReload,
                        store: store as any,
                        mutationStatus,
                        resourceParamsSrc: mutationResourceParamsSrc,
                        mutationResource,
                        mutationIdentifier: incomingMutationIdentifier,
                        mutationResources: mutationResourcesById,
                      });
                    });
                  });
                }
              );
            }),
          }),
          __mutation: {
            [`${mutationName}MutationById`]: {
              paramsSource: mutationResourceParamsSrc,
            },
          },
        };
      }),
      withMethods((store) => {
        // ! only used to get the method (do not used to get the src because, it will regenerate the mutation)
        const mutationResourceOption = mutationFactory(
          store as unknown as StoreInput
        )(store as unknown as StoreInput, context as unknown as Input);
        const mutationConfig = mutationResourceOption.mutationByIdRef;
        return {
          [`mutate${capitalizedMutationName}`]: (
            mutationParams: ResourceArgsParams
          ) => {
            const mutationMethod = mutationConfig.method;
            if (mutationMethod) {
              const mutationParamsResult = mutationMethod(mutationParams);
              store.__mutation[`${mutationName}MutationById`].paramsSource.set(
                mutationParamsResult as ResourceParams
              );
            }
          },
        };
      })
      //@ts-expect-error force the type
    )(context);
  }) as unknown as SignalStoreFeature<
    Input,
    WithMutationByIdOutputStoreConfig<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      GroupIdentifier,
      InsertionsOutput
    >
  >;
}
