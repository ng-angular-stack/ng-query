import { computed, WritableSignal } from '@angular/core';
import { ResourceByIdRef } from '../resource-by-id';

// todo add a complete test
// todo add an option for prefetching the next page ?
export const pagination = <
  Input,
  StoreInput,
  GroupIdentifier extends string | number,
  ResourceState,
  ResourceParams
>({
  resourceById,
  resourceParamsSrc,
}: {
  input: Input;
  store: StoreInput;
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
}) => {
  let previousPage: GroupIdentifier | undefined;
  const showPlaceHolderData = computed(() => {
    const page = resourceParamsSrc();
    const resources = resourceById();
    const pageKey = page as unknown as GroupIdentifier;
    const currentResource = resources[pageKey];
    // true if loading and previousPage is used
    if (
      currentResource?.status() === 'loading' &&
      previousPage !== undefined &&
      resources[previousPage]
    ) {
      return true;
    }
    return false;
  });
  return {
    pagination: {
      currentPage: computed(() => {
        const page = resourceParamsSrc();
        const resources = resourceById();
        const pageKey = page as unknown as GroupIdentifier;
        const currentResource = resources[pageKey];
        if (showPlaceHolderData()) {
          return resources[previousPage]?.value();
        }
        previousPage = page as unknown as GroupIdentifier;
        return currentResource?.value();
      }),
      isPlaceHolderData: showPlaceHolderData,
    },
  };
};
