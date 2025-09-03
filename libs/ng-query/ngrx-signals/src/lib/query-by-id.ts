import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
} from '@ngrx/signals';
import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { QueryByIdRef } from './with-query-by-id';
import { Signal, signal } from '@angular/core';
import { resourceById } from './resource-by-id-signal-store';
import { __INTERNAL_QueryBrand } from './types/brand';

export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> & Input['props'] & Input['methods']
  >
>(
  queryConfig: Omit<
    ResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >
): (
  store: StoreInput,
  context: Input
) => {
  queryByIdRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>
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
} {
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
    params: resourceParamsSrc,
  } as any);
  return (store, context) => ({
    queryByIdRef: {
      resourceById: queryResourcesById,
      resourceParamsSrc: resourceParamsSrc as Signal<QueryParams | undefined>,
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      true,
      NoInfer<QueryGroupIdentifier>
    >,
    [__INTERNAL_QueryBrand]: true,
  });
}
