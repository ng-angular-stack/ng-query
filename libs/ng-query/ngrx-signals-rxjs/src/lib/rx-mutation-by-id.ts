import { SignalStoreFeatureResult } from '@ngrx/signals';
import {
  InsertionsByIdFactory,
  InternalType,
  PublicSignalStore,
} from '@ng-query/ngrx-signals';
import { MutationByIdRef } from '@ng-query/ngrx-signals';
import { signal, WritableSignal } from '@angular/core';
import { RxResourceByIdConfig } from './types/rx-resource-by-id-config.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResourceById } from './rx-resource-by-id';

type RxMutationByIdOutput<
  StoreInput extends PublicSignalStore<Input>,
  Input extends SignalStoreFeatureResult,
  MutationGroupIdentifier extends string | number,
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  InsertionsOutput
> = (
  store: StoreInput,
  context: Input
) => {
  mutationByIdRef: MutationByIdRef<
    NoInfer<MutationGroupIdentifier>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    InsertionsOutput
  >;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    true,
    NoInfer<MutationGroupIdentifier>
  >;
};

export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2,
  Insertions3
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2,
  Insertions3,
  Insertions4
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3 & Insertions4
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2,
  Insertions3,
  Insertions4,
  Insertions5
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2,
  Insertions3,
  Insertions4,
  Insertions5,
  Insertions6
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >,
  insertions6: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions6,
    Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 &
    Insertions2 &
    Insertions3 &
    Insertions4 &
    Insertions5 &
    Insertions6
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2,
  Insertions3,
  Insertions4,
  Insertions5,
  Insertions6,
  Insertions7
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >,
  insertions6: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions6,
    Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
  >,
  insertions7: InsertionsByIdFactory<
    NoInfer<Input>,
    NoInfer<StoreInput>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions7,
    Insertions1 &
      Insertions2 &
      Insertions3 &
      Insertions4 &
      Insertions5 &
      Insertions6
  >
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 &
    Insertions2 &
    Insertions3 &
    Insertions4 &
    Insertions5 &
    Insertions6 &
    Insertions7
>;
export function rxMutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  ...insertions: any[]
): RxMutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
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

  const mutationResourcesById = rxResourceById<
    MutationState,
    MutationParams,
    MutationGroupIdentifier
  >({
    ...mutationConfig,
    //@ts-expect-error TS wrong infer
    params: resourceParamsSrc,
    equalParams: mutationConfig.equalParams ?? 'default',
  });
  return (store, context) => ({
    mutationByIdRef: {
      resourceById: mutationResourcesById,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        MutationParams | undefined
      >,
      method: mutationConfig.method,
      insertionsOutputs: (
        insertions as InsertionsByIdFactory<
          NoInfer<Input>,
          NoInfer<StoreInput>,
          NoInfer<MutationState>,
          NoInfer<MutationParams>,
          NoInfer<MutationGroupIdentifier>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
            input: context,
            store,
            resourceById: mutationResourcesById,
            resourceParamsSrc: resourceParamsSrc as WritableSignal<
              NoInfer<MutationParams> | undefined
            >,
            insertions: acc as {},
            identifier: mutationConfig.identifier,
          }),
        };
      }, {} as Record<string, unknown>),
    },
    __types: {} as InternalType<
      NoInfer<MutationState>,
      NoInfer<MutationParams>,
      NoInfer<MutationArgsParams>,
      true,
      NoInfer<MutationGroupIdentifier>
    >,
  });
}
