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
import { InsertsByIdFactory } from './core/query.core';

type PublicSignalStore<Input extends SignalStoreFeatureResult> = Prettify<
  StateSignals<Input['state']> & Input['props'] & Input['methods']
>;

type QueryByIdOutput<
  StoreInput extends PublicSignalStore<Input>,
  Input extends SignalStoreFeatureResult,
  QueryGroupIdentifier extends string | number,
  QueryState extends object | undefined,
  QueryParams,
  InsertsOutput,
  QueryArgsParams
> = (
  store: StoreInput,
  context: Input
) => {
  queryByIdRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    InsertsOutput
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
  InsertsOutput
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
  inserts?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 & InsertsOutput2,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2,
  InsertsOutput3
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >,
  insert3?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput3,
    InsertsOutput1 & InsertsOutput2
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 & InsertsOutput2 & InsertsOutput3,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2,
  InsertsOutput3,
  InsertsOutput4
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >,
  insert3?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput3,
    InsertsOutput1 & InsertsOutput2
  >,
  insert4?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput4,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 & InsertsOutput2 & InsertsOutput3 & InsertsOutput4,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2,
  InsertsOutput3,
  InsertsOutput4,
  InsertsOutput5
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >,
  insert3?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput3,
    InsertsOutput1 & InsertsOutput2
  >,
  insert4?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput4,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3
  >,
  insert5?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput5,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3 & InsertsOutput4
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 &
    InsertsOutput2 &
    InsertsOutput3 &
    InsertsOutput4 &
    InsertsOutput5,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2,
  InsertsOutput3,
  InsertsOutput4,
  InsertsOutput5,
  InsertsOutput6
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >,
  insert3?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput3,
    InsertsOutput1 & InsertsOutput2
  >,
  insert4?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput4,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3
  >,
  insert5?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput5,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3 & InsertsOutput4
  >,
  insert6?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput6,
    InsertsOutput1 &
      InsertsOutput2 &
      InsertsOutput3 &
      InsertsOutput4 &
      InsertsOutput5
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 &
    InsertsOutput2 &
    InsertsOutput3 &
    InsertsOutput4 &
    InsertsOutput5 &
    InsertsOutput6,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  InsertsOutput1,
  InsertsOutput2,
  InsertsOutput3,
  InsertsOutput4,
  InsertsOutput5,
  InsertsOutput6,
  InsertsOutput7
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
  insert1?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput1
  >,
  insert2?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput2,
    InsertsOutput1
  >,
  insert3?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput3,
    InsertsOutput1 & InsertsOutput2
  >,
  insert4?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput4,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3
  >,
  insert5?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput5,
    InsertsOutput1 & InsertsOutput2 & InsertsOutput3 & InsertsOutput4
  >,
  insert6?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput6,
    InsertsOutput1 &
      InsertsOutput2 &
      InsertsOutput3 &
      InsertsOutput4 &
      InsertsOutput5
  >,
  insert7?: InsertsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    InsertsOutput7,
    InsertsOutput1 &
      InsertsOutput2 &
      InsertsOutput3 &
      InsertsOutput4 &
      InsertsOutput5 &
      InsertsOutput6
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  InsertsOutput1 &
    InsertsOutput2 &
    InsertsOutput3 &
    InsertsOutput4 &
    InsertsOutput5 &
    InsertsOutput6 &
    InsertsOutput7,
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
  ...inserts: any[]
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
        inserts as InsertsByIdFactory<
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
            inserts: acc as {},
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
