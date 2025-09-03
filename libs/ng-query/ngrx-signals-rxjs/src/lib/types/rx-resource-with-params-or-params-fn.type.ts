import { ResourceLoaderParams } from '@angular/core';
import { RxResourceOptions } from '@angular/core/rxjs-interop';
import { ResourceMethod } from '@ng-query/ngrx-signals';
import { Observable } from 'rxjs';

export type RxResourceWithParamsOrParamsFn<ResourceState, Params, ParamsArgs> =
  | Omit<
      RxResourceOptions<NoInfer<ResourceState>, Params>,
      'params' | 'stream'
    > &
      (
        | {
            method?: never;
            loader?: never;
            params$?: never;
            params?: () => Params;
            stream: (
              params: ResourceLoaderParams<NoInfer<Params>>
            ) => Observable<ResourceState>;
          }
        | {
            method: ResourceMethod<ParamsArgs, Params>;
            loader?: never;
            params?: never;
            params$?: never;
            stream: (
              params: ResourceLoaderParams<NoInfer<Params>>
            ) => Observable<ResourceState>;
          }
        | {
            method?: never;
            loader?: never;
            params?: never;
            /**
             * Will operate as a switchMap to cancel previous in-flight requests.
             */
            params$: Observable<Params>;
            stream: (
              params: ResourceLoaderParams<NoInfer<Params>>
            ) => Observable<ResourceState>;
          }
      );
