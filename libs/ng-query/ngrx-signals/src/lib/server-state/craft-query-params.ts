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
import {
  serializeQueryParams,
  SpecificCraftQueryParamOutputs,
} from './craft-query-param';

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
  >}QueryParam`]: QueryParams[K] extends QueryParamOutput<
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
      ) => {
        [StateKey in keyof T]: string;
      }
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
    console.log('contextData', contextData);
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
                `${key}${capitalize(queryParamKey)}`
              ] = queryParamValue;
            } else {
              (acc.methods as Record<string, Function>)[
                `${queryParamKey}${capitalize(key)}`
              ] = queryParamValue as Function;
            }
            return acc;
          },
          { props: {}, methods: {} } as {
            props: Record<string, Signal<any>>;
            methods: Record<string, Function>;
          }
        );

        Object.assign(acc.props, props);
        Object.assign(acc.methods, methods);

        return acc;
      },
      { props: {}, methods: {} } as {
        props: Record<string, Signal<any>>;
        methods: Record<string, Function>;
      }
    );

    return partialContext({
      props: { ...props, ...queryParamStates },
      _queryParams: Object.entries(queryParamStates).reduce(
        (acc, [key, queryParam]) => {
          acc[key] = {
            config: queryParam,
            state: queryParam,
          };
          return acc;
        },
        {} as Record<string, { config: unknown; state: unknown }>
      ),
      methods,
    }) as SpecificCraftQueryParamsOutputs<
      QueryParamKeys,
      QueryParams,
      StoreConfig
    >;
  };

  // when queryParam is called outside the injection context, it will only return the config
  const queryParamsConfigs = queryParamFactory({});

  const setQueryParams = Object.entries(queryParamsConfigs).reduce(
    (acc, [key, queryParam]) => {
      const setCurrentQueryParams = (params: Record<string, unknown>) => {
        return serializeQueryParams(
          params,
          (queryParam as QueryParamOutput<unknown, unknown, unknown>)
            ._config as { state: Record<string, QueryParamConfig<unknown>> }
        );
      };
      const setCurrentQueryParamsKey = `set${capitalize(key)}QueryParam`;
      acc[setCurrentQueryParamsKey] = setCurrentQueryParams;
      return acc;
    },
    {} as Record<string, Function>
  );

  return (() =>
    Object.assign(
      context,
      setQueryParams
    )) as unknown as CraftQueryParamsOutputs<
    Context,
    StoreConfig,
    QueryParamKeys,
    QueryParams
  >;
}
