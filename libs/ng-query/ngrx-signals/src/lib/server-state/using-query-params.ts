import {
  computed,
  Injector,
  linkedSignal,
  signal,
  Signal,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { Prettify } from '@ngrx/signals';

export interface QueryParamConfig<T = unknown> {
  defaultValue: NoInfer<T>;
  parse: (value: string) => T;
  serialize: (value: NoInfer<T>) => string;
}

export interface QueryParamNavigationOptions {
  queryParamsHandling?: 'merge' | 'preserve' | '';
  onSameUrlNavigation?: 'reload' | 'ignore';
  replaceUrl?: boolean;
  skipLocationChange?: boolean;
}

type QueryParamProps<
  QueryParams extends Record<string, QueryParamConfig<unknown>>
> = {
  [K in keyof QueryParams]: Signal<ReturnType<QueryParams[K]['parse']>>;
};

type QueryParamMethods<
  QueryParamsName extends string,
  QueryParams extends Record<string, QueryParamConfig<unknown>>,
  CustomMethods
> = {
  [key in `set${Capitalize<QueryParamsName>}QueryParams`]: (
    params: Partial<{
      [K in keyof QueryParams]: ReturnType<QueryParams[K]['parse']>;
    }>,
    options?: QueryParamNavigationOptions
  ) => void;
} & {
  [key in `reset${Capitalize<QueryParamsName>}QueryParams`]: (
    options?: QueryParamNavigationOptions
  ) => void;
} & {
  // remove first argument (queryParams)
  [K in keyof CustomMethods]: CustomMethods[K] extends (
    first: infer QueryParamsState,
    ...args: infer Rest
  ) => any
    ? (...args: Rest) => void
    : never;
};

type ToState<QueryParamConfigs> = {
  [K in keyof QueryParamConfigs]: ReturnType<
    QueryParamConfigs[K] extends QueryParamConfig<infer U> ? () => U : never
  >;
};

type UsingQueryParamsConfig<
  QueryParamsConfig,
  MethodKeys extends string,
  Methods extends Record<
    MethodKeys,
    (
      queryParams: Prettify<ToState<QueryParamsConfig>>,
      ...args: any[]
    ) => Prettify<ToState<QueryParamsConfig>>
  >
> = {
  options?: QueryParamNavigationOptions;
  methods?: Methods;
  queryParams?: Prettify<ToState<QueryParamsConfig>>;
};

type SpecificUsingQueryParamsOutputs<
  QueryParamsName extends string,
  QueryParams extends Record<string, QueryParamConfig<unknown>>,
  CustomMethods
> = {
  props: QueryParamProps<QueryParams> & {
    [K in QueryParamsName]: Signal<Prettify<ToState<QueryParams>>>;
  };
  methods: QueryParamMethods<QueryParamsName, QueryParams, CustomMethods>;
  inputs: {};
  queryParams: QueryParamProps<QueryParams> & {
    [K in QueryParamsName]: Signal<Prettify<ToState<QueryParams>>>;
  };
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
};

type SpecificUsingQueryStandaloneOutputs<
  QueryParamsName extends string,
  QueryParams extends Record<string, QueryParamConfig<unknown>>
> = {
  [K in QueryParamsName as `set${Capitalize<K>}QueryParams`]: <
    T extends Partial<{
      [K in keyof QueryParams]: ReturnType<QueryParams[K]['parse']>;
    }>
  >(
    params: T
  ) => T;
};

type UsingQueryParamsOutputs<
  Context extends ContextConstraints,
  QueryParamsName extends string,
  QueryParams extends Record<string, QueryParamConfig<unknown>>,
  CustomMethods
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingQueryParamsOutputs<QueryParamsName, QueryParams, CustomMethods>,
  SpecificUsingQueryStandaloneOutputs<QueryParamsName, QueryParams>
>;

// todo expose an alias to concatenate all queryprams
// todo rename usingPersistedParams ? usingParam(..., {persister: queryParamPersister(...navigation extras)})
// todo  usingParam(..., {persister: localStorageParamPersister(...navigation extras)})

// todo tester quand on a des queryParams dans l'url au demarrage, puis on change de page et on revient

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
 * const { injectServerState, setPaginationQueryParams } = serverState(
 *   usingQueryParams('pagination', () => ({
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
 * const store = injectServerState();
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
 *     }).toString()}`
 *   );
 * }
 * ```
 */
export function usingQueryParams<
  Context extends ContextConstraints,
  const QueryParamsName extends string,
  QueryParamsConfig extends Record<string, QueryParamConfig<unknown>>,
  MethodKeys extends string,
  Methods extends Record<
    MethodKeys,
    (
      queryParams: Prettify<ToState<QueryParamsConfig>>,
      ...args: any[]
    ) => Prettify<ToState<QueryParamsConfig>>
  >
>(
  queryParamsName: QueryParamsName,
  queryParamsFactory: () => QueryParamsConfig,
  config?: UsingQueryParamsConfig<QueryParamsConfig, MethodKeys, Methods>
): UsingQueryParamsOutputs<
  Context,
  QueryParamsName,
  QueryParamsConfig,
  Methods
> {
  const queryParamsConfig = queryParamsFactory();
  const context = (contextData: ContextConstraints, injector: Injector) => {
    const router = injector.get(Router);
    const activatedRoute = injector.get(ActivatedRoute);

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
    ) as Signal<ToState<QueryParamsConfig>>;

    const props = Object.entries(queryParamsConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = computed(() => queryParamsState()[key]);
        return acc;
      },
      {} as Record<string, Signal<unknown>>
    );

    // Helper function to navigate with query params
    const navigateWithQueryParams = (
      params: Record<string, string>,
      options: QueryParamNavigationOptions = {}
    ) => {
      const navigationExtras: NavigationExtras = {
        queryParams: params,
        queryParamsHandling:
          options.queryParamsHandling ||
          defaultOptions.queryParamsHandling ||
          'merge',
        onSameUrlNavigation:
          options.onSameUrlNavigation || defaultOptions.onSameUrlNavigation,
        replaceUrl: options.replaceUrl ?? defaultOptions.replaceUrl,
        skipLocationChange:
          options.skipLocationChange ?? defaultOptions.skipLocationChange,
        relativeTo: activatedRoute,
      };

      router.navigate([], navigationExtras);
    };

    // Helper function to parse state and navigate
    const serializeAndNavigate = (
      state: Prettify<ToState<QueryParamsConfig>>,
      options?: QueryParamNavigationOptions
    ) => {
      queryParamSignals.set(state);
      const serializedParams = serializeQueryParams(state, queryParamsConfig);

      navigateWithQueryParams(serializedParams, options);
    };

    const defaultParams = Object.entries(queryParamsConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = config.serialize(config.defaultValue);
        return acc;
      },
      {} as Record<string, string>
    );

    // Create general methods
    const generalMethods = {
      [`set${capitalize(queryParamsName)}QueryParams`]: (
        params: Partial<{
          [K in keyof QueryParamsConfig]: ReturnType<
            QueryParamsConfig[K]['parse']
          >;
        }>,
        options?: QueryParamNavigationOptions
      ) => {
        const serializedParams = Object.entries(params).reduce(
          (acc, [key, value]) => {
            const paramConfig = queryParamsConfig[key];
            if (paramConfig && value !== undefined) {
              acc[key] = paramConfig.serialize(value);
            }
            return acc;
          },
          {} as Record<string, string>
        );

        navigateWithQueryParams(serializedParams, options);
      },

      [`reset${capitalize(queryParamsName)}QueryParams`]: (
        options?: QueryParamNavigationOptions
      ) => {
        navigateWithQueryParams(defaultParams, {
          ...options,
          queryParamsHandling: '',
        });
      },
    };

    const customMethods = config?.methods
      ? Object.entries(config.methods).reduce((acc, [name, fn]) => {
          return {
            ...acc,
            [name]: (...args: unknown[]) => {
              const newState = (fn as Function)(
                queryParamsState() as Prettify<ToState<QueryParamsConfig>>,
                ...args
              );
              // Use parseAndNavigate to apply the new state and navigate
              serializeAndNavigate(newState);
            },
          };
        }, {})
      : {};

    const methods = {
      ...generalMethods,
      ...customMethods,
    } as QueryParamMethods<QueryParamsName, QueryParamsConfig, Methods>;
    console.log('methods', methods);

    return {
      props: {
        ...props,
        [`${queryParamsName}`]: queryParamsState,
      },
      inputs: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods,
      sources: {},
      queryParams: {
        ...props,
        [`${queryParamsName}`]: queryParamsState,
      },
    } as SpecificUsingQueryParamsOutputs<
      QueryParamsName,
      QueryParamsConfig,
      Methods
    >;
  };

  return Object.assign(context, {
    [`set${capitalize(queryParamsName)}QueryParams`]: (
      params: Partial<{
        [K in keyof ToState<QueryParamsConfig>]: ToState<QueryParamsConfig>[K];
      }>
    ) => serializeQueryParams(params, queryParamsConfig),
  }) as unknown as UsingQueryParamsOutputs<
    Context,
    QueryParamsName,
    QueryParamsConfig,
    Methods
  >;
}

function serializeQueryParams<
  QueryParamsConfig extends Partial<Record<string, QueryParamConfig<unknown>>>
>(
  params: Partial<{
    [K in keyof ToState<QueryParamsConfig>]: ToState<QueryParamsConfig>[K];
  }>,
  queryParamsConfig: QueryParamsConfig
) {
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

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
