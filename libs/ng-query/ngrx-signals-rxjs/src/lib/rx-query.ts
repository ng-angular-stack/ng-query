import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
} from '@ngrx/signals';
import { RxResourceWithParamsOrParamsFn } from './types/rx-resource-with-params-or-params-fn.type';
import { InternalType, PublicSignalStore } from '@ng-query/ngrx-signals';
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
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput
>(
  queryConfig: Omit<
    RxResourceWithParamsOrParamsFn<QueryState, QueryParams, QueryArgsParams>,
    'method'
  >,
  Insertions?: (args: {
    input: Input;
    store: StoreInput;
    resource: any;
    resourceParams: any;
  }) => InsertionsOutput
): ((
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
      InsertionsOutputs:
        Insertions?.({
          input: context,
          store: store,
          resource: queryResource,
          resourceParams: resourceParamsSrc,
        }) ?? ({} as InsertionsOutput),
    },
    __types: {} as InternalType<
      NoInfer<QueryState>,
      NoInfer<QueryParams>,
      NoInfer<QueryArgsParams>,
      false
    >,
  }));
}
