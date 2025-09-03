// import { computed } from '@angular/core';

// export const pagination = extensionMaker(({ resourceById }) => ({
//   data: {
//     currentPage: computed(() => resourceById()['1']?.value()),
//   },
// }));

import { computed, ResourceRef, WritableSignal } from '@angular/core';
import { ResourceByIdRef } from '../resource-by-id';

export const pagination = <
  Input,
  StoreInput,
  GroupIdentifier extends string | number,
  ResourceState,
  ResourceParams
>({
  resourceById,
}: {
  input: Input;
  store: StoreInput;
  resourceById: ResourceByIdRef<GroupIdentifier, ResourceState>;
  resourceParamsSrc: WritableSignal<ResourceParams | undefined>;
}) => {
  return {
    pagination: {
      currentPage: computed(() =>
        resourceById()[
          '1' as keyof Partial<
            Record<GroupIdentifier, ResourceRef<ResourceState>>
          >
        ]?.value()
      ),
    },
  };
};
