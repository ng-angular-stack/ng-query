import {
  Prettify,
  SignalStoreFeatureResult,
  StateSignals,
  WritableStateSource,
} from '@ngrx/signals';
import { InternalType } from '../../../ngrx-signals/src/lib/types/util.type';
import { MutationByIdRef } from '../../../ngrx-signals/src/lib/with-mutation-by-id';
import { signal, WritableSignal } from '@angular/core';
import { rxResourceById } from '../rx-resource-by-id';
import { RxResourceByIdConfig } from '../../../ngrx-signals/src/lib/types/rx-resource-by-id-config.type';
import { toSignal } from '@angular/core/rxjs-interop';

export function rxMutationById<
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
  mutationConfig: RxResourceByIdConfig<
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
