import { Signal } from '@angular/core';
import { StateSignals, WritableStateSource } from '@ngrx/signals';

export type MethodsDictionary = Record<string, Function>;

export type SignalsDictionary = Record<string, Signal<unknown>>;

export const STATE_SOURCE = Symbol('STATE_SOURCE');

export type SignalStoreHooks = {
  onInit?: () => void;
  onDestroy?: () => void;
};

export type InnerSignalStore<
  State extends object = object,
  Props extends object = object,
  Methods extends MethodsDictionary = MethodsDictionary
> = {
  stateSignals: StateSignals<State>;
  props: Props;
  methods: Methods;
  hooks: SignalStoreHooks;
} & WritableStateSource<State>;

export function assertUniqueStoreMembers(
  store: InnerSignalStore,
  newMemberKeys: Array<string | symbol>
): void {
  if (typeof ngDevMode === 'undefined' || !ngDevMode) {
    return;
  }

  const storeMembers = {
    ...store.stateSignals,
    ...store.props,
    ...store.methods,
  };
  const overriddenKeys = Reflect.ownKeys(storeMembers).filter((memberKey) =>
    newMemberKeys.includes(memberKey)
  );

  if (overriddenKeys.length > 0) {
    console.warn(
      '@ngrx/signals: SignalStore members cannot be overridden.',
      'Trying to override:',
      overriddenKeys.map((key) => String(key)).join(', ')
    );
  }
}
