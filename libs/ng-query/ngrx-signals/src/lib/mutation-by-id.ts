import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
  WritableStateSource,
} from '@ngrx/signals';
import { ResourceByIdConfig } from './types/resource-by-id-config.type';
import { InternalType } from './types/util.type';
import { MutationByIdRef } from './with-mutation-by-id';
import { signal, WritableSignal } from '@angular/core';
import { resourceById } from './resource-by-id-signal-store';

export function mutationById<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  MutationGroupIdentifier extends string | number,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> &
      Input['props'] &
      Input['methods'] &
      WritableStateSource<Prettify<Input['state']>>
  >
>(
  mutationConfig: ResourceByIdConfig<
    MutationState,
    MutationParams,
    MutationArgsParams,
    MutationGroupIdentifier
  >
): (
  store: StoreInput,
  context: Input
) => {
  mutationByIdRef: MutationByIdRef<
    NoInfer<MutationGroupIdentifier>,
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>
  >;
  /**
   * Only used to help type inference, not used in the actual implementation.
   */
  __types: InternalType<
    NoInfer<MutationState>,
    NoInfer<MutationParams>,
    NoInfer<MutationArgsParams>,
    false,
    NoInfer<MutationGroupIdentifier>
  >;
} {
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
    },
    __types: {} as InternalType<
      NoInfer<MutationState>,
      NoInfer<MutationParams>,
      NoInfer<MutationArgsParams>,
      false,
      NoInfer<MutationGroupIdentifier>
    >,
  });
}
