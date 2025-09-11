import {
  inject,
  resource,
  signal,
  ResourceOptions,
  ResourceRef,
  effect,
  untracked,
  Injector,
  InjectionToken,
  linkedSignal,
  WritableSignal,
  computed,
} from '@angular/core';
import { preservedResource } from './preserved-resource';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ResourceByIdHandler<
  GroupIdentifier extends string | number,
  State
> = {
  /**
   * Reset all the ResourceRef instance stored in the ResourceByIdRef
   */
  reset: () => void;
  /**
   * Reset the ResourceRef instance associated with the provided id
   */
  resetResource: (id: GroupIdentifier) => void;
  /**
   * Add a new ResourceRef instance
   */
  add: (
    id: GroupIdentifier,
    options?: {
      defaultValue?: State;
    }
  ) => void;
};

export type ResourceByIdRef<
  GroupIdentifier extends string | number,
  State
> = WritableSignal<
  Prettify<Partial<Record<GroupIdentifier, ResourceRef<State>>>>
> &
  ResourceByIdHandler<GroupIdentifier, State>;

export function resourceById<T, R, GroupIdentifier extends string | number>({
  identifier,
  params,
  loader,
  stream,
  equalParams,
}: Omit<ResourceOptions<T, R>, 'params'> & {
  params: () => R; // must be a mandatory field
  identifier: (request: NonNullable<NoInfer<R>>) => GroupIdentifier;
  equalParams?:
    | 'default'
    | 'useIdentifier'
    | ((a: R, b: R, identifierFn: (params: R) => GroupIdentifier) => boolean);
}): ResourceByIdRef<GroupIdentifier, T> {
  const injector = inject(Injector);

  // maybe create a linkedSignal to enable to reset
  const resourceByGroup = signal<
    Partial<Record<GroupIdentifier, ResourceRef<T>>>
  >({});

  const resourceEqualParams =
    equalParams === 'useIdentifier'
      ? (a: NonNullable<R>, b: NonNullable<R>) =>
          identifier(a) === identifier(b)
      : equalParams;

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

    //@ts-expect-error TypeScript misinterpreting
    const paramsWithEqualRule = computed(() => filteredRequestByGroup(), {
      ...(equalParams !== 'default' && { equal: resourceEqualParams }),
    });

    const resourceRef = createDynamicResource(injector, {
      group,
      //@ts-expect-error stream and loader conflict
      resourceOptions: {
        loader,
        params: paramsWithEqualRule,
        stream,
      },
    });

    // attach a new instance of ResourceRef to the resourceByGroup
    resourceByGroup.update((state) => ({
      ...state,
      [group]: resourceRef,
    }));
  });

  const resourcesHandler: ResourceByIdHandler<GroupIdentifier, T> = {
    reset: () => {
      // todo check if all the resourceRef need to be destroyed before reseting the map (to avoid memory leaks)
      resourceByGroup.set({});
    },
    resetResource: (id: GroupIdentifier) => {
      resourceByGroup.update((state) => {
        const newState = { ...state };
        delete newState[id];
        return newState;
      });
    },
    add: (id: GroupIdentifier, options?: { defaultValue?: T }) => {
      const resourceRef = createDynamicResource(injector, {
        group: id,
        resourceOptions: {
          loader,
          params: resourceEqualParams,
          stream,
          defaultValue: options?.defaultValue,
        } as ResourceOptions<unknown, unknown>,
      });

      resourceByGroup.update((state) => ({
        ...state,
        [id]: resourceRef,
      }));
    },
  };

  return Object.assign(resourceByGroup, resourcesHandler);
}

const RESOURCE_INSTANCE_TOKEN = new InjectionToken<ResourceRef<unknown>>(
  'Injection token used to provide a dynamically created ResourceRef instance.'
);

interface DynamicResourceConfig<T, R, GroupIdentifier extends string | number> {
  resourceOptions: ResourceOptions<T, R>;
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
function createDynamicResource<T, R, GroupIdentifier extends string | number>(
  parentInjector: Injector,
  resourceConfig: DynamicResourceConfig<T, R, GroupIdentifier>
) {
  const injector = Injector.create({
    providers: [
      {
        provide: RESOURCE_INSTANCE_TOKEN,
        useFactory: () => preservedResource(resourceConfig.resourceOptions),
      },
    ],
    parent: parentInjector,
  });

  const resourceRef = injector.get(RESOURCE_INSTANCE_TOKEN);
  return resourceRef as ResourceRef<T>;
}
