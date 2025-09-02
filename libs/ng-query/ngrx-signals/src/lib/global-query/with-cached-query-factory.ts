import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
  WritableStateSource,
} from '@ngrx/signals';
import { InternalType } from '../types/util.type';
import { QueryRef, QueryOptions, withQuery } from '../with-query';
import { SignalProxy, SignalWrapperParams } from '../signal-proxy';
import { Injector } from '@angular/core';
import {
  QueryByIdOptions,
  QueryByIdRef,
  withQueryById,
} from '../with-query-by-id';

export function withCachedQueryToPlugFactory<
  const QueryName extends string,
  QueryState extends object | undefined,
  QueryParams,
  PlugData extends object,
  IsPluggableQuery,
  ExtendedOutputs extends Record<string, unknown> = {}
>(
  name: QueryName,
  querySourceProxy: SignalProxy<PlugData, true>,
  queryRef: (injector: Injector) => {
    queryRef: QueryRef<QueryState, QueryParams>;
    __types: InternalType<QueryState, QueryParams, unknown, false>;
  }
) {
  return <
    Input extends SignalStoreFeatureResult,
    const StoreInput extends Prettify<
      StateSignals<Input['state']> &
        Input['props'] &
        Input['methods'] &
        WritableStateSource<Prettify<Input['state']>>
    >
  >(
    options?: QueryOptions<
      StoreInput,
      Input,
      QueryState,
      QueryParams,
      unknown,
      ExtendedOutputs,
      {
        setQuerySource?: IsPluggableQuery extends true
          ? (
              source: SignalProxy<NoInfer<PlugData>>
            ) => SignalWrapperParams<NoInfer<PlugData>>
          : never;
      }
    >
  ) => {
    return withQuery(
      name,
      (store, injector) => {
        const setQuerySource = options?.(store)?.setQuerySource;
        if (setQuerySource) {
          const source = options?.(store)?.setQuerySource?.(
            querySourceProxy as unknown as SignalProxy<PlugData>
          ) as SignalWrapperParams<PlugData>;
          querySourceProxy.$set(source);
        }
        return () => queryRef(injector);
      },
      options
    );
  };
}

export function withCachedQueryByIdToPlugFactory<
  const QueryName extends string,
  QueryState extends object | undefined,
  QueryParams,
  PlugData extends object,
  GroupIdentifier extends string | number,
  IsPluggableQuery,
  ExtendedOutputs extends Record<string, unknown> = {}
>(
  name: QueryName,
  querySourceProxy: SignalProxy<PlugData, true>,
  queryByIdRef: (injector: Injector) => {
    queryByIdRef: QueryByIdRef<GroupIdentifier, QueryState, QueryParams>;
    __types: InternalType<
      QueryState,
      QueryParams,
      unknown,
      true,
      GroupIdentifier
    >;
  }
) {
  return <
    Input extends SignalStoreFeatureResult,
    const StoreInput extends Prettify<
      StateSignals<Input['state']> &
        Input['props'] &
        Input['methods'] &
        WritableStateSource<Prettify<Input['state']>>
    >
  >(
    options?: QueryByIdOptions<
      StoreInput,
      Input,
      QueryState,
      QueryParams,
      GroupIdentifier,
      unknown,
      ExtendedOutputs,
      {
        setQuerySource?: IsPluggableQuery extends true
          ? (
              source: SignalProxy<NoInfer<PlugData>>
            ) => SignalWrapperParams<NoInfer<PlugData>>
          : never;
      }
    >
  ) => {
    return withQueryById(
      name,
      (store, injector) => {
        const opt = options?.(store);
        const setQuerySource = options?.(store)?.setQuerySource;
        if (setQuerySource) {
          const source = options?.(store)?.setQuerySource?.(
            querySourceProxy as unknown as SignalProxy<PlugData>
          ) as SignalWrapperParams<PlugData>;
          querySourceProxy.$set(source);
        }
        return () => queryByIdRef(injector);
      },
      options
    );
  };
}
