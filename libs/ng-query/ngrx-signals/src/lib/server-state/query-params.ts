import {
  assertInInjectionContext,
  computed,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  InsertionsQueryParamsFactory,
  InsertionQueryParamsFactoryContext,
  QueryParamMethods,
} from '../core/query.core';
import { MergeObjects } from '../types/util.type';
import { FilterReadonlySource, IsEmptyObject } from './util/util.type';
import { Prettify } from '@ngrx/signals';
import { ActivatedRoute, Router } from '@angular/router';

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
  config: {
    state: QueryParamsType;
  } & QueryParamNavigationOptions
): QueryParamsOutput<QueryParamsType, {}, QueryParamsState>;
export function queryParams<
  QueryParamsType extends Record<string, QueryParamConfig<unknown>>,
  Insertion1,
  QueryParamsState = Prettify<QueryParamsToState<QueryParamsType>>
>(
  config: { state: QueryParamsType } & QueryParamNavigationOptions,
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
  config: { state: QueryParamsType } & QueryParamNavigationOptions,
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
  config: { state: QueryParamsType } & QueryParamNavigationOptions,
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
  config: { state: QueryParamsType } & QueryParamNavigationOptions,
  ...insertions: any[]
): QueryParamsOutput<QueryParamsType, {}, QueryParamsState> {
  assertInInjectionContext(queryParams);

  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);

  const { state: queryParamsConfig, ...options } = config;

  // Get initial default values
  const getDefaultState = () =>
    Object.entries(queryParamsConfig).reduce((acc, [key, config]) => {
      acc[key] = config.defaultValue;
      return acc;
    }, {} as Record<string, unknown>) as QueryParamsToState<QueryParamsType>;

  // Create the state signal with default values
  const queryParamsState = signal(getDefaultState()) as WritableSignal<
    QueryParamsToState<QueryParamsType>
  >;

  // Save the original set method before we override it
  const originalSet = queryParamsState.set.bind(queryParamsState);

  // Navigation helper
  const navigate = (
    newState: QueryParamsToState<QueryParamsType>,
    navOptions?: QueryParamNavigationOptions
  ) => {
    // Update the local state first using the original set method
    originalSet(newState);

    // Then navigate without triggering another update
    const mergedOptions = { ...options, ...navOptions };
    const serializedParams = Object.entries(queryParamsConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = config.serialize(newState[key]);
        return acc;
      },
      {} as Record<string, string>
    );

    // Use queueMicrotask to avoid call stack issues
    queueMicrotask(() => {
      router.navigate([], {
        relativeTo: activatedRoute,
        queryParams: serializedParams,
        queryParamsHandling: mergedOptions.queryParamsHandling,
        onSameUrlNavigation: mergedOptions.onSameUrlNavigation,
        replaceUrl: mergedOptions.replaceUrl,
        skipLocationChange: mergedOptions.skipLocationChange,
      });
    });
  };

  // Create individual property signals
  const props = Object.entries(queryParamsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = computed(() => queryParamsState()[key]);
      return acc;
    },
    {} as Record<string, Signal<unknown>>
  );

  // Create methods
  const methods = {
    set: (
      params: QueryParamsToState<QueryParamsType>,
      navOptions?: QueryParamNavigationOptions
    ) => {
      navigate(params, navOptions);
    },
    update: (
      updateFn: (
        currentParams: QueryParamsToState<QueryParamsType>
      ) => QueryParamsToState<QueryParamsType>,
      navOptions?: QueryParamNavigationOptions
    ) => {
      const newState = updateFn(queryParamsState());
      navigate(newState, navOptions);
    },
    patch: (
      params: Partial<QueryParamsToState<QueryParamsType>>,
      navOptions?: QueryParamNavigationOptions
    ) => {
      const newState = { ...queryParamsState(), ...params };
      navigate(newState, navOptions);
    },
    reset: (navOptions?: QueryParamNavigationOptions) => {
      navigate(getDefaultState(), navOptions);
    },
  };

  // Process insertions
  const insertionResults =
    (
      insertions as InsertionsQueryParamsFactory<
        QueryParamsState,
        QueryParamsType,
        {}
      >[]
    )?.reduce((acc, insert) => {
      return {
        ...acc,
        ...insert({
          state: queryParamsState.asReadonly(),
          config: queryParamsConfig,
          ...methods,
          insertions: acc as {},
        } as InsertionQueryParamsFactoryContext<QueryParamsType, {}, QueryParamsState>),
      };
    }, {} as Record<string, unknown>) || {};

  return Object.assign(
    queryParamsState,
    props,
    methods,
    insertionResults
  ) as unknown as QueryParamsOutput<QueryParamsType, {}, QueryParamsState>;
}
