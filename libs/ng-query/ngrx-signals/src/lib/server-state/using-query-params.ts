import { computed, linkedSignal, signal, Signal } from '@angular/core';
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

type UsingQueryParamsOutputs<
  Context extends ContextConstraints,
  QueryParamsName extends string,
  QueryParams extends Record<string, QueryParamConfig<unknown>>,
  CustomMethods
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingQueryParamsOutputs<QueryParamsName, QueryParams, CustomMethods>
>;

// todo expose an alias to concatenate all queryprams
// todo rename usingPersistedParams ? usingParam(..., {persister: queryParamPersister(...navigation extras)})
// todo  usingParam(..., {persister: localStorageParamPersister(...navigation extras)})

// todo tester quand on a des queryParams dans l'url au demarrage, puis on change de page et on revient

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
  return (contextData, injector) => {
    const router = injector.get(Router);
    const activatedRoute = injector.get(ActivatedRoute);
    const queryParams = queryParamsFactory();
    const defaultOptions = config?.options || {};

    // Create signals for each query parameter
    const queryParamSignals = linkedSignal(() => {
      console.log('router.currentNavigation()', router.currentNavigation());
      return (
        router.currentNavigation()?.extractedUrl.queryParams ??
        activatedRoute.snapshot.queryParams
      );
    });

    // Create computed signals for each query parameter with parsing
    const queryParamsState = linkedSignal(() =>
      Object.entries(queryParams).reduce((acc, [key, config]) => {
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
    );

    const props = Object.entries(queryParams).reduce((acc, [key, config]) => {
      acc[key] = computed(() => queryParamsState()[key]);
      return acc;
    }, {} as Record<string, Signal<unknown>>);

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
    const parseAndNavigate = (
      state: Prettify<ToState<QueryParamsConfig>>,
      options?: QueryParamNavigationOptions
    ) => {
      queryParamSignals.set(state);
      const serializedParams = Object.entries(state).reduce(
        (acc, [key, value]) => {
          const paramConfig = queryParams[key];
          if (paramConfig && value !== undefined) {
            acc[key] = paramConfig.serialize(value);
          }
          return acc;
        },
        {} as Record<string, string>
      );

      navigateWithQueryParams(serializedParams, options);
    };

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
            const paramConfig = queryParams[key];
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
        const defaultParams = Object.entries(queryParams).reduce(
          (acc, [key, config]) => {
            acc[key] = config.serialize(config.defaultValue);
            return acc;
          },
          {} as Record<string, string>
        );

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
              parseAndNavigate(newState);
            },
          };
        }, {})
      : {};

    const methods = {
      ...generalMethods,
      ...customMethods,
    } as QueryParamMethods<QueryParamsName, QueryParamsConfig, Methods>;

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
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
