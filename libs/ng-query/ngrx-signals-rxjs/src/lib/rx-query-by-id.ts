import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
} from '@ngrx/signals';
import { signal, WritableSignal } from '@angular/core';
import { rxResourceById } from './rx-resource-by-id';
import { RxResourceByIdConfig } from './types/rx-resource-by-id-config.type';
import {
  __INTERNAL_QueryBrand,
  InsertionsByIdFactory,
  InternalType,
  PublicSignalStore,
  QueryByIdRef,
} from '@ng-query/ngrx-signals';
import { toSignal } from '@angular/core/rxjs-interop';

type RxQueryByIdOutput<
  StoreInput extends PublicSignalStore<Input>,
  Input extends SignalStoreFeatureResult,
  QueryGroupIdentifier extends string | number,
  QueryState extends object | undefined,
  QueryParams,
  InsertionsOutput,
  QueryArgsParams
> = (
  store: StoreInput,
  context: Input
) => {
  queryByIdRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    InsertionsOutput
  >;
  __types: InternalType<
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryArgsParams>,
    true,
    NoInfer<QueryGroupIdentifier>
  >;
  [__INTERNAL_QueryBrand]: true;
};

export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >
): RxQueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2,
  QueryArgsParams
>;
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >
): RxQueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3,
  QueryArgsParams
>;
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >
): RxQueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3 & InsertionsOutput4,
  QueryArgsParams
>;
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput5,
    InsertionsOutput1 &
      InsertionsOutput2 &
      InsertionsOutput3 &
      InsertionsOutput4
  >
): RxQueryByIdOutput<
  StoreInput,
  Input,
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
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5,
  InsertionsOutput6
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
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
): RxQueryByIdOutput<
  StoreInput,
  Input,
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
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertionsOutput1,
  InsertionsOutput2,
  InsertionsOutput3,
  InsertionsOutput4,
  InsertionsOutput5,
  InsertionsOutput6,
  InsertionsOutput7
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  insert1?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput1
  >,
  insert2?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput2,
    InsertionsOutput1
  >,
  insert3?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput3,
    InsertionsOutput1 & InsertionsOutput2
  >,
  insert4?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput4,
    InsertionsOutput1 & InsertionsOutput2 & InsertionsOutput3
  >,
  insert5?: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
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
): RxQueryByIdOutput<
  StoreInput,
  Input,
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
export function rxQueryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  queryConfig: Omit<
    RxResourceByIdConfig<
      QueryState,
      QueryParams,
      QueryArgsParams,
      QueryGroupIdentifier
    >,
    'method'
  >,
  ...insertions: any[]
): (
  store: StoreInput,
  context: Input
) => {
  queryByIdRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    unknown
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
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        QueryParams | undefined
      >,
      insertionsOutputs: (
        insertions as InsertionsByIdFactory<
          NoInfer<Input>,
          NoInfer<StoreInput>,
          NoInfer<QueryState>,
          NoInfer<QueryParams>,
          NoInfer<QueryGroupIdentifier>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
            input: context,
            store,
            resourceById: queryResourcesById,
            resourceParamsSrc: resourceParamsSrc as WritableSignal<
              NoInfer<QueryParams> | undefined
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
      true,
      NoInfer<QueryGroupIdentifier>
    >,
    [__INTERNAL_QueryBrand]: true,
  });
}
