import { effect } from '@angular/core';
import { InsertionByIdParams } from '@ng-query/ngrx-signals';
import { SignalStoreFeatureResult } from '@ngrx/signals';

export const insertPrefectData = <
  Input extends SignalStoreFeatureResult,
  StoreInput,
  GroupIdentifier extends string | number,
  ResourceState extends object | undefined,
  ResourceParams,
  PreviousInsertionsOutputs
>({
  resourceById,
  resourceParamsSrc,
  identifier,
}: InsertionByIdParams<
  Input,
  StoreInput,
  GroupIdentifier,
  ResourceState,
  ResourceParams,
  PreviousInsertionsOutputs
>) => {
  effect(() => {
    const paramsValue = resourceParamsSrc();
    if (!paramsValue) {
      return;
    }
    const isCurrentPageLoading =
      resourceById()[identifier(resourceParamsSrc())]?.status();
  });
  return {};
};
