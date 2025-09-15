import { effect, ResourceRef, Signal, signal } from '@angular/core';
import { InsertionByIdParams } from '@ng-query/ngrx-signals';
import { SignalStoreFeatureResult } from '@ngrx/signals';

export function insertPrefetchNextData<
  Input extends SignalStoreFeatureResult,
  StoreInput,
  GroupIdentifier extends string | number,
  ResourceState extends object | undefined,
  ResourceParams,
  PreviousInsertionsOutputs
>(
  entries: (
    data: InsertionByIdParams<
      Input,
      StoreInput,
      GroupIdentifier,
      ResourceState,
      ResourceParams,
      PreviousInsertionsOutputs
    >
  ) => {
    hasNextData: Signal<boolean>;
    nextParams: () => NoInfer<ResourceParams> | undefined;
  }
) {
  return (
    context: InsertionByIdParams<
      Input,
      StoreInput,
      GroupIdentifier,
      ResourceState,
      ResourceParams,
      PreviousInsertionsOutputs
    >
  ) => {
    const { resourceById, identifier, resourceParamsSrc } = context;
    const nextResource = signal<ResourceRef<ResourceState> | undefined>(
      undefined
    );
    const { hasNextData, nextParams } = entries(context);
    effect(() => {
      const currentParams = resourceParamsSrc();
      if (!currentParams) {
        return;
      }
      const currentResource = resourceById()[identifier(currentParams)];
      if (!hasNextData()) {
        nextResource.set(undefined);
        return;
      }
      const isCurrentResourceResolved =
        currentResource?.status() === 'resolved' || 'local';
      if (!isCurrentResourceResolved) {
        return;
      }
      const nextDataParams = nextParams();
      const nextResourceId = nextDataParams
        ? identifier(nextDataParams)
        : undefined;
      if (!nextDataParams || !nextResourceId) {
        nextResource.set(undefined);
        return;
      }
      const hasNextDataValue = !!resourceById()[nextResourceId];
      if (hasNextDataValue) {
        nextResource.set(resourceById()[nextResourceId]);
        return;
      }
      resourceById.add(nextDataParams);
      nextResource.set(resourceById()[nextResourceId]);
    });
    return {
      nextResource: nextResource.asReadonly(),
    };
  };
}
