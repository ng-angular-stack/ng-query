import { SignalStoreFeatureResult } from '@ngrx/signals';
import { ResourceWithParamsOrParamsFn } from './types/resource-with-params-or-params-fn.type';
import { InternalType } from './types/util.type';
import { QueryRef } from './with-query';
import {
  resource,
  ResourceOptions,
  ResourceRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { __INTERNAL_QueryBrand } from './types/brand';
import { InsertionsFactory } from './core/query.core';
import { PublicSignalStore } from './types/shared.type';
import { preservedResource } from './preserved-resource';
//todo handle logic of insertion inside with-query and globalqueries
type QueryOutput<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  InsertionsOutput
> = {
  queryRef: QueryRef<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    InsertionsOutput
  >;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryArgsParams>,
    false
  >;
  [__INTERNAL_QueryBrand]: true;
};

export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >
): QueryOutput<QueryState, QueryParams, QueryArgsParams, {}>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >
): QueryOutput<QueryState, QueryParams, QueryArgsParams, Insertion1>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 & Insertion2
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2,
  Insertion3
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion3,
    Insertion1 & Insertion2
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 & Insertion2 & Insertion3
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6,
  Insertion7
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  insertion1: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >,
  insertion7: InsertionsFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    Insertion7,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
  >
): QueryOutput<
  QueryState,
  QueryParams,
  QueryArgsParams,
  Insertion1 &
    Insertion2 &
    Insertion3 &
    Insertion4 &
    Insertion5 &
    Insertion6 &
    Insertion7
>;
export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  ...insertions: any[]
): QueryOutput<QueryState, QueryParams, QueryArgsParams, {}> {
  const queryResourceParamsFnSignal = signal<QueryParams | undefined>(
    undefined
  );

  const resourceParamsSrc = queryConfig.params ?? queryResourceParamsFnSignal;

  const resourceTarget =
    queryConfig.preservePreviousValue?.() ?? false
      ? preservedResource<QueryState, QueryParams>
      : resource<QueryState, QueryParams>;
  const queryResource = resourceTarget({
    ...queryConfig,
    params: resourceParamsSrc,
  } as ResourceOptions<any, any>);

  return {
    queryRef: {
      resource: queryResource,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        QueryParams | undefined
      >,
      insertionsOutputs: (
        insertions as InsertionsFactory<
          NoInfer<QueryState>,
          NoInfer<QueryParams>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
            resource: queryResource as ResourceRef<QueryState>,
            resourceParams: resourceParamsSrc as WritableSignal<
              NoInfer<QueryParams>
            >,
            insertions: acc as {},
          }),
        };
      }, {} as Record<string, unknown>),
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      false
    >,
    [__INTERNAL_QueryBrand]: true,
  };
}
