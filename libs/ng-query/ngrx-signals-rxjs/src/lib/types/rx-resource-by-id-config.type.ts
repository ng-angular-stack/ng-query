import { RxResourceWithParamsOrParamsFn } from './rx-resource-with-params-or-params-fn.type';

export type RxResourceByIdConfig<
  ResourceState,
  Params,
  ParamsArgs,
  GroupIdentifier extends string | number
> = RxResourceWithParamsOrParamsFn<ResourceState, Params, ParamsArgs> & {
  identifier: (params: NoInfer<NonNullable<Params>>) => GroupIdentifier;
};
