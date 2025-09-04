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
import { ExtensionsByIdFactory } from './core/query.core';

type PublicSignalStore<Input extends SignalStoreFeatureResult> = Prettify<
  StateSignals<Input['state']> & Input['props'] & Input['methods']
>;

type QueryByIdOutput<
  StoreInput extends PublicSignalStore<Input>,
  Input extends SignalStoreFeatureResult,
  QueryGroupIdentifier extends string | number,
  QueryState extends object | undefined,
  QueryParams,
  ExtensionsOutput,
  QueryArgsParams
> = (
  store: StoreInput,
  context: Input
) => {
  queryByIdRef: QueryByIdRef<
    NoInfer<QueryGroupIdentifier>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    ExtensionsOutput
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
  ExtensionsOutput
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
  extensions?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 & ExtensionsOutput2,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2,
  ExtensionsOutput3
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >,
  extension3?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput3,
    ExtensionsOutput1 & ExtensionsOutput2
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2,
  ExtensionsOutput3,
  ExtensionsOutput4
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >,
  extension3?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput3,
    ExtensionsOutput1 & ExtensionsOutput2
  >,
  extension4?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput4,
    ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3 & ExtensionsOutput4,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2,
  ExtensionsOutput3,
  ExtensionsOutput4,
  ExtensionsOutput5
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >,
  extension3?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput3,
    ExtensionsOutput1 & ExtensionsOutput2
  >,
  extension4?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput4,
    ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3
  >,
  extension5?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput5,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 &
    ExtensionsOutput2 &
    ExtensionsOutput3 &
    ExtensionsOutput4 &
    ExtensionsOutput5,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2,
  ExtensionsOutput3,
  ExtensionsOutput4,
  ExtensionsOutput5,
  ExtensionsOutput6
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >,
  extension3?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput3,
    ExtensionsOutput1 & ExtensionsOutput2
  >,
  extension4?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput4,
    ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3
  >,
  extension5?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput5,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4
  >,
  extension6?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput6,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4 &
      ExtensionsOutput5
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 &
    ExtensionsOutput2 &
    ExtensionsOutput3 &
    ExtensionsOutput4 &
    ExtensionsOutput5 &
    ExtensionsOutput6,
  QueryArgsParams
>;
export function queryById<
  QueryState extends object | undefined,
  QueryParams,
  QueryArgsParams,
  QueryGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  ExtensionsOutput1,
  ExtensionsOutput2,
  ExtensionsOutput3,
  ExtensionsOutput4,
  ExtensionsOutput5,
  ExtensionsOutput6,
  ExtensionsOutput7
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
  extension1?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput1
  >,
  extension2?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput2,
    ExtensionsOutput1
  >,
  extension3?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput3,
    ExtensionsOutput1 & ExtensionsOutput2
  >,
  extension4?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput4,
    ExtensionsOutput1 & ExtensionsOutput2 & ExtensionsOutput3
  >,
  extension5?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput5,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4
  >,
  extension6?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput6,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4 &
      ExtensionsOutput5
  >,
  extension7?: ExtensionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<QueryState>,
    NoInfer<QueryParams>,
    NoInfer<QueryGroupIdentifier>,
    ExtensionsOutput7,
    ExtensionsOutput1 &
      ExtensionsOutput2 &
      ExtensionsOutput3 &
      ExtensionsOutput4 &
      ExtensionsOutput5 &
      ExtensionsOutput6
  >
): QueryByIdOutput<
  StoreInput,
  Input,
  QueryGroupIdentifier,
  QueryState,
  QueryParams,
  ExtensionsOutput1 &
    ExtensionsOutput2 &
    ExtensionsOutput3 &
    ExtensionsOutput4 &
    ExtensionsOutput5 &
    ExtensionsOutput6 &
    ExtensionsOutput7,
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
  ...extensions: any[]
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
        extensions as ExtensionsByIdFactory<
          NoInfer<Input>,
          NoInfer<StoreInput>,
          NoInfer<QueryState>,
          NoInfer<QueryParams>,
          NoInfer<QueryGroupIdentifier>,
          {}
        >[]
      )?.reduce((acc, extension) => {
        return {
          ...acc,
          ...extension({
            input: context,
            store,
            resourceById: queryResourcesById,
            resourceParamsSrc: resourceParamsSrc as WritableSignal<
              NoInfer<QueryParams> | undefined
            >,
            extensions: acc as {},
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
