// faire en sorte d'avoir stated users
// pouvoir définir des asyncAction
// exporter les events des async actions
// faire d'abord la logique pour entities

import { ResourceStatus } from '@angular/core';
import { Prettify } from '@ngrx/signals';

type Merge<T, U> = T & U;

// todo improve this type
type StatedAction = {
  isLoading: boolean;
  isLoaded: boolean;
  error?: string;
};

export type ResourceStatusData = {
  status: ResourceStatus;
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error: Error | undefined;
};

export type ResourceData<State extends object | undefined> = {
  value: State;
  status: ResourceStatusData;
};

type ToGranularEntity<
  Entity extends object,
  ActionKeys extends string | number | symbol
> = Merge<
  Entity,
  {
    uiStatus?: Prettify<Record<ActionKeys, StatedAction>>;
  }
>;

// todo create globalAction, and granularAction ?
// optimistic update and minium loading time ?
