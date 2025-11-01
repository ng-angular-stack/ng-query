import { isSignal } from '@angular/core';

/**
 * Only checks if the value is a Signal
 * Works for Source and ReadonlySource
 */
export function isSource(value: any): boolean {
  return isSignal(value);
}
