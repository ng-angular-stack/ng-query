import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
} from '@ngrx/signals';
import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { QueryByIdRef } from './with-query-by-id';
import { signal, WritableSignal } from '@angular/core';
import { resourceById } from './resource-by-id';
import { __INTERNAL_QueryBrand } from './types/brand';
import { InsertionsByIdFactory } from './core/query.core';

type PublicSignalStore<Input extends SignalStoreFeatureResult> = Prettify<
  StateSignals<Input['state']> & Input['props'] & Input['methods']
>;

type QueryByIdOutput<
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
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertionsOutput
  >
): QueryByIdOutput<
  StoreInput,
  Input,
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
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
): QueryByIdOutput<
  StoreInput,
  Input,
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
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
): QueryByIdOutput<
  StoreInput,
  Input,
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
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
): QueryByIdOutput<
  StoreInput,
  Input,
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
    ResourceByIdConfig<
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
): QueryByIdOutput<
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
export function queryById<
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
    ResourceByIdConfig<
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
): QueryByIdOutput<
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
export function queryById<
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
    ResourceByIdConfig<
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
): QueryByIdOutput<
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
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
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
  StoreInput,
  Input,
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
    params: resourceParamsSrc,
  } as any);
  return (store, context) => ({
    queryByIdRef: {
      resourceById: queryResourcesById,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        QueryParams | undefined
      >,
      extensionsOutputs: (
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
