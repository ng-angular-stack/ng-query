import { SignalStoreFeatureResult } from '@ngrx/signals';
import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { MutationByIdRef } from './with-mutation-by-id';
import { signal, WritableSignal } from '@angular/core';
import { resourceById } from './resource-by-id';
import { PublicSignalStore } from './types/shared.type';
import { InsertionsByIdFactory } from './core/query.core';

type MutationByIdOutput<
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

export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  {}
>;
export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1
>(
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1
>;
export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>,
  Insertions1,
  Insertions2
>(
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2
>;
export function mutationById<
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
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3
>;
export function mutationById<
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
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3 & Insertions4
>;
export function mutationById<
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
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
  MutationState,
  MutationParams,
  MutationArgsParams,
  Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
>;
export function mutationById<
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
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
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
export function mutationById<
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
  mutationConfig: ResourceByIdConfig<
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
): MutationByIdOutput<
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
export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends PublicSignalStore<Input>
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  ...insertions: any[]
): MutationByIdOutput<
  StoreInput,
  Input,
  MutationGroupIdentifier,
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

  const mutationResourcesById = resourceById<
    MutationState,
    MutationParams,
    MutationGroupIdentifier
  >({
    ...mutationConfig,
    params: resourceParamsSrc,
  } as any);
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
