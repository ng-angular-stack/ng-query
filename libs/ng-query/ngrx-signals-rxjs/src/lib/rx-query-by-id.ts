import { signal, WritableSignal } from '@angular/core';
import { rxResourceById } from './rx-resource-by-id';
import { RxResourceByIdConfig } from './types/rx-resource-by-id-config.type';
import {
  __INTERNAL_QueryBrand,
  InsertionsByIdFactory,
  InternalType,
  QueryByIdRef,
} from '@ng-query/ngrx-signals';
import { toSignal } from '@angular/core/rxjs-interop';

type RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string,
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
): RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string,
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
): RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string,
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
): RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string,
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
): RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string,
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
): RxQueryByIdOutput<
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
    RxResourceByIdConfig<
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
): RxQueryByIdOutput<
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
  QueryGroupIdentifier extends string
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
): {
  queryRef: QueryByIdRef<
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
