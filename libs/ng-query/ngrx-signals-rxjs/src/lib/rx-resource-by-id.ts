import {
  inject,
  signal,
  ResourceOptions,
  ResourceRef,
  Signal,
  effect,
  untracked,
  Injector,
  InjectionToken,
  linkedSignal,
  WritableSignal,
} from '@angular/core';
import { RxResourceOptions } from '@angular/core/rxjs-interop';
import { preservedRxResource } from './signal-store-with-server-state/preserved-rx-resource';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type RxResourceByIdRef<
  GroupIdentifier extends string | number,
  State
> = WritableSignal<
  Prettify<Partial<Record<GroupIdentifier, ResourceRef<State>>>>
>;

export function rxResourceById<T, R, GroupIdentifier extends string | number>({
  identifier,
  params,
  stream,
}: Omit<RxResourceOptions<T, R>, 'params'> & {
  params: () => R; // must be a mandatory field
  identifier: (request: NonNullable<NoInfer<R>>) => GroupIdentifier;
}): RxResourceByIdRef<GroupIdentifier, T> {
  const injector = inject(Injector);

  // maybe create a linkedSignal to enable to reset
  const resourceByGroup = signal<
    Partial<Record<GroupIdentifier, ResourceRef<T>>>
  >({});

  // this effect is used to create a mapped ResourceRef instance
  effect(() => {
    const requestValue = params();
    if (!requestValue) {
      return;
    }
    const group = identifier(requestValue);

    // The effect should only trigger when the request change
    const resourceByGroupValue = untracked(() => resourceByGroup());
    const groupResourceRefExist = resourceByGroupValue[group];
    if (groupResourceRefExist) {
      // nothing to do, the resource is already bind with the request
      return;
    }

    const filteredRequestByGroup = linkedSignal({
      source: params,
      computation: (incomingRequestValue, previousGroupRequestData) => {
        if (!incomingRequestValue) {
          return incomingRequestValue;
        }
        // filter the request push a value by comparing with the current group
        if (identifier(incomingRequestValue) !== group) {
          return previousGroupRequestData?.value;
        }
        // The request push a value that concerns the current group
        return incomingRequestValue;
      },
    });

    const resourceRef = createDynamicRxResource(injector, {
      group,
      resourceOptions: {
        stream,
        //@ts-ignore
        params: filteredRequestByGroup,
      },
    });

    // attach a new instance of ResourceRef to the resourceByGroup
    resourceByGroup.update((state) => ({
      ...state,
      [group]: resourceRef,
    }));
  });

  return resourceByGroup;
}

const RESOURCE_INSTANCE_TOKEN = new InjectionToken<ResourceRef<unknown>>(
  'Injection token used to provide a dynamically created ResourceRef instance.'
);

interface DynamicResourceConfig<T, R, GroupIdentifier extends string | number> {
  resourceOptions: RxResourceOptions<T, R>;
  group: GroupIdentifier;
}

/**
 * It is not possible to instantiate a resource from within an effect directly:
 * NG0602: effect() cannot be called from within a reactive context.
 *
 * The workaround is to create a dynamic injection token using a factory function,
 * which instantiates the resource using the provided configuration.
 *
 * Maybe their is a better way to instantiate a resource dynamically.
 */
function createDynamicRxResource<T, R, GroupIdentifier extends string | number>(
  parentInjector: Injector,
  resourceConfig: DynamicResourceConfig<T, R, GroupIdentifier>
) {
  const injector = Injector.create({
    providers: [
      {
        provide: RESOURCE_INSTANCE_TOKEN,
        useFactory: () => preservedRxResource(resourceConfig.resourceOptions),
      },
    ],
    parent: parentInjector,
  });

  const resourceRef = injector.get(RESOURCE_INSTANCE_TOKEN);
  return resourceRef as ResourceRef<T>;
}
