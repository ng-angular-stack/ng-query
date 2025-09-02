import {
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withProps,
  withState,
} from '@ngrx/signals';
import { GetMatchedPaths, StoreInput } from '../../../with-feature/shared';
import { Signal } from '@angular/core';

type FeatureOutputFromConfig<
  Input extends SignalStoreFeatureResult,
  Feature extends SignalStoreFeature
> = Feature extends SignalStoreFeature<infer ResultInput, infer ResultOutput>
  ? SignalStoreFeature<Input, ResultOutput>
  : never;

export function withServices<
  Context extends SignalStoreFeatureResult,
  Store extends StoreInput<Context>,
  // 👇 Create a highly customized based on Context/Store typing data
  Config extends Record<ConfigServicesKeys, ConfigServicesValues>,
  ConfigServicesKeys extends keyof Config,
  ConfigServicesValues extends Config[ConfigServicesKeys]
>(
  configFactory: () => Config
): FeatureOutputFromConfig<Context, typeof feature> {
  const feature = signalStoreFeature(withProps(() => configFactory()));
  return feature;
}
