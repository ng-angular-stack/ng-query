import {
  isSignal,
  resource,
  ResourceLoaderParams,
  ResourceOptions,
  ResourceRef,
  ResourceStreamingLoader,
  signal,
  WritableSignal,
} from '@angular/core';
import { InsertionsFactory } from '../core/query.core';
import { AsyncMethodRef } from './using-async-methods';
import { ResourceMethod } from '../types/shared.type';
import { ReadonlySource } from './util/source.type';

// todo return resourceById if identifier is added

type AsyncMethodConfig<ResourceState, Params, ParamsArgs, SourceParams> =
  | Omit<ResourceOptions<NoInfer<ResourceState>, Params>, 'params' | 'loader'> &
      (
        | {
            /**
             * Used to generate a method in the store, when called will trigger the resource loader/stream.
             *
             * Only support one parameter which can be an object to pass multiple parameters.
             */
            method:
              | ((args: ParamsArgs) => Params)
              | ReadonlySource<SourceParams>;
            loader: (
              param: NoInfer<ResourceLoaderParams<Params>>
            ) => Promise<ResourceState>;
            params?: never;
            stream?: never;
            preservePreviousValue?: () => boolean;
          }
        | {
            method:
              | ResourceMethod<ParamsArgs, Params>
              | ReadonlySource<SourceParams>;
            loader?: never;
            params?: never;
            /**
             * Loading function which returns a `Promise` of a signal of the resource's value for a given
             * request, which can change over time as new values are received from a stream.
             */
            stream: ResourceStreamingLoader<ResourceState, Params>;
            preservePreviousValue?: () => boolean;
          }
      );

export type AsyncMethodOutput<
  State extends object | undefined,
  ArgParams,
  Params,
  SourceParams,
  Insertions
> = AsyncMethodRef<
  State,
  ArgParams,
  Params,
  Insertions,
  [unknown] extends [ArgParams] ? false : true,
  SourceParams
>;

export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  {}
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 & Insertion2
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2,
  Insertion3
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 & Insertion2 & Insertion3
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6,
  Insertion7
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >,
  insertion7: InsertionsFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion7,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  Insertion1 &
    Insertion2 &
    Insertion3 &
    Insertion4 &
    Insertion5 &
    Insertion6 &
    Insertion7
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams
  >,
  ...insertions: any[]
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  {}
> {
  const mutationResourceParamsFnSignal = signal<MutationParams | undefined>(
    undefined
  );

  const resourceParamsSrc = isSignal(mutationConfig.method)
    ? mutationConfig.method
    : mutationResourceParamsFnSignal;

  const mutationResource = resource<MutationState, MutationParams>({
    ...mutationConfig,
    params: resourceParamsSrc,
  } as ResourceOptions<any, any>);

  return Object.assign(
    mutationResource,
    {
      method: mutationConfig.method,
    },
    (
      insertions as InsertionsFactory<
        NoInfer<MutationState>,
        NoInfer<MutationParams>,
        {}
      >[]
    )?.reduce((acc, insert) => {
      return {
        ...acc,
        ...insert({
          resource: mutationResource as ResourceRef<MutationState>,
          resourceParams: resourceParamsSrc as WritableSignal<
            NoInfer<MutationParams>
          >,
          insertions: acc as {},
        }),
      };
    }, {} as Record<string, unknown>)
  ) as unknown as AsyncMethodOutput<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    {}
  >;
}
