import { computed } from '@angular/core';
import { InsertionByIdParams } from '@ng-query/ngrx-signals';
import { SignalStoreFeatureResult } from '@ngrx/signals';
// todo create a Insertionconstraint to simplify the generics
// todo create an insertion to preserve the value when the resource is loading
// todo add a function to the signature to add has Next page / previous page state ?
// todo add an insertion or a function to add the method to go nextpage / previous page ?
// todo add comment on how to use it and what it does
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
        return;
      }
      const pageKey = identifier(page);
      const currentResource = resources[pageKey];
      return currentResource?.status();
    }),
    isPlaceHolderData: showPlaceHolderData,
  };
};
