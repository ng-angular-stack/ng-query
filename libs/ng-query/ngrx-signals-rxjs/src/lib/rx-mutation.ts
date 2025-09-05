import { SignalStoreFeatureResult } from '@ngrx/signals';
import { RxResourceWithParamsOrParamsFn } from './types/rx-resource-with-params-or-params-fn.type';
import {
  InsertionsFactory,
  InternalType,
  PublicSignalStore,
} from '@ng-query/ngrx-signals';
import { ResourceRef, signal, WritableSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MutationRef } from '@ng-query/ngrx-signals';

type RxMutationOutput<
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

export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
>;
export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertion1
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1
>;
export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertion1,
  Insertion2
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2
>;
export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertion1,
  Insertion2,
  Insertion3
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3
>;
export function rxMutation<
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
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4
>;
export function rxMutation<
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
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function rxMutation<
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
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function rxMutation<
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
  mutationConfig: RxResourceWithParamsOrParamsFn<
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
): RxMutationOutput<
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
export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >,
  ...insertions: any[]
): RxMutationOutput<
  StoreInput,
  Input,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
> {
  const src$ = mutationConfig.params$;
  const src$ToSignal = src$ ? toSignal(src$) : undefined;
  const mutationResourceParamsFnSignal = signal<MutationParams | undefined>(
    undefined
  );

  const resourceParamsSrc =
    src$ToSignal ?? mutationConfig.params ?? mutationResourceParamsFnSignal;

  const mutationResource = rxResource<MutationState, MutationParams>({
    ...mutationConfig,
    params: resourceParamsSrc,
  } as any);

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
