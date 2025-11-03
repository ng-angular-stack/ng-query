import { signal } from '@angular/core';
import { MutationRef } from '../with-mutation';
import { ResourceWithParamsOrParamsFn } from '../types/resource-with-params-or-params-fn.type';
import { InsertionsFactory } from '../core/query.core';
import { AsyncMethodRef } from './using-async-methods';
import { ResourceMethod } from '../types/shared.type';

// todo return resourceById if identifier is added

type AsyncMethodOutput<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertions
> = {
  mutationRef: MutationRef<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    Insertions
  >;
  resource: AsyncMethodRef<MutationState, MutationParams>;
  method: ResourceMethod<MutationArgsParams, MutationParams> | undefined;
  insertionsOutputs: Insertions;
};

export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >
): AsyncMethodOutput<MutationState, MutationParams, MutationArgsParams, {}>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1 & Insertion2
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2,
  Insertion3
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1 & Insertion2 & Insertion3
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function asyncMethod<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6,
  Insertion7
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
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
  MutationArgsParams
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >,
  ...insertions: any[]
): AsyncMethodOutput<MutationState, MutationParams, MutationArgsParams, {}> {
  const mutationResourceParamsFnSignal = signal<MutationParams | undefined>(
    undefined
  );

  const resourceParamsSrc =
    mutationConfig.params ?? mutationResourceParamsFnSignal;

  const mutationResource = resource<MutationState, MutationParams>({
    ...mutationConfig,
    params: resourceParamsSrc,
  } as ResourceOptions<any, any>);

  return {
    resource: mutationResource,
    method: mutationConfig.method,
    insertionsOutputs: (
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
    }, {} as Record<string, unknown>),
  };
}
