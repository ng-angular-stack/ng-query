import { Signal } from '@angular/core';

export type ReadonlySource<T> = Signal<T | undefined> & {
  preserveLastValue: Signal<T | undefined>;
};
