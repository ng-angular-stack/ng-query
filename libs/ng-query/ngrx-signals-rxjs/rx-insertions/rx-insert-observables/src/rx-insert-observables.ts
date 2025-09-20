import {
  effect,
  inject,
  Injector,
  linkedSignal,
  ResourceStatus,
} from '@angular/core';
import {
  InsertionByIdParams,
  InsertionParams,
  nestedEffect,
  ResourceByIdRef,
} from '@ng-query/ngrx-signals';
import { SignalStoreFeatureResult } from '@ngrx/signals';
import { Observable, ObservedValueOf, Subject } from 'rxjs';

export const rxInsertObservables = <
  Input extends SignalStoreFeatureResult,
  StoreInput,
  ResourceState extends object | undefined,
  ResourceParams,
  GroupIdentifier extends string | number,
  PreviousInsertionsOutputs = {}
>(
  data:
    | InsertionByIdParams<
        Input,
        StoreInput,
        GroupIdentifier,
        ResourceState,
        ResourceParams,
        PreviousInsertionsOutputs
      >
    | InsertionParams<
        Input,
        StoreInput,
        ResourceState,
        ResourceParams,
        PreviousInsertionsOutputs
      >
): {
  data$: Observable<
    string | number extends GroupIdentifier
      ? {
          value: ResourceState | undefined;
          status: ResourceStatus;
          error: unknown | undefined;
        }
      : {
          id: GroupIdentifier;
          value: ResourceState | undefined;
          status: ResourceStatus;
          error: unknown | undefined;
        }
  >;
} => {
  if ('resourceById' in data) {
    const resourceWithIdValue$ = new Subject<{
      id: GroupIdentifier;
      value: ResourceState | undefined;
      status: ResourceStatus;
      error: unknown | undefined;
    }>();
    const { resourceById } = data;
    const newResourceRefForNestedEffect = linkedSignal<
      ResourceByIdRef<GroupIdentifier, ResourceState, ResourceParams>,
      { newKeys: GroupIdentifier[] } | undefined
    >({
      source: resourceById as any,
      computation: (currentSource, previous) => {
        if (!currentSource || !Object.keys(currentSource).length) {
          return undefined;
        }

        const currentKeys = Object.keys(currentSource) as GroupIdentifier[];
        const previousKeys = Object.keys(
          previous?.source || {}
        ) as GroupIdentifier[];

        // Find keys that exist in current but not in previous
        const newKeys = currentKeys.filter(
          (key) => !previousKeys.includes(key)
        );

        return newKeys.length > 0 ? { newKeys } : previous?.value;
      },
    });
    const _injector = inject(Injector);
    effect(() => {
      if (!newResourceRefForNestedEffect()?.newKeys) {
        return;
      }
      newResourceRefForNestedEffect()?.newKeys.forEach((incomingIdentifier) => {
        nestedEffect(_injector, () => {
          const resourceData = resourceById()[incomingIdentifier];

          if (!resourceData) {
            return;
          }

          resourceWithIdValue$.next({
            id: incomingIdentifier,
            value: resourceData.hasValue() ? resourceData.value() : undefined,
            status: resourceData.status(),
            error: resourceData.error(),
          } as ObservedValueOf<typeof resourceWithIdValue$>);
        });
      });
    });
    return {
      data$: resourceWithIdValue$.asObservable(),
    };
  } else {
    const { resource } = data;
    const resourceValue$ = new Subject<{
      value: ResourceState | undefined;
      status: ResourceStatus;
      error: unknown | undefined;
    }>();
    effect(() => {
      resourceValue$.next({
        value: resource.hasValue() ? resource.value() : undefined,
        status: resource.status(),
        error: resource.error(),
      } as ObservedValueOf<typeof resourceValue$>);
    });
    return {
      //@ts-expect-error since the discrimination id based on the GroupIdentifier, TS can not known that is the correct type here
      data$: resourceValue$.asObservable(),
    };
  }
};
