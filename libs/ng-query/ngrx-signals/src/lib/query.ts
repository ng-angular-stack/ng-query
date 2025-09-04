import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
} from '@ngrx/signals';
import { ResourceWithParamsOrParamsFn } from './types/resource-with-params-or-params-fn.type';
import { InternalType } from './types/util.type';
import { QueryRef } from './with-query';
import {
  resource,
  ResourceOptions,
  ResourceRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { __INTERNAL_QueryBrand } from './types/brand';
import { InsertionsFactory } from './core/query.core';

export function query<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> & Input['props'] & Input['methods']
  >,
  InsertionsOutput
>(
  queryConfig: Omit<
    ResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  Insertions?: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    InsertionsOutput
  >
): (
  store: StoreInput,
  context: Input
) => {
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
} {
  const queryResourceParamsFnSignal = signal<QueryParams | undefined>(
    undefined
  );

  const resourceParamsSrc = queryConfig.params ?? queryResourceParamsFnSignal;

  const queryResource = resource<QueryState, QueryParams>({
    ...queryConfig,
    params: resourceParamsSrc,
  } as ResourceOptions<any, any>);

  return (store, context) => ({
    queryRef: {
      resource: queryResource,
      resourceParamsSrc: resourceParamsSrc as Signal<QueryParams | undefined>,
      insertionsOutputs:
        Insertions?.({
          input: context,
          store: store,
          resource: queryResource as ResourceRef<NoInfer<QueryState>>,
          resourceParams: resourceParamsSrc as WritableSignal<QueryParams>,
        }) ?? ({} as InsertionsOutput),
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      false
    >,
    [__INTERNAL_QueryBrand]: true,
  });
}
