import {
  ContextConstraints,
  EmptyContext,
  ServerStateFactoryUtility,
  StoreConfigConstraints,
} from './server-state';
import { QueryParamConfig } from './using-query-params';

type SpecificCraftSetAllQueriesParamsStandaloneOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints
> = {
  [K in QueryParamsName as `set${Capitalize<K>}QueryParams`]: <
    T extends Partial<{
      [K in keyof QueryParams]: ReturnType<QueryParams[K]['parse']>;
    }>
  >(
    params: T
  ) => T;
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
