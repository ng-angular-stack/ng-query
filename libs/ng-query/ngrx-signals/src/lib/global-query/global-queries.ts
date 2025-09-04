import {
  inject,
  Injector,
  ResourceRef,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {
  createSignalProxy,
  SignalProxy,
  SignalWrapperParams,
} from '../signal-proxy';
import { InternalType, MergeObjects } from '../types/util.type';
import { QueryRef } from '../with-query';
import {
  withCachedQueryByIdToPlugFactory,
  withCachedQueryToPlugFactory,
} from './with-cached-query-factory';
import { QueriesPersister } from '../persister/persister.type';
import { QueryByIdRef } from '../with-query-by-id';
import { ResourceByIdRef } from '../resource-by-id';

// todo expose enable to cache inmemory by default or use a persister or a persister to a specific query

type QueryRefType = {
  queryRef: QueryRef<unknown, unknown, unknown>;
  __types: InternalType<unknown, unknown, unknown, false>;
};

type QueryByIdRefType = {
  queryByIdRef: QueryByIdRef<string | number, unknown, unknown, unknown>;
  __types: InternalType<unknown, unknown, unknown, true, string | number>;
};

type CachedQuery = {
  config?: QueryCacheCustomConfig;
  query: QueryRefType;
};

type CachedQueryById = {
  config?: QueryCacheCustomConfig;
  query: QueryByIdRefType;
};

type WithQueryOutputMapper<
  QueryRecord extends Record<string, QueryConfiguration<{}>>
> = {
  [k in keyof QueryRecord as `with${Capitalize<string & k>}Query`]: ReturnType<
    typeof withCachedQueryToPlugFactory<
      k & string,
      CachedQuery['query']['queryRef']['resource'],
      string,
      {},
      true,
      CachedQuery['query']['queryRef']['insertionsOutputs']
    >
  >;
} & {
  [k in keyof QueryRecord as `inject${Capitalize<string & k>}Query`]: (
    pluggableData: (
      source: SignalProxy<NoInfer<{}>>
    ) => SignalWrapperParams<NoInfer<{}>>
  ) => ResourceRef<CachedQuery['query']['queryRef']['resource'] | undefined>;
};

type WithQueryByIdOutputMapper<
  QueryRecord extends Record<string, QueryByIdConfiguration<{}>>
> = {
  [k in keyof QueryRecord as `with${Capitalize<
    string & k
  >}QueryById`]: ReturnType<
    typeof withCachedQueryByIdToPlugFactory<
      k & string,
      CachedQueryById['query']['queryByIdRef']['resourceById'],
      string,
      {},
      string | number,
      boolean,
      CachedQueryById['query']['queryByIdRef']['insertionsOutputs']
    >
  >;
} & {
  [k in keyof QueryRecord as `inject${Capitalize<string & k>}QueryById`]: (
    pluggableData: (
      source: SignalProxy<NoInfer<{}>>
    ) => SignalWrapperParams<NoInfer<{}>>
  ) => ResourceRef<
    CachedQueryById['query']['queryByIdRef']['resourceById'] | undefined
  >;
};

type QueryCacheCustomConfig = {
  cacheTime: number;
};

type WithQueryOutputMapperTyped<
  QueryKeys extends keyof QueryRecord,
  QueryRecord extends {
    [key in QueryKeys]: { query: unknown };
  },
  k extends keyof QueryRecord
> = QueryRecord[k]['query'] extends infer All
  ? All extends (data: infer Data) => (store: any, context: any) => infer R
    ? R extends {
        queryRef: QueryRef<infer State, infer Params, infer InsertionsOutput>;
      }
      ? Data extends SignalWrapperParams<infer PluggableParams>
        ? ReturnType<
            typeof withCachedQueryToPlugFactory<
              k & string,
              State extends object | undefined ? State : never,
              Params,
              PluggableParams,
              true,
              InsertionsOutput
            >
          >
        : ReturnType<
            typeof withCachedQueryToPlugFactory<
              k & string,
              State extends object | undefined ? State : never,
              Params,
              {},
              false,
              InsertionsOutput
            >
          >
      : 'never2Test'
    : `Error: Please use rxQuery or query. Eg: { ${k &
        string}: { query: () => rxQuery(...) }}`
  : 'never1';

type WithInjectQueryOutputMapperTyped<
  QueryKeys extends keyof QueryRecord,
  QueryRecord extends {
    [key in QueryKeys]: { query: unknown };
  },
  k extends keyof QueryRecord
> = QueryRecord[k]['query'] extends infer All
  ? All extends (data: infer Data) => (store: any, context: any) => infer R
    ? R extends {
        queryRef: QueryRef<infer State, infer Params, infer InsertionsOutput>;
      }
      ? Data extends SignalWrapperParams<infer PluggableParams>
        ? (
            pluggable?: (
              source: SignalProxy<NoInfer<PluggableParams>>
            ) => SignalWrapperParams<NoInfer<PluggableParams>>
          ) => ResourceRef<State> & InsertionsOutput
        : () => ResourceRef<State> & InsertionsOutput
      : 'never2Test'
    : `Error: Please use rxQuery or query. Eg: { ${k &
        string}: { query: () => rxQuery(...) }}`
  : 'never1';

type WithInjectQueryByIdOutputMapperTyped<
  QueryByIdKeys extends keyof QueryByIdRecord,
  QueryByIdRecord extends {
    [key in QueryByIdKeys]: { queryById: unknown };
  },
  k extends keyof QueryByIdRecord
> = QueryByIdRecord[k]['queryById'] extends infer All
  ? All extends (data: infer Data) => (store: any, context: any) => infer R
    ? R extends {
        queryByIdRef: QueryByIdRef<
          infer GroupIdentifier,
          infer State,
          infer Params,
          infer InsertionsOutput
        >;
      }
      ? Data extends SignalWrapperParams<infer PluggableParams>
        ? (
            pluggable?: (
              source: SignalProxy<NoInfer<PluggableParams>>
            ) => SignalWrapperParams<NoInfer<PluggableParams>>
          ) => ResourceByIdRef<GroupIdentifier, State> & InsertionsOutput
        : () => ResourceByIdRef<GroupIdentifier, State> & InsertionsOutput
      : 'never2'
    : `Error: Please use rxQueryById or queryById. Eg: { ${k &
        string}: { queryById: () => rxQueryById(...) }}`
  : 'never1';

type WithQueryByIdOutputMapperTyped<
  QueryByIdKeys extends keyof QueryByIdRecord,
  QueryByIdRecord extends {
    [key in QueryByIdKeys]: { queryById: unknown };
  },
  k extends keyof QueryByIdRecord
> = QueryByIdRecord[k]['queryById'] extends infer All
  ? All extends (data: infer Data) => (store: any, context: any) => infer R
    ? R extends {
        queryByIdRef: QueryByIdRef<
          infer GroupIdentifier,
          infer State,
          infer Params,
          infer InsertionsOutput
        >;
      }
      ? Data extends SignalWrapperParams<infer PluggableParams>
        ? ReturnType<
            typeof withCachedQueryByIdToPlugFactory<
              k & string,
              State extends object | undefined ? State : never,
              Params,
              PluggableParams,
              GroupIdentifier,
              true,
              InsertionsOutput
            >
          >
        : ReturnType<
            typeof withCachedQueryByIdToPlugFactory<
              k & string,
              State extends object | undefined ? State : never,
              Params,
              {},
              GroupIdentifier,
              false,
              InsertionsOutput
            >
          >
      : 'never2'
    : `Error: Please use rxQueryById or queryById. Eg: { ${k &
        string}: { queryById: () => rxQueryById(...) }}`
  : 'never1';

type CachedQueryFactoryOutput<
  QueryKeys extends keyof QueryRecord,
  QueryByIdKeys extends keyof QueryByIdRecord,
  QueryRecord extends {
    [key in QueryKeys]: QueryConfiguration<PluggableParams>;
  },
  CacheTime, // Default cache time in milliseconds (5 minutes)
  QueryByIdRecord extends {
    [key in QueryByIdKeys]: QueryByIdConfiguration<PluggableParams>;
  },
  PluggableParams extends object
> = MergeObjects<
  [
    QueryKeys extends string
      ? {
          [k in keyof QueryRecord as `with${Capitalize<
            string & k
          >}Query`]: WithQueryOutputMapperTyped<QueryKeys, QueryRecord, k>;
        } & {
          [k in keyof QueryRecord as `inject${Capitalize<
            string & k
          >}Query`]: WithInjectQueryOutputMapperTyped<
            QueryKeys,
            QueryRecord,
            k
          >;
        }
      : {},
    QueryByIdKeys extends string
      ? {
          [k in keyof QueryByIdRecord as `with${Capitalize<
            string & k
          >}QueryById`]: WithQueryByIdOutputMapperTyped<
            QueryByIdKeys,
            QueryByIdRecord,
            k
          >;
        } & {
          [k in keyof QueryByIdRecord as `inject${Capitalize<
            string & k
          >}QueryById`]: WithInjectQueryByIdOutputMapperTyped<
            QueryByIdKeys,
            QueryByIdRecord,
            k
          >;
        }
      : {}
  ]
>;

type QueryConfiguration<PluggableParams extends object> = {
  config?: QueryCacheCustomConfig;
  query: () =>
    | (() => QueryRefType)
    | ((data: SignalProxy<PluggableParams>) => QueryRefType);
};

type QueryByIdConfiguration<PluggableParams extends object> = {
  config?: QueryCacheCustomConfig;
  queryById: () =>
    | (() => QueryByIdRefType)
    | ((data: SignalProxy<PluggableParams>) => QueryByIdRefType);
};

export function globalQueries<
  const QueryKeys extends keyof QueryRecord,
  const QueryByIdKeys extends keyof QueryByIdRecord,
  PluggableParams extends object,
  const QueryRecord extends {
    [key in QueryKeys]: QueryConfiguration<PluggableParams>;
  },
  const QueryByIdRecord extends {
    [key in QueryByIdKeys]: QueryByIdConfiguration<PluggableParams>;
  },
  const CacheTime = 300000 // Default cache time in milliseconds (5 minutes)
>(
  {
    queries,
    queriesById,
  }: {
    queries?: QueryRecord;
    queriesById?: QueryByIdRecord;
  },
  cacheGlobalConfig?: {
    /**
     * Default cache time in milliseconds.
     * This is the time after which the cached data will be considered stale and eligible for garbage collection.
     * If not specified, the default is 5 minutes (300000 ms).
     */
    cacheTime?: CacheTime;
    persister?: QueriesPersister;
    featureName?: string;
  }
): CachedQueryFactoryOutput<
  QueryKeys,
  QueryByIdKeys,
  QueryRecord,
  CacheTime,
  QueryByIdRecord,
  PluggableParams
> {
  const queriesMap = new Map<string, QueryRefType>();
  const queriesByIdMap = new Map<string, QueryByIdRefType>();
  return {
    ...(queries && {
      ...Object.entries<QueryConfiguration<PluggableParams>>(queries).reduce(
        (acc, [key, value]) => {
          const capitalizedKey = (key.charAt(0).toUpperCase() +
            key.slice(1)) as Capitalize<QueryKeys & string>;
          const withQueryName = `with${capitalizedKey}Query` as const;
          const injectQueryName = `inject${capitalizedKey}Query` as const;

          const queryData = (injector: Injector) => {
            if (queriesMap.has(key)) {
              return queriesMap.get(key) as QueryRefType;
            }
            return runInInjectionContext(injector, () => {
              const isPluggableQuery = value.query.length > 0;
              const queryData = (
                isPluggableQuery
                  ? ((value.query as any)(signalProxy) as any)({}, {})
                  : (value.query as any)()?.({}, {})
              ) as QueryRefType;
              const queryRef = queryData.queryRef;
              const queryResource = queryRef.resource;
              const queryResourceParamsSrc = queryRef.resourceParamsSrc;
              cacheGlobalConfig?.persister?.addQueryToPersist({
                key,
                queryResource,
                queryResourceParamsSrc,
                waitForParamsSrcToBeEqualToPreviousValue: false,
                cacheTime:
                  value?.config?.cacheTime ??
                  (cacheGlobalConfig?.cacheTime as number | undefined) ??
                  300000,
              });
              queriesMap.set(key, queryData);
              return queryData;
            });
          };
          const signalProxy = createSignalProxy(signal({})) as any;

          const queryEntity = withCachedQueryToPlugFactory(
            key,
            signalProxy,
            queryData as any
          );
          //@ts-expect-error force type
          acc[withQueryName] = queryEntity;
          //@ts-expect-error force type
          acc[injectQueryName] = (pluggableData) => {
            const _injector = inject(Injector);
            signalProxy.$set(pluggableData?.(signalProxy));
            if (queriesMap.has(key)) {
              return queriesMap.get(key)?.queryRef.resource;
            }
            return queryData(_injector).queryRef.resource;
          };

          return acc;
        },
        {} as WithQueryOutputMapper<Record<string, QueryConfiguration<{}>>>
      ),
    }),
    ...(queriesById && {
      ...Object.entries<QueryByIdConfiguration<PluggableParams>>(
        queriesById
      ).reduce((acc, [key, value]) => {
        const capitalizedKey = (key.charAt(0).toUpperCase() +
          key.slice(1)) as Capitalize<QueryKeys & string>;
        const withQueryName = `with${capitalizedKey}QueryById` as const;

        const queryData = (injector: Injector) => {
          if (queriesByIdMap.has(key)) {
            return queriesByIdMap.get(key);
          }
          return runInInjectionContext(injector, () => {
            const isPluggableQuery = value.queryById.length > 0;
            const queryData = (
              isPluggableQuery
                ? ((value.queryById as any)(signalProxy) as any)({}, {})
                : (value.queryById as any)()?.({}, {})
            ) as QueryByIdRefType;
            const queryByRef = queryData.queryByIdRef;
            const queryByIdResource = queryByRef.resourceById;
            const queryResourceParamsSrc = queryByRef.resourceParamsSrc;
            cacheGlobalConfig?.persister?.addQueryByIdToPersist({
              key,
              queryByIdResource,
              queryResourceParamsSrc,
              waitForParamsSrcToBeEqualToPreviousValue: false,
              cacheTime:
                value?.config?.cacheTime ??
                (cacheGlobalConfig?.cacheTime as number | undefined) ??
                300000,
            });
            queriesByIdMap.set(key, queryData);
            return queryData;
          });
        };
        const signalProxy = createSignalProxy(signal({})) as any;

        const queryEntity = withCachedQueryByIdToPlugFactory(
          key,
          signalProxy,
          queryData as any
        );
        //@ts-expect-error force type
        acc[withQueryName] = queryEntity;
        const injectQueryName = `inject${capitalizedKey}QueryById` as const;
        //@ts-expect-error force type
        acc[injectQueryName] = (pluggableData) => {
          const _injector = inject(Injector);
          signalProxy.$set(pluggableData?.(signalProxy));
          if (queriesByIdMap.has(key)) {
            return {
              ...queriesByIdMap.get(key)?.queryByIdRef.resourceById,
              ...(queriesByIdMap.get(key)?.queryByIdRef.insertionsOutputs ??
                {}),
            };
          }
          return {
            ...queryData(_injector)?.queryByIdRef.resourceById,
            ...(queryData(_injector)?.queryByIdRef.insertionsOutputs ?? {}),
          };
        };

        return acc;
      }, {} as WithQueryByIdOutputMapper<Record<string, QueryByIdConfiguration<{}>>>),
    }),
  } as CachedQueryFactoryOutput<
    QueryKeys,
    QueryByIdKeys,
    QueryRecord,
    CacheTime,
    QueryByIdRecord,
    PluggableParams
  >;
}

export function assignRealQuery(fn: () => {}, realQuery: any): () => {} {
  return Object.assign(fn, realQuery);
}
