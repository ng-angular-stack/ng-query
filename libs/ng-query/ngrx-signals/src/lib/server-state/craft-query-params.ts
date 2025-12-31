import { Injector, isSignal, Signal, WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  ContextInput,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  MergeTwoContexts,
  PartialContext,
  partialContext,
  StoreConfigConstraints,
} from './craft';
import { capitalize } from './util/util';
import { QueryParamConfig, QueryParamOutput } from './query-param';
import { UnionToTuple } from '../types/util.type';
import { SpecificCraftQueryParamOutputs } from './craft-query-param';

type ToSpecificCraftQueryParamsOutputs<
  QueryParamKeysTuple,
  QueryParams,
  Acc extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
> = QueryParamKeysTuple extends [infer Head, ...infer Tail]
  ? Head extends keyof QueryParams
    ? QueryParams[Head] extends QueryParamOutput<
        infer QueryParamsType,
        infer Insertions,
        infer QueryParamsState
      >
      ? SpecificCraftQueryParamOutputs<
          Head & string,
          QueryParamsType,
          Insertions,
          QueryParamsState
        > extends infer Current
        ? Current extends ContextConstraints
          ? ToSpecificCraftQueryParamsOutputs<
              Tail,
              QueryParams,
              MergeTwoContexts<Acc, Current>,
              StoreConfig
            >
          : never
        : never
      : PartialContext<{
          _error: {
            message: `Typing Error: QueryParams '${Head &
              string}' value is not a QueryParamsOutput - store: [${StoreConfig['name']}]`;
          };
        }>
    : Acc
  : Acc;

export type SpecificCraftQueryParamsOutputs<
  QueryParamKeys extends keyof QueryParams,
  QueryParams extends Record<QueryParamKeys, unknown>,
  StoreConfig extends StoreConfigConstraints
> = ToSpecificCraftQueryParamsOutputs<
  UnionToTuple<QueryParamKeys>,
  QueryParams,
  PartialContext<{}>,
  StoreConfig
>;

type SpecificCraftQueryStandaloneOutputs<
  QueryParamKeys extends keyof QueryParams,
  QueryParams extends Record<QueryParamKeys, unknown>
> = {
  [K in QueryParamKeys as `set${Capitalize<
    K & string
  >}QueryParams`]: QueryParams[K] extends QueryParamOutput<
    unknown,
    unknown,
    infer QueryParamsState
  >
    ? <
        T extends Partial<{
          [StateKey in keyof QueryParamsState]: QueryParamsState[StateKey];
        }>
      >(
        params: T
      ) => T
    : never;
};

type CraftQueryParamsOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  QueryParamKeys extends keyof QueryParams,
  QueryParams extends Record<QueryParamKeys, unknown>
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftQueryParamsOutputs<QueryParamKeys, QueryParams, StoreConfig>,
  SpecificCraftQueryStandaloneOutputs<QueryParamKeys, QueryParams>
>;

export function craftQueryParams<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  QueryParamKeys extends keyof QueryParams,
  QueryParams extends Record<QueryParamKeys, unknown>
>(
  queryParamFactory: (context: CraftFactoryEntries<Context>) => QueryParams
): CraftQueryParamsOutputs<Context, StoreConfig, QueryParamKeys, QueryParams> {
  const context = (
    contextData: ContextInput<Context>,
    injector: Injector,
    _storeConfig: StoreConfig,
    _cloudProxy: Context['_cloudProxy']
  ) => {
    const queryParamStates = queryParamFactory(
      craftFactoryEntries(contextData)
    );

    const { props, methods } = Object.entries(queryParamStates).reduce(
      (acc, [key, queryParam]) => {
        const { props, methods } = Object.entries(
          queryParam as QueryParamOutput<unknown, unknown, unknown>
        ).reduce(
          (acc, [queryParamKey, queryParamValue]) => {
            if (isSignal(queryParamValue)) {
              (acc.props as Record<string, Signal<any>>)[
                capitalize(queryParamKey)
              ] = queryParamValue;
            } else {
              (acc.methods as Record<string, Function>)[
                `${key}${capitalize(queryParamKey)}`
              ] = queryParamValue as Function;
            }
            return acc;
          },
          {} as {
            props: Record<string, Signal<any>>;
            methods: Record<string, Function>;
          }
        );

        Object.assign(acc.props, props);
        Object.assign(acc.methods, methods);

        return acc;
      },
      {} as {
        props: Record<string, Signal<any>>;
        methods: Record<string, Function>;
      }
    );

    return partialContext({
      props: props,
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
