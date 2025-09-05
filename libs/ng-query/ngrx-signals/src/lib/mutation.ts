import { SignalStoreFeatureResult } from '@ngrx/signals';
import { ResourceWithParamsOrParamsFn } from './types/resource-with-params-or-params-fn.type';
import { InternalType } from './types/util.type';
import {
  resource,
  ResourceOptions,
  ResourceRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { MutationRef } from './with-mutation';
import { PublicSignalStore } from './types/shared.type';
import { InsertionsFactory } from './core/query.core';

type MutationOutput<
  StoreInput extends PublicSignalStore<Input>,
  Input extends SignalStoreFeatureResult,
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Insertions
> = (
  store: StoreInput,
  context: Input
) => {
  mutationRef: MutationRef<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    Insertions
  >;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    false
  >;
};

export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertion1
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertion1,
  Insertion2
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >,
  insertion1: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
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
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion1
  >,
  insertion2: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >,
  insertion7: InsertionsFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    Insertion7,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
  >
): MutationOutput<
  StoreInput,
  Input,
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
export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >,
  ...insertions: any[]
): MutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
> {
  const mutationResourceParamsFnSignal = signal<MutationParams | undefined>(
    undefined
  );

  const resourceParamsSrc =
    mutationConfig.params ?? mutationResourceParamsFnSignal;

  const mutationResource = resource<MutationState, MutationParams>({
    ...mutationConfig,
    params: resourceParamsSrc,
  } as ResourceOptions<any, any>);

  return (store, context) => ({
    mutationRef: {
      resource: mutationResource,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        MutationParams | undefined
      >,
      method: mutationConfig.method,
      insertionsOutputs: (
        insertions as InsertionsFactory<
          NoInfer<Input>,
          NoInfer<StoreInput>,
          NoInfer<MutationState>,
          NoInfer<MutationParams>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
            input: context,
            store,
            resource: mutationResource as ResourceRef<MutationState>,
            resourceParams: resourceParamsSrc as WritableSignal<
              NoInfer<MutationParams>
            >,
            insertions: acc as {},
          }),
        };
      }, {} as Record<string, unknown>),
    },
    __types: {} as InternalType<
      NoInfer<MutationState>,
      NoInfer<MutationParams>,
      NoInfer<MutationArgsParams>,
      false
    >,
  });
}
