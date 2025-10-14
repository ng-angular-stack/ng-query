import {
  Prettify,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  withProps,
} from '@ngrx/signals';

type FeatureOutputFromConfig<
  Input extends SignalStoreFeatureResult,
  Feature extends SignalStoreFeature
> = Feature extends SignalStoreFeature<infer ResultInput, infer ResultOutput>
  ? SignalStoreFeature<Input, ResultOutput>
  : never;

export function withServices<
  Context extends SignalStoreFeatureResult,
  const Store extends Prettify<
    StateSignals<Context['state']> & Context['props'] & Context['methods']
  >,
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
