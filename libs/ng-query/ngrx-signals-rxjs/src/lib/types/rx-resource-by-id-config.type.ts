import { RxResourceWithParamsOrParamsFn } from './rx-resource-with-params-or-params-fn.type';

export type RxResourceByIdConfig<
  ResourceState,
  Params,
  ParamsArgs,
  GroupIdentifier extends string | number
> = RxResourceWithParamsOrParamsFn<ResourceState, Params, ParamsArgs> & {
  identifier: (params: NoInfer<NonNullable<Params>>) => GroupIdentifier;
  /**
   * Under the hood, a resource is generated for each new identifier generated when the params source change.
   *
   * If the source change, and their is an existing resource with the same identifier, it will be re-used.
   *
   * In this case, when the source is an object, an existing resource can be retrieved by the matching his record key with identifier function, but as the reference change it will trigger the loading of the resource again.
   *
   * To avoid this, you can use this option to tell how to compare the incoming params with the existing params of the resource.
   * - 'useIdentifier': will use the identifier function to compare the previous params and the incoming params. This very useful when using pagination.
   * - 'default' (default value): will use a strict equality check (===) between the previous params and the incoming params.
   * - (a: Params, b: Params) => boolean: you can provide your own comparison function to compare the previous params and the incoming params. This is useful when you want to compare specific fields of the params.
   *
   * Note: if your params is a primitive (string, number, boolean, etc.), you don't need to use this option since the strict equality check will work as expected.
   *
   * For **queries** the default value is 'useIdentifier'
   *
   * For **mutations** the default value is 'default'
   */
  equalParams?: Params extends object
    ?
        | 'default'
        | 'useIdentifier'
        | ((
            a: Params,
            b: Params,
            identifierFn: (params: Params) => GroupIdentifier
          ) => boolean)
    : never;
};
