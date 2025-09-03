import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
} from '@ngrx/signals';
import { RxResourceWithParamsOrParamsFn } from './types/rx-resource-with-params-or-params-fn.type';
import { InternalType } from '@ng-query/ngrx-signals';
import { QueryRef } from '@ng-query/ngrx-signals';
import { Signal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  __INTERNAL_QueryBrand,
  brandQueryFunction,
} from '@ng-query/ngrx-signals';

export function rxQuery<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> & Input['props'] & Input['methods']
  >,
  ExtendedOutput
>(
  queryConfig: Omit<
    RxResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  extended?: (args: {
    input: Input;
    store: StoreInput;
    resource: any;
    resourceParams: any;
  }) => ExtendedOutput
): ((
  store: StoreInput,
  context: Input
) => {
  queryRef: QueryRef<NoInfer<QueryState>, NoInfer<QueryParams>, ExtendedOutput>;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryArgsParams>,
    false
  >;
}) & { [__INTERNAL_QueryBrand]: true } {
  const src$ = queryConfig.params$;
  const src$ToSignal = src$ ? toSignal(src$) : undefined;
  const queryResourceParamsFnSignal = signal<QueryParams | undefined>(
    undefined
  );

  const resourceParamsSrc =
    src$ToSignal ?? queryConfig.params ?? queryResourceParamsFnSignal;

  const queryResource = rxResource<QueryState, QueryParams>({
    ...queryConfig,
    params: resourceParamsSrc,
  } as any);

  return brandQueryFunction((store, context) => ({
    queryRef: {
      resource: queryResource,
      resourceParamsSrc: resourceParamsSrc as Signal<QueryParams | undefined>,
      extendedOutputs:
        extended?.({
          input: context,
          store: store,
          resource: queryResource,
          resourceParams: resourceParamsSrc,
        }) ?? ({} as ExtendedOutput),
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      false
    >,
  }));
}
