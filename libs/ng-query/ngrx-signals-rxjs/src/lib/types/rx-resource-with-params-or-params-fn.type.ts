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
            /**
             * Each the query load, the value will return undefined.
             * To avoid flickering display and also enable to the data to be retrieved from cache, use () => true
             * default value: false
             */
            preservePreviousValue?: () => boolean;
          }
        | {
            method: ResourceMethod<ParamsArgs, Params>;
            loader?: never;
            params?: never;
            params$?: never;
            stream: (
              params: ResourceLoaderParams<NoInfer<Params>>
            ) => Observable<ResourceState>;
            /**
             * Each the query load, the value will return undefined.
             * To avoid flickering display and also enable to the data to be retrieved from cache, use () => true
             * default value: false
             */
            preservePreviousValue?: () => boolean;
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
            /**
             * Each the query load, the value will return undefined.
             * To avoid flickering display and also enable to the data to be retrieved from cache, use () => true
             * default value: false
             */
            preservePreviousValue?: () => boolean;
          }
      );
