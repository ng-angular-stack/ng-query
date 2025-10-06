import { InsertionsByIdFactory, InternalType } from '@ng-query/ngrx-signals';
import { MutationByIdRef } from '@ng-query/ngrx-signals';
import { signal, WritableSignal } from '@angular/core';
import { RxResourceByIdConfig } from './types/rx-resource-by-id-config.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResourceById } from './rx-resource-by-id';

type RxMutationByIdOutput<
  MutationGroupIdentifier extends string,
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  InsertionsOutput
> = {
  mutationRef: MutationByIdRef<
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
  MutationGroupIdentifier extends string
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
  Insertions1
>(
  mutationConfig: RxResourceByIdConfig<
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string,
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
): RxMutationByIdOutput<
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
  MutationGroupIdentifier extends string
>(
  mutationConfig: RxResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >,
  ...insertions: any[]
): RxMutationByIdOutput<
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
