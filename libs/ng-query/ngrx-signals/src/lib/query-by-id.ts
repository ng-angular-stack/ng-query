import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { QueryByIdRef } from './with-query-by-id';
import { signal, WritableSignal } from '@angular/core';
import { resourceById } from './resource-by-id';
import { __INTERNAL_QueryBrand } from './types/brand';
import { InsertionsByIdFactory } from './core/query.core';

type QueryByIdOutput<
  QueryGroupIdentifier extends string,
  QueryState extends object | undefined,
  QueryParams,
  InsertionsOutput,
  QueryArgsParams
> = {
  queryRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
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
    true,
    NoInfer<QueryGroupIdentifier>
  >;
  [__INTERNAL_QueryBrand]: true;
};

export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insertions?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3 & InsertionsOutput4,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput5,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 &
    InsertionsOutput2 &
    InsertionsOutput3 &
    InsertionsOutput4 &
    InsertionsOutput5,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5,
  InsertionsOutput6
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput5,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4
  >,
  insert6?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput6,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4 &
      InsertionsOutput5
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 &
    InsertionsOutput2 &
    InsertionsOutput3 &
    InsertionsOutput4 &
    InsertionsOutput5 &
    InsertionsOutput6,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5,
  InsertionsOutput6,
  InsertionsOutput7
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput5,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4
  >,
  insert6?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput6,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4 &
      InsertionsOutput5
  >,
  insert7?: InsertionsByIdFactory<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput7,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4 &
      InsertionsOutput5 &
      InsertionsOutput6
  >
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 &
    InsertionsOutput2 &
    InsertionsOutput3 &
    InsertionsOutput4 &
    InsertionsOutput5 &
    InsertionsOutput6 &
    InsertionsOutput7,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  ...insertions: any[]
): QueryByIdOutput<
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  {},
  QueryArgsParams
> {
  const queryResourceParamsFnSignal = signal<QueryParams | undefined>(
    undefined
  );

  const resourceParamsSrc = queryConfig.params ?? queryResourceParamsFnSignal;

  const queryResourcesById = resourceById<
    QueryState,
    QueryParams,
    QueryGroupIdentifier
  >({
    ...queryConfig,
    //@ts-expect-error TS type error
    params: resourceParamsSrc,
    equalParams: queryConfig.equalParams ?? 'useIdentifier',
  });
  return {
    queryRef: {
      resourceById: queryResourcesById,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        QueryParams | undefined
      >,
      insertionsOutputs: (
        insertions as InsertionsByIdFactory<
          NoInfer<QueryState>,
          NoInfer<QueryParams>,
          NoInfer<QueryGroupIdentifier>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
            resourceById: queryResourcesById,
            resourceParamsSrc: resourceParamsSrc as WritableSignal<
              NoInfer<QueryParams> | undefined
            >,
            insertions: acc as {},
            identifier: queryConfig.identifier,
          }),
        };
      }, {} as Record<string, unknown>),
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      true,
      NoInfer<QueryGroupIdentifier>
    >,
    [__INTERNAL_QueryBrand]: true,
  };
}
