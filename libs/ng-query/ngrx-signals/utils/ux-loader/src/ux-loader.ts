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
   * @default 300
   */
  delay?: number;
  /**
   * The minimum duration in milliseconds the spinner is displayed.
   * @default 400
   */
  minDuration?: number;
  /**
   * Whether to enable the spinner on the server side. If true, `delay` will be
   * ignored, and the spinner will be shown immediately if `loading` is true.
   * @default true
   */
  ssr?: boolean;
}

type StatePhase = 'IDLE' | 'DELAY' | 'DISPLAY' | 'EXPIRE';

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

  const initialState = computed(() =>
    isSSR() && options?.ssr && loadingSignal() ? 'DISPLAY' : 'IDLE'
  );

  const statePhase = signal<StatePhase>(initialState());
  let timeoutDelay: ReturnType<typeof setTimeout> | null = null;
  let timeoutMinLoadingDuration: ReturnType<typeof setTimeout> | null = null;

  // Effect to handle loading state changes
  effect(() => {
    const currentLoading = loadingSignal();
    const currentStatePhase = statePhase();
    const currentIsSSR = isSSR();

    if (currentLoading && (currentStatePhase === 'IDLE' || currentIsSSR)) {
      if (timeoutDelay !== null) {
        clearTimeout(timeoutDelay);
      }
      if (timeoutMinLoadingDuration !== null) {
        clearTimeout(timeoutMinLoadingDuration);
      }

      const delay = currentIsSSR ? 0 : options?.delay ?? defaultOptions.delay;
      //@ts-expect-error setTimeout in Node return a Timeout object, not a number
      timeoutDelay = setTimeout(() => {
        if (!loadingSignal()) {
          return statePhase.set('IDLE');
        }

        timeoutMinLoadingDuration = setTimeout(() => {
          statePhase.set('EXPIRE');
        }, options?.minDuration ?? defaultOptions.minDuration);
        statePhase.set('DISPLAY');
      }, delay) as unknown as number;

      if (!currentIsSSR) {
        statePhase.set('DELAY');
      }
    }

    if (!currentLoading && currentStatePhase !== 'DISPLAY') {
      if (timeoutDelay !== null) {
        clearTimeout(timeoutDelay);
        timeoutDelay = null;
      }
      if (timeoutMinLoadingDuration !== null) {
        clearTimeout(timeoutMinLoadingDuration);
        timeoutMinLoadingDuration = null;
      }
      statePhase.set('IDLE');
    }
  });

  destroyRef.onDestroy(() => {
    if (timeoutDelay !== null) {
      clearTimeout(timeoutDelay);
    }

    if (timeoutMinLoadingDuration !== null) {
      clearTimeout(timeoutMinLoadingDuration);
    }
  });

  return computed(() => {
    const currentStatePhase = statePhase();
    return currentStatePhase === 'DISPLAY' || currentStatePhase === 'EXPIRE';
  });
}
