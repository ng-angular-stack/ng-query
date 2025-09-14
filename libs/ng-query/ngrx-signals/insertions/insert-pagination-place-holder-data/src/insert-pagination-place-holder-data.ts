import { computed } from '@angular/core';
import { InsertionByIdParams } from '@ng-query/ngrx-signals';
import { SignalStoreFeatureResult } from '@ngrx/signals';

export const insertPaginationPlaceholderData = <
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
  let previousPageKey: GroupIdentifier | undefined;
  const showPlaceHolderData = computed(() => {
    const page = resourceParamsSrc();
    const resources = resourceById();
    const pageKey = page ? identifier(page) : undefined;
    if (!pageKey) {
      return false;
    }
    const currentResource = resources[pageKey];
    // true if loading and previousPage is used
    if (
      currentResource?.status() === 'loading' &&
      !currentResource?.value() &&
      previousPageKey !== undefined &&
      resources[previousPageKey]
    ) {
      return true;
    }
    return false;
  });
  return {
    currentPageData: computed(() => {
      const page = resourceParamsSrc();
      const resources = resourceById();
      const pageKey = page ? identifier(page) : undefined;
      if (!pageKey) {
        return;
      }
      const currentResource = resources[pageKey];

      if (showPlaceHolderData()) {
        return resources[previousPageKey]?.hasValue()
          ? resources[previousPageKey]?.value()
          : undefined;
      }
      previousPageKey = pageKey;
      return currentResource?.value();
    }),
    currentPageStatus: computed(() => {
      const page = resourceParamsSrc();
      const resources = resourceById();
      if (!page) {
        return 'idle' as const; // avoid to handle the undefined check
      }
      const pageKey = identifier(page);
      const currentResource = resources[pageKey];
      return currentResource?.status() ?? ('idle' as const);
    }),
    isPlaceHolderData: showPlaceHolderData,
  };
};
