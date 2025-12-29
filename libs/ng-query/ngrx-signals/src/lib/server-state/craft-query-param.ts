import { Injector, isSignal, Signal, WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  ContextInput,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  partialContext,
  PartialContext,
  StoreConfigConstraints,
} from './craft';
import { capitalize } from './util/util';
import { QueryParamConfig, QueryParamsOutput } from './query-param';
import { DeferredExtract } from './util/util.type';

export type SpecificCraftQueryParamsOutputs<
  QueryParamsName extends string,
  QueryParamsType,
  Insertions,
  QueryParamsState
> = DeferredExtract<Insertions> extends infer Extracted
  ? Extracted extends { props: unknown; methods: Record<string, Function> }
    ? PartialContext<{
        props: {
          [key in QueryParamsName]: Signal<QueryParamsState>;
        } & {
          [K in keyof QueryParamsState as `${QueryParamsName &
            string}${Capitalize<K & string>}`]: Signal<QueryParamsState[K]>;
        } & {
          [key in keyof Extracted['props'] as `${QueryParamsName &
            string}${Capitalize<key & string>}`]: Extracted['props'][key];
        };
        methods: {
          [key in keyof Extracted['methods'] as `${key & string}${Capitalize<
            QueryParamsName & string
          >}`]: Extracted['methods'][key];
        };
        _queryParams: {
          [K in QueryParamsName]: {
            config: QueryParamsType;
            state: WritableSignal<QueryParamsState>;
          };
        };
      }>
    : never
  : never;

type SpecificCraftQueryStandaloneOutputs<
  QueryParamsName extends string,
  QueryParamsType,
  Insertions,
  QueryParamsState
> = {
  [K in QueryParamsName as `set${Capitalize<K>}QueryParams`]: <
    T extends Partial<{
      [K in keyof QueryParamsState]: QueryParamsState[K];
    }>
  >(
    params: T
  ) => T;
};

type CraftQueryParamsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  QueryParamsName extends string,
  QueryParamsType,
  Insertions,
  QueryParamsState
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftQueryParamsOutputs<
    QueryParamsName,
    QueryParamsType,
    Insertions,
    QueryParamsState
  >,
  SpecificCraftQueryStandaloneOutputs<
    QueryParamsName,
    QueryParamsType,
    Insertions,
    QueryParamsState
  >
>;

/**
 * Used to manage query parameters in the URL as part of the server state.
 * When initialized, it reads the specified query parameters from the URL,
 * applying parsing functions and default values as needed.
 * It provides signals to access the current values of the query parameters
 * and methods to update them, which will also update the URL accordingly.
 *
 * Warning: Please, be careful to avoid query params key collisions. (There is no verification yet)
 *
 * @example
 * ```ts
 * const { injectCraft, setPaginationQueryParams } = craft(
 *   craftQueryParams('pagination', () => ({
 *     page: {
 *       defaultValue: 1,
 *       parse: (value: string) => parseInt(value, 10),
 *       serialize: (value: unknown) => String(value),
 *     },
 *     pageSize: {
 *       defaultValue: 10,
 *       parse: (value: string) => parseInt(value, 10),
 *       serialize: (value: unknown) => String(value),
 *     },
 *   }))
 * );
 * ```
 *
 * Usage in a component:
 * ```ts
 * const store = injectCraft();
 *
 * // Accessing query param values
 * const page = store.page();                 // Signal for 'page' query param
 * const pageSize = store.pageSize();         // Signal for 'pageSize' query param
 * const pagination = store.pagination();     // Signal for combined pagination state
 *
 * // Updating query param values
 * store.setPaginationQueryParams({ page: 2, pageSize: 20 }); // Update query params
 * store.resetPaginationQueryParams();                        // Reset to default values
 *
 * // Outside of injection context:
 * navigateToMyPage() {
 *   await router.navigate(['my-page'], {
 *     queryParams: setPaginationQueryParams({ page: 4, pageSize: 20 }),
 *   });
 * }
 *
 * navigateByUrlToMyPage() {
 *   router.navigateByUrl(
 *     `/my-page?${setPaginationQueryParams({
 *       page: 4,
 *       pageSize: 20,
 *     })}`
 *   );
 * }
 * ```
 */
export function craftQueryParam<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  const QueryParamsName extends string,
  QueryParamsType,
  Insertions,
  QueryParamsState
>(
  queryParamsName: QueryParamsName,
  queryParamFactory: (
    context: CraftFactoryEntries<Context>
  ) => QueryParamsOutput<QueryParamsType, Insertions, QueryParamsState>
): CraftQueryParamsOutputs<
  Context,
  StoreConfig,
  QueryParamsName,
  QueryParamsType,
  Insertions,
  QueryParamsState
> {
  const context = (
    contextData: ContextInput<Context>,
    injector: Injector,
    _storeConfig: StoreConfig,
    _cloudProxy: Context['_cloudProxy']
  ) => {
    const queryParamState = queryParamFactory(craftFactoryEntries(contextData));

    const { props, methods } = Object.entries(queryParamState).reduce(
      (acc, [key, value]) => {
        if (isSignal(value)) {
          (acc.props as Record<string, Signal<any>>)[capitalize(key)] = value;
        } else {
          (acc.methods as Record<string, Function>)[
            `${queryParamsName}${capitalize(key)}`
          ] = value;
        }
        return acc;
      },
      {} as {
        props: Record<string, Signal<any>>;
        methods: Record<string, Function>;
      }
    );

    return partialContext({
      props: {
        ...props,
        [`${queryParamsName}`]: queryParamState,
      },
      _queryParams: {
        [`${queryParamsName}`]: {
          config: queryParamState,
          state: queryParamState,
        },
      },
      methods,
    }) as SpecificCraftQueryParamsOutputs<
      QueryParamsName,
      QueryParamsType,
      Insertions,
      QueryParamsState
    >;
  };

  // when queryParam is called outside the injection context, it will only return the config
  const queryParamsConfig = (
    queryParamFactory({}) as unknown as { _config: QueryParamsType }
  )._config as QueryParamsType;

  return (() => {
    const setCurrentQueryParams = (
      params: Partial<{
        [K in keyof QueryParamsState]: QueryParamsState[K];
      }>
    ) =>
      serializeQueryParams(
        params,
        queryParamsConfig as Record<string, QueryParamConfig<unknown>>
      );
    const setCurrentQueryParamsKey = `set${capitalize(
      queryParamsName
    )}QueryParams`;
    return Object.assign(context, {
      [setCurrentQueryParamsKey]: setCurrentQueryParams,
    });
  }) as unknown as CraftQueryParamsOutputs<
    Context,
    StoreConfig,
    QueryParamsName,
    QueryParamsType,
    Insertions,
    QueryParamsState
  >;
}

function serializeQueryParams<
  QueryParamsState extends Record<string, unknown>,
  QueryParamsConfig extends Record<string, QueryParamConfig<unknown>>
>(params: QueryParamsState, queryParamsConfig: QueryParamsConfig) {
  const queryParamsObject = Object.entries(params).reduce(
    (acc, [key, value]) => {
      const paramConfig = queryParamsConfig[key];
      if (paramConfig && value !== undefined) {
        acc[key] = paramConfig.serialize(value);
      }
      return acc;
    },
    {} as Record<string, string>
  );

  return Object.defineProperty(queryParamsObject, 'toString', {
    value() {
      return serializedQueryParamsObjectToString(this);
    },
    enumerable: false, // 👈 ne s'affichera pas dans les clés
  });
}

function serializedQueryParamsObjectToString(
  queryParamsObject: Record<string, unknown>
) {
  return Object.entries(queryParamsObject)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join('&');
}
