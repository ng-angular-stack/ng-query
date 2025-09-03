import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
} from '@ngrx/signals';
import { RxResourceWithParamsOrParamsFn } from './types/rx-resource-with-params-or-params-fn.type';
import { InternalType } from '@ng-query/ngrx-signals';
import { signal, WritableSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MutationRef } from '@ng-query/ngrx-signals';

export function rxMutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> & Input['props'] & Input['methods']
  >
>(
  mutationConfig: RxResourceWithParamsOrParamsFn<
    MutationState,
    MutationParams,
    MutationArgsParams
  >
): (
  store: StoreInput,
  context: Input
) => {
  mutationRef: MutationRef<
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
    false
  >;
} {
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
    },
    __types: {} as InternalType<
      NoInfer<MutationState>,
      NoInfer<MutationParams>,
      NoInfer<MutationArgsParams>,
      false
    >,
  });
}
