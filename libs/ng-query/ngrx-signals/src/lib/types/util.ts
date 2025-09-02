import { effect, EffectRef, InjectionToken, Injector } from '@angular/core';

export const DYNAMIC_EFFECT_REF_INSTANCE_TOKEN = new InjectionToken<EffectRef>(
  'Injection token used to provide a dynamically created effectRef instance.'
);

export function nestedEffect<T, R, GroupIdentifier extends string | number>(
  parentInjector: Injector,
  effectCallBack: () => any
) {
  const injector = Injector.create({
    providers: [
      {
        provide: DYNAMIC_EFFECT_REF_INSTANCE_TOKEN,
        useFactory: () => {
          return effect(effectCallBack, {
            injector: parentInjector,
          });
        },
      },
    ],
    parent: parentInjector,
  });
  const effectRef = injector.get(DYNAMIC_EFFECT_REF_INSTANCE_TOKEN);
  return effectRef;
}
