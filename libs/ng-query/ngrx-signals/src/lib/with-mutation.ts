import {
  ResourceRef,
  ResourceStatus,
  Signal,
  WritableSignal,
  effect,
  untracked,
} from '@angular/core';
import {
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { InternalType, MergeObject, MergeObjects } from './types/util.type';

import {
  createNestedStateUpdate,
  getNestedStateValue,
} from './core/update-state.util';
import {
  PatchQueryFn,
  PatchMutationQuery,
  ReloadQueriesConfig,
  QueryAndMutationRecordConstraints,
  FilterQueryById,
  ResourceMethod,
  PublicSignalStore,
} from './types/shared.type';
import { ResourceByIdRef } from './resource-by-id';

export type MutationRef<
  ResourceState,
  ResourceParams,
  ParamsArgs,
  InsertionsOutput
> = {
  resource: ResourceRef<ResourceState | undefined>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
  method: ResourceMethod<ParamsArgs, ResourceParams> | undefined;
  insertionsOutputs: InsertionsOutput;
};
type OptimisticMutationQuery<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = (
  data: MergeObjects<
    [
      {
        queryResource: ResourceRef<QueryAndMutationRecord['query']['state']>;
        mutationResource: ResourceRef<
          NoInfer<QueryAndMutationRecord['mutation']['state']>
        >;
        mutationParams: NonNullable<
          NoInfer<QueryAndMutationRecord['mutation']['params']>
        >;
      },
      QueryAndMutationRecord['query']['isGroupedResource'] extends true
        ? {
            queryIdentifier: QueryAndMutationRecord['query']['groupIdentifier'];
            queryResources: ResourceByIdRef<
              string | number,
              QueryAndMutationRecord['query']['state'],
              QueryAndMutationRecord['query']['params']
            >;
          }
        : {},
      QueryAndMutationRecord['mutation']['groupIdentifier'] extends
        | string
        | number
        ? {
            mutationIdentifier: QueryAndMutationRecord['mutation']['groupIdentifier'];
            mutationResources: ResourceByIdRef<
              string | number,
              QueryAndMutationRecord['mutation']['state'],
              QueryAndMutationRecord['mutation']['params']
            >;
          }
        : {}
    ]
  >
) => QueryAndMutationRecord['query']['state'];

export type QueryImperativeEffect<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = MergeObject<
  {
    /**
     * Will update the query state with the mutation data.
     * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
     */
    optimisticUpdate?: OptimisticMutationQuery<QueryAndMutationRecord>;
    /**
     * Will reload the query when the mutation is in a specific state.
     * If not provided, it will reload the query onMutationResolved and onMutationError.
     * If the query is loading, it will not reload.
     */
    reload?: ReloadQueriesConfig<QueryAndMutationRecord>;
    /**
     * Will patch the query specific state with the mutation data.
     * If the query is loading, it will not patch.
     * If the mutation data is not compatible with the query state, it will not patch.
     * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
     */
    optimisticPatch?: PatchMutationQuery<QueryAndMutationRecord>;
  },
  QueryAndMutationRecord['query']['isGroupedResource'] extends true
    ? {
        filter: FilterQueryById<QueryAndMutationRecord>;
      }
    : {}
>;

export type QueriesMutation<
  Input extends SignalStoreFeatureResult,
  StoreInput extends PublicSignalStore<Input>,
  MutationState,
  MutationParams,
  MutationArgsParams,
  MutationIsGroupedResource,
  MutationGroupIdentifier
> = {
  queriesEffects?: Input['props'] extends {
    __query: infer Queries;
  }
    ? {
        [key in keyof Queries as `${key &
          string}${'isGroupedResource' extends keyof Queries[key]
          ? Queries[key]['isGroupedResource'] extends true
            ? 'QueryById'
            : 'Query'
          : never}`]?: QueryImperativeEffect<{
          query: {
            state: 'state' extends keyof Queries[key]
              ? Queries[key]['state']
              : never;
            params: 'params' extends keyof Queries[key]
              ? Queries[key]['params']
              : never;
            args: 'args' extends keyof Queries[key]
              ? Queries[key]['args']
              : never;
            isGroupedResource: 'isGroupedResource' extends keyof Queries[key]
              ? Queries[key]['isGroupedResource']
              : never;
            groupIdentifier: 'groupIdentifier' extends keyof Queries[key]
              ? Queries[key]['groupIdentifier']
              : never;
          };
          mutation: {
            state: MutationState;
            params: MutationParams;
            args: MutationArgsParams;
            isGroupedResource: MutationIsGroupedResource;
            groupIdentifier: MutationGroupIdentifier;
          };
        }>;
      }
    : never;
};

export type __InternalSharedMutationConfig<MutationName, State, Params, Args> =
  {
    [key in `${MutationName & string}Mutation`]: InternalType<
      State,
      Params,
      Args,
      false
    > & {
      paramsSource: Signal<Params>;
    };
  };

type MutationStoreOutput<
  MutationName extends string,
  MutationState,
  MutationParams,
  MutationArgsParams,
  InsertionsOutputs
> = {
  state: {};
  props: MergeObject<
    {
      [key in `${MutationName}Mutation`]: MergeObject<
        ResourceRef<MutationState>,
        InsertionsOutputs
      >;
    },
    {
      /**
       * Used to help for type inference, and access to the mutation resource params source
       */
      __mutation: __InternalSharedMutationConfig<
        MutationName,
        MutationState,
        MutationParams,
        MutationArgsParams
      >;
    }
  >;
  // todo add only if there is a mutation  fn and MutationArgsParams
  methods: {
    [key in MutationName as `mutate${Capitalize<key>}`]: (
      mutationParams: MutationArgsParams
    ) => MutationParams;
  };
};
export function withMutation<
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  const MutationName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs
>(
  mutationName: MutationName,
  mutationFactory: (store: StoreInput) => (
    store: StoreInput,
    context: Input
  ) => {
    mutationRef: MutationRef<
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      NoInfer<ResourceArgsParams>,
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
  queriesEffectsFn?: (
    store: StoreInput
  ) => QueriesMutation<
    Input,
    StoreInput,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    false,
    unknown
  >
): SignalStoreFeature<
  Input,
  MutationStoreOutput<
    MutationName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    InsertionsOutputs
  >
> {
  return ((context: SignalStoreFeatureResult) => {
    const capitalizedMutationName =
      mutationName.charAt(0).toUpperCase() + mutationName.slice(1);

    return signalStoreFeature(
      withProps((store) => {
        const mutationConfigData = mutationFactory(
          store as unknown as StoreInput
        )(store as unknown as StoreInput, context as unknown as Input);

        const mutationResourceParamsSrc =
          mutationConfigData.mutationRef.resourceParamsSrc;

        const mutationResource = mutationConfigData.mutationRef.resource;

        const queriesMutation = (queriesEffectsFn?.(
          store as unknown as StoreInput
        )?.queriesEffects ?? {}) as Record<string, QueryImperativeEffect<any>>;

        const queriesWithOptimisticMutation = Object.entries(
          queriesMutation
        ).filter(
          ([, queryMutationConfig]) => queryMutationConfig.optimisticUpdate
        );
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

        return {
          [`${mutationName}Mutation`]: Object.assign(
            mutationResource,
            mutationConfigData.mutationRef.insertionsOutputs ?? {}
          ),
          ...(hasQueriesEffects && {
            [`_${mutationName}Effect`]: effect(() => {
              const mutationStatus = mutationResource.status();
              const _mutationValueChange = mutationResource.hasValue()
                ? mutationResource.value()
                : undefined;

              const _mutationParamsChange = mutationResourceParamsSrc();

              untracked(() => {
                // Handle optimistic updates on loading
                setOptimisticQueryValues({
                  mutationStatus,
                  queriesWithOptimisticMutation,
                  store: store as any,
                  mutationResource:
                    mutationResource as ResourceRef<ResourceState>,
                  mutationParamsSrc: mutationResourceParamsSrc,
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
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
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
                });
              });
              // Handle reload queries
              untracked(() => {
                reloadQueriesOnMutationChange({
                  queriesWithReload,
                  store: store as any,
                  mutationStatus,
                  resourceParamsSrc: mutationResourceParamsSrc,
                  mutationResource:
                    mutationResource as ResourceRef<ResourceState>,
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
                });
              });
            }),
          }),
          __mutation: {
            [`${mutationName}Mutation`]: {
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
        const mutationConfig = mutationResourceOption.mutationRef;
        return {
          [`mutate${capitalizedMutationName}`]: (
            mutationParams: ResourceArgsParams
          ) => {
            const mutationMethod = mutationConfig.method;
            if (mutationMethod) {
              const mutationParamsResult = mutationMethod(mutationParams);
              store.__mutation[`${mutationName}Mutation`].paramsSource.set(
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
    MutationStoreOutput<
      MutationName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      InsertionsOutputs
    >
  >;
}
export function reloadQueriesOnMutationChange<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  queriesWithReload,
  store,
  mutationStatus,
  mutationResource,
  resourceParamsSrc,
  mutationIdentifier,
  mutationResources,
}: {
  queriesWithReload: [string, QueryImperativeEffect<QueryAndMutationRecord>][];
  store: WritableSignal<any>;
  mutationStatus: string;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  resourceParamsSrc: () => any;
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string,
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  queriesWithReload.forEach(([queryName, queryMutationConfig]) => {
    const queryTargeted = (store as any)[queryName] as
      | ResourceRef<QueryAndMutationRecord['query']['state']>
      | ResourceByIdRef<
          string | number,
          QueryAndMutationRecord['query']['state'],
          QueryAndMutationRecord['query']['params']
        >;
    if ('hasValue' in queryTargeted) {
      const queryResource = queryTargeted;
      if (queryMutationConfig.reload) {
        const statusMappings = {
          onMutationError: 'error',
          onMutationResolved: 'resolved',
          onMutationLoading: 'loading',
        };

        Object.entries(queryMutationConfig.reload).forEach(
          ([reloadType, reloadConfig]) => {
            const expectedStatus =
              statusMappings[reloadType as keyof typeof statusMappings];

            if (expectedStatus && mutationStatus === expectedStatus) {
              if (typeof reloadConfig === 'function') {
                if (
                  reloadConfig({
                    queryResource,
                    mutationResource,
                    mutationParams: untracked(() =>
                      resourceParamsSrc()
                    ) as NonNullable<
                      QueryAndMutationRecord['mutation']['params']
                    >,
                    queryIdentifier: undefined,
                    queryResources: undefined,
                    mutationIdentifier: undefined,
                    mutationResources: undefined,
                  } as any)
                ) {
                  queryResource.reload();
                }
              } else if (reloadConfig) {
                queryResource.reload();
              }
            }
          }
        );
      }
    } else {
      Object.entries(
        (queryTargeted as ResourceByIdRef<string | number, any, any>)()
      )
        .filter(([queryIdentifier, queryResource]) => {
          if (!('filter' in queryMutationConfig)) {
            return true;
          }
          return queryMutationConfig.filter({
            queryResource,
            mutationResource,
            mutationParams: resourceParamsSrc(),
            queryIdentifier: queryIdentifier,
            queryResources: queryTargeted,
            mutationIdentifier: mutationIdentifier,
            mutationResources: mutationResources,
          } as any);
        })
        .forEach(([queryIdentifier, queryResource]) => {
          if (queryMutationConfig.reload) {
            const statusMappings = {
              onMutationError: 'error',
              onMutationResolved: 'resolved',
              onMutationLoading: 'loading',
            };

            Object.entries(queryMutationConfig.reload).forEach(
              ([reloadType, reloadConfig]) => {
                const expectedStatus =
                  statusMappings[reloadType as keyof typeof statusMappings];
                if (expectedStatus && mutationStatus === expectedStatus) {
                  if (typeof reloadConfig === 'function') {
                    if (
                      reloadConfig({
                        queryResource,
                        mutationResource,
                        mutationParams: resourceParamsSrc(),
                        queryIdentifier: queryIdentifier,
                        queryResources: queryTargeted,
                        mutationIdentifier: mutationIdentifier,
                        mutationResources: mutationResources,
                      } as any)
                    ) {
                      queryResource?.reload();
                    }
                  } else if (reloadConfig) {
                    queryResource?.reload();
                  }
                }
              }
            );
          }
        });
    }
  });
}

export function setOptimisticPatchQueriesValue<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  queriesWithOptimisticPatch,
  store,
  mutationStatus,
  mutationResource,
  mutationParamsSrc,
  mutationIdentifier,
  mutationResources,
}: {
  mutationStatus: ResourceStatus;
  queriesWithOptimisticPatch: [
    string,
    QueryImperativeEffect<QueryAndMutationRecord>
  ][];
  store: WritableSignal<any>;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: () => QueryAndMutationRecord['mutation']['params'];
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  if (mutationStatus === 'loading') {
    queriesWithOptimisticPatch.forEach(([queryName, queryMutationConfig]) => {
      const queryTargeted = (store as any)[queryName] as
        | ResourceRef<QueryAndMutationRecord['query']['state']>
        | ResourceByIdRef<
            string | number,
            QueryAndMutationRecord['query']['state'],
            QueryAndMutationRecord['query']['params']
          >;
      if ('hasValue' in queryTargeted) {
        const queryResource = queryTargeted;
        optimisticPatchQueryResource<QueryAndMutationRecord>({
          queryResource,
          queryMutationConfig,
          mutationResource,
          mutationParamsSrc,
          mutationResources,
          mutationIdentifier,
          queryIdentifier: undefined,
          queryResources: undefined,
        });
      } else {
        const queryResources = queryTargeted;
        // use the filter to get the queries to update
        Object.entries(
          (
            queryTargeted as ResourceByIdRef<
              string | number,
              QueryAndMutationRecord['query']['state'],
              QueryAndMutationRecord['query']['params']
            >
          )()
        )
          .filter(([queryIdentifier, queryResource]) => {
            if (!('filter' in queryMutationConfig)) {
              return true;
            }
            return queryMutationConfig.filter({
              queryResource,
              mutationResource,
              mutationParams: mutationParamsSrc() as NonNullable<
                QueryAndMutationRecord['mutation']['params']
              >,
              queryIdentifier,
              queryResources,
              mutationIdentifier,
              mutationResources,
            } as Parameters<FilterQueryById<QueryAndMutationRecord>>[0]);
          })
          .forEach(([queryIdentifier, queryResource]) => {
            optimisticPatchQueryResource<QueryAndMutationRecord>({
              queryResource: queryResource as NonNullable<typeof queryResource>,
              queryMutationConfig,
              mutationResource,
              mutationParamsSrc,
              queryIdentifier,
              queryResources,
              mutationIdentifier,
              mutationResources,
            });
          });
      }
    });
  }
}

export function setOptimisticQueryValues<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  store,
  queriesWithOptimisticMutation,
  mutationStatus,
  mutationResource,
  mutationParamsSrc,
  mutationIdentifier,
  mutationResources,
}: {
  store: WritableSignal<any>;
  queriesWithOptimisticMutation: [string, QueryImperativeEffect<any>][];
  mutationStatus: ResourceStatus;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: () => QueryAndMutationRecord['mutation']['params'];
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  if (mutationStatus === 'loading') {
    queriesWithOptimisticMutation.forEach(
      ([queryName, queryMutationConfig]) => {
        const queryTargeted = (store as any)[queryName] as
          | ResourceRef<QueryAndMutationRecord['query']['state']>
          | ResourceByIdRef<string | number, any, any>;
        if ('hasValue' in queryTargeted) {
          const queryResource = queryTargeted;
          const optimisticValue = queryMutationConfig?.optimisticUpdate?.({
            mutationResource,
            queryResource,
            mutationParams: mutationParamsSrc() as NonNullable<
              QueryAndMutationRecord['mutation']['params']
            >,
          });
          queryResource.set(optimisticValue);
        } else {
          // use the filter to get the queries to update
          Object.entries(
            (
              queryTargeted as ResourceByIdRef<
                string | number,
                QueryAndMutationRecord['query']['state'],
                QueryAndMutationRecord['query']['params']
              >
            )()
          )
            .filter(([queryIdentifier, queryResource]) => {
              if (!('filter' in queryMutationConfig)) {
                return true;
              }
              return queryMutationConfig.filter({
                queryResource: queryResource as NonNullable<
                  typeof queryResource
                >,
                mutationResource,
                mutationParams: mutationParamsSrc() as NonNullable<
                  QueryAndMutationRecord['mutation']['params']
                >,
                queryIdentifier: queryIdentifier as string | number,
                queryResources: queryTargeted,
                mutationIdentifier,
                mutationResources,
              });
            })
            .forEach(([queryIdentifier, queryResource]) => {
              const optimisticValue = queryMutationConfig.optimisticUpdate?.({
                queryResource: queryResource as NonNullable<
                  typeof queryResource
                >,
                mutationResource,
                mutationParams: mutationParamsSrc() as NonNullable<
                  QueryAndMutationRecord['mutation']['params']
                >,
                queryIdentifier,
                queryResources: queryTargeted,
                mutationIdentifier,
                mutationResources,
              });
              queryResource?.set(optimisticValue);
            });
        }
      }
    );
  }
}

function optimisticPatchQueryResource<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  queryResource,
  queryMutationConfig,
  mutationResource,
  mutationParamsSrc,
  queryIdentifier,
  mutationResources,
  queryResources,
  mutationIdentifier,
}: {
  queryResource: ResourceRef<QueryAndMutationRecord['query']['state']>;
  queryMutationConfig: QueryImperativeEffect<QueryAndMutationRecord>;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: () => any;
  queryIdentifier:
    | QueryAndMutationRecord['query']['groupIdentifier']
    | undefined;
  queryResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['query']['state'],
        QueryAndMutationRecord['query']['params']
      >
    | undefined;
  mutationIdentifier?: QueryAndMutationRecord['mutation']['groupIdentifier'];
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  Object.entries(
    queryMutationConfig.optimisticPatch as Record<
      string,
      PatchQueryFn<QueryAndMutationRecord, any>
    >
  ).forEach(([path, optimisticPatch]) => {
    const queryValue = queryResource.hasValue()
      ? queryResource.value()
      : undefined;
    const optimisticValue = optimisticPatch({
      mutationResource,
      queryResource,
      mutationParams: mutationParamsSrc() as NonNullable<
        NoInfer<QueryAndMutationRecord['mutation']['params']>
      >,
      targetedState: getNestedStateValue({
        state: queryValue,
        keysPath: path.split('.'),
      }),
      queryIdentifier,
      queryResources,
      mutationIdentifier,
      mutationResources,
    } as Parameters<PatchQueryFn<QueryAndMutationRecord, any>>[0]);

    const updatedValue = createNestedStateUpdate({
      state: queryValue,
      keysPath: path.split('.'),
      value: optimisticValue,
    });
    queryResource.set(updatedValue);
  });
}
