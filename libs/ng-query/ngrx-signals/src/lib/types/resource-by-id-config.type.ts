import { ResourceWithParamsOrParamsFn } from './resource-with-params-or-params-fn.type';

export type ResourceByIdConfig<
  ResourceState,
  Params,
  ParamsArgs,
  GroupIdentifier extends string | number
> = ResourceWithParamsOrParamsFn<ResourceState, Params, ParamsArgs> & {
  identifier: (params: NoInfer<NonNullable<Params>>) => GroupIdentifier;
};
