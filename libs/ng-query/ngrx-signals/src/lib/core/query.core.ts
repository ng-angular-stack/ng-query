import {
  ResourceRef,
  ResourceStatus,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  CustomReloadOnSpecificMutationStatus,
  FilterQueryById,
  OptimisticPatchQueryFn,
  OptimisticPathMutationQuery,
  QueryAndMutationRecordConstraints,
  ReloadQueriesConfig,
} from '../types/shared.type';
import { ResourceByIdRef } from '../resource-by-id';
import {
  getNestedStateValue,
  createNestedStateUpdate,
} from './update-state.util';
import { MergeObjects } from '../types/util.type';
import { SignalStoreFeatureResult } from '@ngrx/signals';

export type QueryDeclarativeEffect<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = MergeObjects<
  [
    {
      optimisticUpdate?: (
        data: MergeObjects<
          [
            {
              queryResource: ResourceRef<
                QueryAndMutationRecord['query']['state']
              >;
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
                    string,
                    QueryAndMutationRecord['query']['state']
                  >;
                }
              : {},
            QueryAndMutationRecord['mutation']['groupIdentifier'] extends
              | string
              | number
              ? {
                  mutationIdentifier: QueryAndMutationRecord['mutation']['groupIdentifier'];
                  mutationResources: ResourceByIdRef<
                    string,
                    QueryAndMutationRecord['mutation']['state']
                  >;
                }
              : {}
          ]
        >
      ) => QueryAndMutationRecord['query']['state'];
      reload?: ReloadQueriesConfig<QueryAndMutationRecord>;
      /**
       * Will patch the query specific state with the mutation data.
       * If the query is loading, it will not patch.
       * If the mutation data is not compatible with the query state, it will not patch.
       * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
       */
      optimisticPatch?: OptimisticPathMutationQuery<QueryAndMutationRecord>;
    },
    QueryAndMutationRecord['mutation']['isGroupedResource'] extends true
      ? {
          filter: FilterQueryById<QueryAndMutationRecord>;
        }
      : QueryAndMutationRecord['query']['isGroupedResource'] extends true
      ? {
          filter: FilterQueryById<QueryAndMutationRecord>;
        }
      : {}
  ]
>;

export function triggerQueryReloadFromMutationChange<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  reload,
  mutationStatus,
  queryResource,
  mutationResource,
  mutationParamsSrc,
  queryIdentifier,
  queryResources,
  mutationIdentifier,
  mutationResources,
}: {
  reload: ReloadQueriesConfig<QueryAndMutationRecord>;
  mutationStatus: string;
  queryResource: ResourceRef<QueryAndMutationRecord['query']['state']>;
  queryResources:
    | ResourceByIdRef<string | number, QueryAndMutationRecord['query']['state']>
    | undefined;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: Signal<
    QueryAndMutationRecord['mutation']['params'] | undefined
  >;
  queryIdentifier: QueryAndMutationRecord['query']['groupIdentifier'];
  mutationIdentifier: QueryAndMutationRecord['mutation']['groupIdentifier'];
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state']
      >
    | undefined;
}) {
  const statusMappings = {
    onMutationError: 'error',
    onMutationResolved: 'resolved',
    onMutationLoading: 'loading',
  };

  Object.entries(reload).forEach(([reloadType, reloadConfig]) => {
    const expectedStatus =
      statusMappings[reloadType as keyof typeof statusMappings];

    if (expectedStatus && mutationStatus === expectedStatus) {
      if (typeof reloadConfig === 'function') {
        if (
          reloadConfig({
            queryResource,
            mutationResource,
            mutationParams: mutationParamsSrc() as any,
            queryIdentifier,
            mutationIdentifier,
            mutationResources,
            queryResources,
          })
        ) {
          queryResource.reload();
        }
      } else if (reloadConfig) {
        queryResource.reload();
      }
    }
  });
}

export function triggerQueryReloadOnMutationStatusChange<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  mutationStatus,
  queryResourceTarget,
  mutationEffectOptions,
  mutationResource,
  mutationParamsSrc,
  reloadCConfig,
  mutationIdentifier,
  mutationResources,
}: {
  mutationStatus: string;
  queryResourceTarget:
    | ResourceByIdRef<string | number, QueryAndMutationRecord['query']['state']>
    | ResourceRef<QueryAndMutationRecord['query']['state']>;
  mutationEffectOptions: QueryDeclarativeEffect<QueryAndMutationRecord>;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: Signal<QueryAndMutationRecord['mutation']['params']>;
  reloadCConfig: {
    onMutationError?:
      | boolean
      | CustomReloadOnSpecificMutationStatus<QueryAndMutationRecord>;
    onMutationResolved?:
      | boolean
      | CustomReloadOnSpecificMutationStatus<QueryAndMutationRecord>;
    onMutationLoading?:
      | boolean
      | CustomReloadOnSpecificMutationStatus<QueryAndMutationRecord>;
  };
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state']
      >
    | undefined;
}) {
  if (
    (['error', 'loading', 'resolved'] satisfies ResourceStatus[]).includes(
      mutationStatus as any
    )
  ) {
    if ('hasValue' in queryResourceTarget) {
      const queryResource = queryResourceTarget;
      triggerQueryReloadFromMutationChange({
        reload: reloadCConfig,
        mutationStatus,
        queryResource,
        mutationResource,
        mutationParamsSrc,
        queryIdentifier: undefined,
        mutationIdentifier,
        mutationResources,
        queryResources: undefined,
      });
      return;
    }
    const queryResourcesById = queryResourceTarget as ResourceByIdRef<
      string | number,
      QueryAndMutationRecord['query']['state']
    >;
    Object.entries(
      queryResourcesById() as Record<string | number, ResourceRef<any>>
    )
      .filter(([queryIdentifier, queryResource]) => {
        return (
          mutationEffectOptions as {
            filter: FilterQueryById<QueryAndMutationRecord>;
          }
        ).filter({
          queryResource,
          mutationResource,
          mutationParams: mutationParamsSrc(),
          queryIdentifier,
          queryResources: queryResourceTarget,
          mutationIdentifier,
          mutationResources,
        } as any);
      })
      .forEach(([queryIdentifier, queryResource]) => {
        triggerQueryReloadFromMutationChange({
          reload: reloadCConfig,
          mutationStatus,
          queryResource,
          mutationResource,
          mutationParamsSrc,
          queryIdentifier,
          mutationIdentifier,
          mutationResources,
          queryResources: queryResourceTarget,
        });
      });
  }
}

export function setOptimisticPatchFromMutationOnQueryValue<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  mutationStatus,
  queryResourceTarget,
  mutationEffectOptions,
  mutationResource,
  mutationParamsSrc,
  mutationIdentifier,
  mutationResources,
}: {
  mutationStatus: string;
  queryResourceTarget:
    | ResourceByIdRef<string | number, QueryAndMutationRecord['query']['state']>
    | ResourceRef<QueryAndMutationRecord['query']['state']>;
  mutationEffectOptions: QueryDeclarativeEffect<QueryAndMutationRecord>;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: Signal<QueryAndMutationRecord['mutation']['params']>;
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state']
      >
    | undefined;
}) {
  if (mutationStatus === 'loading') {
    if ('hasValue' in queryResourceTarget) {
      const queryResource = queryResourceTarget;
      Object.entries(
        mutationEffectOptions.optimisticPatch as Record<
          string,
          OptimisticPatchQueryFn<any, any>
        >
      ).forEach(([path, optimisticPatch]) => {
        const queryValue = queryResource.hasValue()
          ? queryResource.value()
          : undefined;
        const optimisticValue = optimisticPatch({
          mutationResource,
          queryResource,
          queryResources: undefined,
          queryIdentifier: undefined,
          mutationParams: mutationParamsSrc(),
          targetedState: getNestedStateValue({
            state: queryValue,
            keysPath: path.split('.'),
          }),
          mutationIdentifier,
          mutationResources,
        });
        const updatedValue = createNestedStateUpdate({
          state: queryValue,
          keysPath: path.split('.'),
          value: optimisticValue,
        });
        queryResource.set(updatedValue);
      });
      return;
    }
    const queryResourcesById = queryResourceTarget as ResourceByIdRef<
      string | number,
      QueryAndMutationRecord['query']['state']
    >;
    Object.entries(
      queryResourcesById() as Record<string | number, ResourceRef<any>>
    )
      .filter(([queryIdentifier, queryResource]) =>
        (
          mutationEffectOptions as {
            filter: FilterQueryById<QueryAndMutationRecord>;
          }
        ).filter({
          queryResource,
          mutationResource,
          mutationParams: mutationParamsSrc(),
          queryIdentifier,
          queryResources: queryResourcesById,
          mutationIdentifier,
          mutationResources,
        } as any)
      )
      .forEach(([queryIdentifier, queryResource]) => {
        Object.entries(
          mutationEffectOptions.optimisticPatch as Record<
            string,
            OptimisticPatchQueryFn<any, any>
          >
        ).forEach(([path, optimisticPatch]) => {
          const queryValue = queryResource.hasValue()
            ? queryResource.value()
            : undefined;
          const optimisticValue = optimisticPatch({
            mutationResource,
            queryResource,
            queryResources: queryResourcesById,
            queryIdentifier,
            mutationParams: mutationParamsSrc(),
            targetedState: getNestedStateValue({
              state: queryValue,
              keysPath: path.split('.'),
            }),
            mutationIdentifier,
            mutationResources,
          });
          const updatedValue = createNestedStateUpdate({
            state: queryValue,
            keysPath: path.split('.'),
            value: optimisticValue,
          });
          queryResource.set(updatedValue);
        });
      });
  }
}

export function setOptimisticUpdateFromMutationOnQueryValue<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
>({
  mutationStatus,
  queryResourceTarget,
  mutationEffectOptions,
  mutationResource,
  mutationParamsSrc,
  mutationIdentifier,
  mutationResources,
}: {
  mutationStatus: string;
  queryResourceTarget:
    | ResourceByIdRef<string | number, QueryAndMutationRecord['query']['state']>
    | ResourceRef<QueryAndMutationRecord['query']['state']>;
  mutationEffectOptions: QueryDeclarativeEffect<QueryAndMutationRecord>;
  mutationResource: ResourceRef<QueryAndMutationRecord['mutation']['state']>;
  mutationParamsSrc: Signal<QueryAndMutationRecord['mutation']['params']>;
  mutationIdentifier:
    | QueryAndMutationRecord['mutation']['groupIdentifier']
    | undefined;
  mutationResources:
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['mutation']['state']
      >
    | undefined;
}) {
  if (mutationStatus !== 'loading') {
    return;
  }

  if ('hasValue' in queryResourceTarget) {
    const queryResource = queryResourceTarget;
    const updatedValue = mutationEffectOptions.optimisticUpdate!({
      queryResource,
      mutationResource,
      mutationParams: mutationParamsSrc(),
      queryIdentifier: undefined,
      queryResources: undefined,
      mutationIdentifier,
      mutationResources,
    } as any);
    queryResource.set(updatedValue);
    return;
  }
  const queryResourceById = queryResourceTarget as ResourceByIdRef<
    string | number,
    QueryAndMutationRecord['query']['state']
  >;
  Object.entries(
    queryResourceById() as Record<string | number, ResourceRef<any>>
  )
    .filter(([queryIdentifier, queryResource]) =>
      (
        mutationEffectOptions as {
          filter: FilterQueryById<QueryAndMutationRecord>;
        }
      ).filter({
        queryResource,
        mutationResource,
        mutationParams: mutationParamsSrc(),
        queryIdentifier,
        queryResources: queryResourceTarget,
        mutationIdentifier,
        mutationResources,
      } as any)
    )
    .forEach(([queryIdentifier, queryResource]) => {
      const updatedValue = mutationEffectOptions.optimisticUpdate!({
        queryResource,
        mutationResource,
        mutationParams: mutationParamsSrc(),
        queryIdentifier,
        queryResources: queryResourceTarget,
        mutationIdentifier,
        mutationResources,
      } as any);
      queryResource.set(updatedValue);
    });
}

export type InsertionsFactory<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  InsertsOutputs,
  PreviousInsertionsOutputs = {}
> = (context: {
  input: Input;
  store: StoreInput;
  resource: ResourceRef<ResourceState>;
  resourceParams: WritableSignal<ResourceParams>;
  insertions: keyof PreviousInsertionsOutputs extends string
    ? PreviousInsertionsOutputs
    : never;
}) => InsertsOutputs;

export type InsertionsByIdFactory<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string | number,
  InsertionsOutputs,
  PreviousInsertionsOutputs = {}
> = (context: {
  input: Input;
  store: StoreInput;
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
  insertions: keyof PreviousInsertionsOutputs extends string
    ? PreviousInsertionsOutputs
    : never;
}) => InsertionsOutputs;
