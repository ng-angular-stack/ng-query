import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
} from '@ngrx/signals';
import { Signal, signal } from '@angular/core';
import { rxResourceById } from './rx-resource-by-id';
import { RxResourceByIdConfig } from './types/rx-resource-by-id-config.type';
import {
  __INTERNAL_QueryBrand,
  InternalType,
  QueryByIdRef,
} from '@ng-query/ngrx-signals';
import { toSignal } from '@angular/core/rxjs-interop';

export function rxQueryById<
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
    RxResourceByIdConfig<
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
  const src$ = queryConfig.params$;
  const src$ToSignal = src$ ? toSignal(src$) : undefined;

  const queryResourceParamsFnSignal = signal<QueryParams | undefined>(
    undefined
  );

  const resourceParamsSrc =
    src$ToSignal ?? queryConfig.params ?? queryResourceParamsFnSignal;

  const queryResourcesById = rxResourceById<
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
