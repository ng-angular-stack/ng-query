import { Signal } from '@angular/core';

export interface ReadonlySource<T> extends Signal<T | undefined> {
  preserveLastValue: Signal<T | undefined>;
}
