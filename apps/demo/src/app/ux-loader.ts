import {
  signal,
  computed,
  effect,
  Signal,
  inject,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// inspired by https://github.com/smeijer/spin-delay

interface SpinDelayOptions {
  /**
   * The delay in milliseconds before the spinner is displayed.
   * @default 500
   */
  delay?: number;
  /**
   * The minimum duration in milliseconds the spinner is displayed.
   * @default 200
   */
  minDuration?: number;
  /**
   * Whether to enable the spinner on the server side. If true, `delay` will be
   * ignored, and the spinner will be shown immediately if `loading` is true.
   * @default true
   */
  ssr?: boolean;
}

type State = 'IDLE' | 'DELAY' | 'DISPLAY' | 'EXPIRE';

export const defaultOptions = {
  delay: 500,
  minDuration: 200,
  ssr: true,
};

function createIsSSRSignal() {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const isSSR = signal(!isBrowser);

  if (isBrowser) {
    // On client side, immediately set to false
    isSSR.set(false);
  }

  return isSSR.asReadonly();
}

export function uxLoader(
  loadingSignal: Signal<boolean>,
  options?: SpinDelayOptions
): Signal<boolean> {
  const destroyRef = inject(DestroyRef);
  options = Object.assign({}, defaultOptions, options);

  const isSSR = createIsSSRSignal();
  const loading = computed(() => loadingSignal());

  const initialState = computed(() =>
    isSSR() && options?.ssr && loading() ? 'DISPLAY' : 'IDLE'
  );

  const state = signal<State>(initialState());
  let timeout: number | null = null;

  // Effect to handle loading state changes
  effect(() => {
    const currentLoading = loading();
    const currentState = state();
    const currentIsSSR = isSSR();

    if (currentLoading && (currentState === 'IDLE' || currentIsSSR)) {
      if (timeout !== null) {
        clearTimeout(timeout);
      }

      const delay = currentIsSSR ? 0 : options?.delay ?? defaultOptions.delay;
      timeout = setTimeout(() => {
        if (!loadingSignal()) {
          return state.set('IDLE');
        }

        timeout = setTimeout(() => {
          state.set('EXPIRE');
        }, options?.minDuration ?? defaultOptions.minDuration);

        state.set('DISPLAY');
      }, delay) as unknown as number;

      if (!currentIsSSR) {
        state.set('DELAY');
      }
    }

    if (!currentLoading && currentState !== 'DISPLAY') {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      state.set('IDLE');
    }
  });

  // Cleanup effect
  destroyRef.onDestroy(() => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
  });

  return computed(() => {
    const currentState = state();
    return currentState === 'DISPLAY' || currentState === 'EXPIRE';
  });
}
