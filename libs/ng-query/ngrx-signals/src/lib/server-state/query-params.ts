import {
  assertInInjectionContext,
  inject,
  isSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  InsertionsQueryParamsFactory,
  InsertionQueryParamsFactoryContext,
  QueryParamMethods,
} from '../core/query.core';
import { ReadonlySource } from './util/source.type';
import { MergeObjects } from '../types/util.type';
import { IsEmptyObject } from './util/util.type';
import { Prettify } from '@ngrx/signals';
import { ActivatedRoute, Router } from '@angular/router';

// todo facto
type FilterReadonlySource<Insertions> = {
  [K in keyof Insertions as Insertions[K] extends ReadonlySource<any>
    ? never
    : K]: Insertions[K];
};

export interface QueryParamNavigationOptions {
  queryParamsHandling?: 'merge' | 'preserve' | '';
  onSameUrlNavigation?: 'reload' | 'ignore';
  replaceUrl?: boolean;
  skipLocationChange?: boolean;
}

export type QueryParamsToState<QueryParamConfigs> = {
  [K in keyof QueryParamConfigs]: ReturnType<
    QueryParamConfigs[K] extends QueryParamConfig<infer U> ? () => U : never
  >;
};

export type QueryParamsOutput<QueryParamsType, Insertions, QueryParamsState> =
  Signal<QueryParamsToState<QueryParamsType>> &
    MergeObjects<
      [
        {
          [K in keyof QueryParamsState]: Signal<QueryParamsState[K]>;
        },
        QueryParamMethods<QueryParamsState>,
        IsEmptyObject<Insertions> extends true
          ? {}
          : FilterReadonlySource<Insertions>
      ]
    >;

export interface QueryParamConfig<T = unknown> {
  defaultValue: NoInfer<T>;
  parse: (value: string) => T;
  serialize: (value: NoInfer<T>) => string;
}

export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  queryParamsConfig: {
    state: QueryParamsType;
  } & QueryParamNavigationOptions
): QueryParamsOutput<QueryParamsType, {}, QueryParamsState>;
export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  Insertion1,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  queryParamsConfig: { state: QueryParamsType } & QueryParamNavigationOptions,
  insertion1: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion1
  >
): QueryParamsOutput<QueryParamsType, Insertion1, QueryParamsState>;
export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  Insertion1,
  Insertion2,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  queryParamsConfig: { state: QueryParamsType } & QueryParamNavigationOptions,
  insertion1: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion1
  >,
  insertion2: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion2,
    Insertion1
  >
): QueryParamsOutput<
  QueryParamsType,
  Insertion1 & Insertion2,
  QueryParamsState
>;
export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  Insertion1,
  Insertion2,
  Insertion3,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  queryParamsConfig: { state: QueryParamsType } & QueryParamNavigationOptions,
  insertion1: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion1
  >,
  insertion2: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsQueryParamsFactory<
    NoInfer<QueryParamsState>,
    NoInfer<QueryParamsType>,
    Insertion3,
    Insertion1 & Insertion2
  >
): QueryParamsOutput<
  QueryParamsType,
  Insertion1 & Insertion2 & Insertion3,
  QueryParamsState
>;
export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  queryParamsConfig: { state: QueryParamsType } & QueryParamNavigationOptions,
  ...insertions: any[]
): QueryParamsOutput<QueryParamsType, {}, QueryParamsState> {
  assertInInjectionContext(queryParams);

  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);

  const defaultOptions = config?.options || {};

  // Create signals for each query parameter
  const queryParamSignals = linkedSignal(() => {
    return (
      router.currentNavigation()?.extractedUrl.queryParams ??
      activatedRoute.snapshot.queryParams
    );
  });

  // Create computed signals for each query parameter with parsing
  const queryParamsState = linkedSignal(() =>
    Object.entries(queryParamsConfig).reduce((acc, [key, config]) => {
      const rawValue = queryParamSignals()?.[key];
      if (rawValue === undefined || rawValue === null) {
        acc[key] = config.defaultValue;
        return acc;
      }
      try {
        acc[key] = config.parse(rawValue);
        return acc;
      } catch {
        acc[key] = config.defaultValue;
        return acc;
      }
    }, {} as Record<string, unknown>)
  ) as WritableSignal<QueryParamsToState<QueryParamsConfig>>;

  const props = Object.entries(queryParamsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = computed(() => queryParamsState()[key]);
      return acc;
    },
    {} as Record<string, Signal<unknown>>
  );

  // const isSignalState = isSignal(queryParamsConfig);
  // const stateSignal = isSignalState
  //   ? (queryParamsConfig as WritableSignal<StateType>)
  //   : signal(queryParamsConfig as StateType);

  // return Object.assign(
  //   stateSignal,
  //   (insertions as InsertionsQueryParamsFactory<StateType, {}>[])?.reduce(
  //     (acc, insert) => {
  //       return {
  //         ...acc,
  //         ...insert({
  //           state: stateSignal.asReadonly(),
  //           set: (newState: StateType) => stateSignal.set(newState),
  //           update: (updateFn: (currentState: StateType) => StateType) =>
  //             stateSignal.update(updateFn),
  //           insertions: acc as {},
  //         } as InsertionQueryParamsFactoryContext<StateType, {}>),
  //       };
  //     },
  //     {} as Record<string, unknown>
  //   )
  // ) as unknown as QueryParamsOutput<StateType, {}>;
}
