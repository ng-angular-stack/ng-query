import {
  SignalStoreFeatureResult,
  Prettify,
  StateSignals,
  WritableStateSource,
} from '@ngrx/signals';
import { ResourceWithParamsOrParamsFn } from './types/resource-with-params-or-params-fn.type';
import { InternalType } from './types/util.type';
import {
  resource,
  ResourceOptions,
  signal,
  WritableSignal,
} from '@angular/core';
import { MutationRef } from './with-mutation';

export function mutation<
  MutationState extends object | undefined,
  MutationParams,
  MutationArgsParams,
  Input extends SignalStoreFeatureResult,
  const StoreInput extends Prettify<
    StateSignals<Input['state']> &
      Input['props'] &
      Input['methods'] &
      WritableStateSource<Prettify<Input['state']>>
  >
>(
  mutationConfig: ResourceWithParamsOrParamsFn<
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
    },
    __types: {} as InternalType<
      NoInfer<MutationState>,
      NoInfer<MutationParams>,
      NoInfer<MutationArgsParams>,
      false
    >,
  });
}
