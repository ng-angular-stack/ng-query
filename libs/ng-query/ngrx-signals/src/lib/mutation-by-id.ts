import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { MutationByIdRef } from './with-mutation-by-id';
import { signal, WritableSignal } from '@angular/core';
import { resourceById } from './resource-by-id';
import { InsertionsByIdFactory } from './core/query.core';

type MutationByIdOutput<
  MutationGroupIdentifier extends string,
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  InsertionsOutput
> = {
  mutationRef: MutationByIdRef<
    MutationGroupIdentifier,
    MutationState,
    MutationParams,
    MutationArgsParams,
    InsertionsOutput
  >;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    MutationState,
    MutationParams,
    MutationArgsParams,
    true,
    MutationGroupIdentifier
  >;
};

export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
  Insertions1
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  insertions1: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >,
  insertions6: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions6,
    Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
  >
): MutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions1
  >,
  insertions2: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions2,
    Insertions1
  >,
  insertions3: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions3,
    Insertions1 & Insertions2
  >,
  insertions4: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions4,
    Insertions1 & Insertions2 & Insertions3
  >,
  insertions5: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions5,
    Insertions1 & Insertions2 & Insertions3 & Insertions4
  >,
  insertions6: InsertionsByIdFactory<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationGroupIdentifier>,
    Insertions6,
    Insertions1 & Insertions2 & Insertions3 & Insertions4 & Insertions5
  >,
  insertions7: InsertionsByIdFactory<
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
  MutationGroupIdentifier extends string
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  ...insertions: any[]
): MutationByIdOutput<
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
    //@ts-expect-error TS wrong infer
    params: resourceParamsSrc,
    equalParams: mutationConfig.equalParams ?? 'default',
  });
  return {
    mutationRef: {
      resourceById: mutationResourcesById,
      resourceParamsSrc: resourceParamsSrc as WritableSignal<
        MutationParams | undefined
      >,
      method: mutationConfig.method,
      insertionsOutputs: (
        insertions as InsertionsByIdFactory<
          NoInfer<MutationState>,
          NoInfer<MutationParams>,
          NoInfer<MutationGroupIdentifier>,
          {}
        >[]
      )?.reduce((acc, insert) => {
        return {
          ...acc,
          ...insert({
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
  };
}
