import { WritableSignal } from '@angular/core';
import {
  ContextConstraints,
  EmptyContext,
  CraftFactoryUtility,
  StoreConfigConstraints,
  partialContext,
} from './craft';
import { Prettify } from '@ngrx/signals';
import { STORE_CONFIG_TOKEN } from './util/util.type';

type InferQueryParamsState<T> = T extends WritableSignal<infer U> ? U : never;

type SpecificCraftSetAllQueriesParamsStandaloneOutputs<
  Context extends ContextConstraints
> = {
  [K in `setAll${Capitalize<
    (typeof STORE_CONFIG_TOKEN)['NAME']
  >}QueryParams`]: <
    AllQueriesParamsState extends {
      [K in keyof Context['_queryParams']]: 'state' extends keyof Context['_queryParams'][K]
        ? InferQueryParamsState<Context['_queryParams'][K]['state']>
        : 'STORE_CONFIG_ERROR: When using craftSetAllQueriesParamsStandalone, each query param configuration must define a state';
    }
  >(
    params: Prettify<AllQueriesParamsState>
  ) => AllQueriesParamsState;
};

type CraftSetAllQueriesParamsStandaloneOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  EmptyContext,
  SpecificCraftSetAllQueriesParamsStandaloneOutputs<Context>
>;

/**
 * Order matters: this function must be declared after `craftQueryParams` to ensure types are properly inferred.
 */
export function craftSetAllQueriesParamsStandalone<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
>(): CraftSetAllQueriesParamsStandaloneOutputs<Context, StoreConfig> {
  return () => {
    return partialContext({});
  };
}
