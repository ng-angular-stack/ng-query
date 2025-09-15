import { effect, ResourceRef, signal, Signal } from '@angular/core';
import { DefaultInsertionByIdParams } from '@ng-query/ngrx-signals';
import { insertFactory } from '@ng-query/ngrx-signals/insertions/insertion-factory';
// todo type to handle generics
export const insertPrefetchData = insertFactory(
  (
    {
      hasNextData,
      nextParams,
    }: {
      hasNextData: Signal<boolean>;
      nextParams: () => any; // todo get the next params for auto prefetch instead of id
    },
    context
  ) => {
    const { resourceById, identifier, resourceParamsSrc } =
      context as DefaultInsertionByIdParams;

    const nextResource = signal<ResourceRef<{}> | undefined>(undefined);

    effect(() => {
      const currentResource =
        resourceById()[identifier(resourceParamsSrc() as {})];

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
      const nextResourceId = identifier(nextDataParams);

      console.log('resourceById 2-4', resourceById()['2-4']?.status());
      if (!nextResourceId) {
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
  }
);
