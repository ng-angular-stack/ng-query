import { WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  EmptyContext,
  ServerStateFactoryUtility,
  StoreConfigConstraints,
} from './server-state';
import { Prettify } from '@ngrx/signals';
import { STORE_CONFIG_TOKEN } from './util/util.type';

type InferQueryParamsState<T> = T extends WritableSignal<infer U> ? U : never;

type SpecificCraftSetAllQueriesParamsStandaloneOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
> = {
  [K in `setAll${Capitalize<
    (typeof STORE_CONFIG_TOKEN)['NAME']
  >}QueryParams`]: <
    AllQueriesParamsState extends {
      [K in keyof Context['queryParams']]: Context['queryParams'][K];
      // | InferQueryParamsState<Context['queryParams'][K]>
      // | 'default';
    }
  >(
    params: Prettify<AllQueriesParamsState>
  ) => AllQueriesParamsState;
} & {
  testName: StoreConfig['name'];
  testconf: StoreConfig;
};

type CraftSetAllQueriesParamsStandaloneOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
> = ServerStateFactoryUtility<
  Context,
  StoreConfig,
  EmptyContext,
  SpecificCraftSetAllQueriesParamsStandaloneOutputs<Context, StoreConfig>
>;

/**
 * Order matters: this function must be declared after `usingQueryParams` to ensure types are properly inferred.
 */
export function craftSetAllQueriesParamsStandalone<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
>(): CraftSetAllQueriesParamsStandaloneOutputs<Context, StoreConfig> {
  return () => {
    return {
      props: {},
      inputs: {},
      __injections: {},
      queryParams: {},
      sources: {},
      __query: {},
      __mutation: {},
      methods: {},
      asyncMethods: {},
    } as EmptyContext;
  };
}
