import {
  ResourceRef,
  ResourceStatus,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  CustomReloadOnSpecificMutationStatus,
  FilterQueryById,
  PatchQueryFn,
  PatchMutationQuery,
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

type UpdateData<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = MergeObjects<
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
            string,
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
            string,
            QueryAndMutationRecord['mutation']['state'],
            QueryAndMutationRecord['mutation']['params']
          >;
        }
      : {}
  ]
>;

export type QueryDeclarativeEffect<
  QueryAndMutationRecord extends QueryAndMutationRecordConstraints
> = MergeObjects<
  [
    {
      /**
       * Run when the mutation is in loading state.
       */
      optimisticUpdate?: (
        data: UpdateData<QueryAndMutationRecord>
      ) => QueryAndMutationRecord['query']['state'];
      /**
       * Run when the mutation is in loaded state.
       */
      update?: (
        data: UpdateData<QueryAndMutationRecord>
      ) => QueryAndMutationRecord['query']['state'];
      reload?: ReloadQueriesConfig<QueryAndMutationRecord>;
      /**
       * Run when the mutation is in loading state.
       * Will patch the query specific state with the mutation data.
       * If the query is loading, it will not patch.
       * If the mutation data is not compatible with the query state, it will not patch.
       * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
       */
      optimisticPatch?: PatchMutationQuery<QueryAndMutationRecord>;
      /**
       * Run when the mutation is in loaded state.
       * Will patch the query specific state with the mutation data.
       * If the query is loading, it will not patch.
       * If the mutation data is not compatible with the query state, it will not patch.
       * Be careful! If the mutation is already in a loading state, trigger the mutation again will cancelled the previous mutation loader and will patch with the new value.
       */
      patch?: PatchMutationQuery<QueryAndMutationRecord>;
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
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['query']['state'],
        QueryAndMutationRecord['query']['params']
      >
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
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
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
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['query']['state'],
        QueryAndMutationRecord['query']['params']
      >
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
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
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
      QueryAndMutationRecord['query']['state'],
      QueryAndMutationRecord['query']['params']
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

export function setAllPatchFromMutationOnQueryValue<
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
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['query']['state'],
        QueryAndMutationRecord['query']['params']
      >
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
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  if (mutationStatus !== 'loading' && mutationStatus !== 'resolved') {
    return;
  }
  const patchTarget =
    mutationStatus === 'loading'
      ? mutationEffectOptions.optimisticPatch
      : mutationEffectOptions.patch;
  if (!patchTarget) {
    return;
  }
  if ('hasValue' in queryResourceTarget) {
    const queryResource = queryResourceTarget;
    Object.entries(
      patchTarget as Record<string, PatchQueryFn<any, any>>
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
    QueryAndMutationRecord['query']['state'],
    QueryAndMutationRecord['query']['params']
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
        patchTarget as Record<string, PatchQueryFn<any, any>>
      ).forEach(([path, patch]) => {
        const queryValue = queryResource.hasValue()
          ? queryResource.value()
          : undefined;
        const optimisticValue = patch({
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

export function setAllUpdatesFromMutationOnQueryValue<
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
    | ResourceByIdRef<
        string | number,
        QueryAndMutationRecord['query']['state'],
        QueryAndMutationRecord['query']['params']
      >
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
        QueryAndMutationRecord['mutation']['state'],
        QueryAndMutationRecord['mutation']['params']
      >
    | undefined;
}) {
  if (mutationStatus !== 'loading' && mutationStatus !== 'resolved') {
    return;
  }
  const updateTarget =
    mutationStatus === 'loading'
      ? mutationEffectOptions.optimisticUpdate
      : mutationEffectOptions.update;
  if (!updateTarget) {
    return;
  }

  if ('hasValue' in queryResourceTarget) {
    const queryResource = queryResourceTarget;
    const updatedValue = updateTarget({
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
    QueryAndMutationRecord['query']['state'],
    QueryAndMutationRecord['query']['params']
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
      const updatedValue = updateTarget({
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

export type InsertionParams<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  PreviousInsertionsOutputs
> = {
  input: Input;
  store: StoreInput;
  resource: ResourceRef<ResourceState>;
  resourceParams: WritableSignal<ResourceParams>;
  insertions: keyof PreviousInsertionsOutputs extends string
    ? PreviousInsertionsOutputs
    : never;
};

export type InsertionsFactory<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  InsertsOutputs,
  PreviousInsertionsOutputs = {}
> = (
  context: InsertionParams<
    Input,
    StoreInput,
    ResourceState,
    ResourceParams,
    PreviousInsertionsOutputs
  >
) => InsertsOutputs;

export type InsertionByIdParams<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  GroupIdentifier extends string | number,
  ResourceState extends object | undefined,
  ResourceParams,
  PreviousInsertionsOutputs
> = {
  input: Input;
  store: StoreInput;
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
  identifier: (params: NonNullable<ResourceParams>) => GroupIdentifier;
  insertions: keyof PreviousInsertionsOutputs extends string
    ? PreviousInsertionsOutputs
    : never;
};

export type InsertionsByIdFactory<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string | number,
  InsertionsOutputs,
  PreviousInsertionsOutputs = {}
> = (
  context: InsertionByIdParams<
    Input,
    StoreInput,
    GroupIdentifier,
    ResourceState,
    ResourceParams,
    PreviousInsertionsOutputs
  >
) => InsertionsOutputs;

export type DefaultInsertionByIdParams = InsertionByIdParams<
  SignalStoreFeatureResult,
  unknown,
  string,
  {},
  unknown,
  {}
>;

export type DefaultInsertionParams = InsertionParams<
  SignalStoreFeatureResult,
  unknown,
  {},
  unknown,
  unknown
>;
