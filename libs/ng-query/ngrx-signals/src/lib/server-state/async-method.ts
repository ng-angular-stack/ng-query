import {
  computed,
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
import { ReadonlySource } from './util/source.type';
import { resourceById, ResourceByIdRef } from '../resource-by-id';

//todo rename mutation to asyncMethod everywhere
type AsyncMethodConfig<
  ResourceState,
  Params,
  ParamsArgs,
  SourceParams,
  GroupIdentifier
> =
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
            /**
             * A unique identifier for the resource, derived from the params.
             * It should be a string that uniquely identifies the resource based on the params.
             */
            identifier?: (
              params: NoInfer<NonNullable<Params>>
            ) => GroupIdentifier;
            loader: (
              param: ResourceLoaderParams<
                NonNullable<
                  [unknown] extends [Params]
                    ? NoInfer<SourceParams>
                    : NoInfer<Params>
                >
              >
            ) => Promise<ResourceState>;
            stream?: never;
            preservePreviousValue?: () => boolean;
          }
        | {
            method:
              | ((args: ParamsArgs) => Params)
              | ReadonlySource<SourceParams>;
            loader?: never;
            identifier?: (
              params: NoInfer<NonNullable<Params>>
            ) => GroupIdentifier;
            /**
             * Loading function which returns a `Promise` of a signal of the resource's value for a given
             * request, which can change over time as new values are received from a stream.
             */
            stream: ResourceStreamingLoader<
              ResourceState,
              ResourceLoaderParams<
                NonNullable<
                  [unknown] extends [Params]
                    ? NoInfer<SourceParams>
                    : NoInfer<Params>
                >
              >
            >;
            preservePreviousValue?: () => boolean;
          }
      );

export type AsyncMethodOutput<
  State extends object | undefined,
  ArgParams,
  Params,
  SourceParams,
  GroupIdentifier,
  Insertions
> = AsyncMethodRef<
  State,
  ArgParams,
  Params,
  Insertions,
  [unknown] extends [Params] ? false : true,
  SourceParams,
  GroupIdentifier
>;

export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
  >
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  {}
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  Insertion1
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  Insertion1,
  Insertion2
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1 & Insertion2
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  Insertion1,
  Insertion2,
  Insertion3
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1 & Insertion2 & Insertion3
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
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
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
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
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
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
    SourceParams,
    GroupIdentifier
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
  GroupIdentifier,
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
  SourceParams,
  GroupIdentifier
>(
  mutationConfig: AsyncMethodConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    SourceParams,
    GroupIdentifier
  >,
  ...insertions: any[]
): AsyncMethodOutput<
  MutationState,
  MutationParams,
  MutationArgsParams,
  SourceParams,
  GroupIdentifier,
  {}
> {
  const mutationResourceParamsFnSignal = signal<MutationParams | undefined>(
    undefined
  );

  const isConnectedToSource = isSignal(mutationConfig.method);
  const isUsingIdentifier = 'identifier' in mutationConfig;

  const resourceParamsSrc = isConnectedToSource
    ? mutationConfig.method
    : mutationResourceParamsFnSignal;

  const resourceTarget = isUsingIdentifier
    ? resourceById<MutationState, MutationParams, GroupIdentifier & string>({
        ...mutationConfig,
        params: resourceParamsSrc,
        identifier: mutationConfig.identifier,
      } as any)
    : resource<MutationState, MutationParams>({
        ...mutationConfig,
        params: resourceParamsSrc,
      } as ResourceOptions<any, any>);

  return Object.assign(
    resourceTarget,
    // byId is used to helps TS to correctly infer the resourceByGroup
    isUsingIdentifier
      ? {
          select: (id: GroupIdentifier) => {
            return computed(() => {
              const list = (
                resourceTarget as ResourceByIdRef<
                  GroupIdentifier & string,
                  MutationState,
                  MutationParams
                >
              )();
              //@ts-expect-error GroupIdentifier & string is not recognized correctly
              return list[id];
            })();
          },
        }
      : {},
    {
      method: isSignal(mutationConfig.method)
        ? undefined
        : (arg: MutationArgsParams) => {
            const result = mutationConfig.method(arg);
            if (isUsingIdentifier) {
              const id = mutationConfig.identifier?.(arg as any);
              (
                resourceTarget as ResourceByIdRef<
                  GroupIdentifier & string,
                  MutationState,
                  MutationParams
                >
              ).addById(id as GroupIdentifier & string);
            }
            mutationResourceParamsFnSignal.set(result as MutationParams);
            return result;
          },
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
          resource: resourceTarget as ResourceRef<MutationState>,
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
    GroupIdentifier,
    {}
  >;
}
