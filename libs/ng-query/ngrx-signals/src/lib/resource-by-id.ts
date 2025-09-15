import {
  inject,
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
  Signal,
} from '@angular/core';
import { preservedResource } from './preserved-resource';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ResourceByIdHandler<
  GroupIdentifier extends string | number,
  State,
  ResourceParams
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
    // todo pass params instead of id and create the id from the params using the identifier function
    params: NonNullable<ResourceParams>,
    options?: {
      defaultValue?: State;
    }
  ) => void;
};

export type Identifier<ResourceParams, GroupIdentifier> = (
  request: NonNullable<NoInfer<ResourceParams>>
) => GroupIdentifier;

export type ResourceByIdRef<
  GroupIdentifier extends string | number,
  State,
  ResourceParams
> = WritableSignal<
  Prettify<Partial<Record<GroupIdentifier, ResourceRef<State>>>>
> &
  ResourceByIdHandler<GroupIdentifier, State, ResourceParams>;

export function resourceById<
  State,
  ResourceParams,
  GroupIdentifier extends string | number
>({
  identifier,
  params,
  loader,
  stream,
  equalParams,
}: Omit<ResourceOptions<State, ResourceParams>, 'params'> & {
  params: () => ResourceParams; // must be a mandatory field
  identifier: Identifier<NoInfer<ResourceParams>, GroupIdentifier>;
  equalParams?:
    | 'default'
    | 'useIdentifier'
    | ((
        a: ResourceParams,
        b: ResourceParams,
        identifierFn: (params: ResourceParams) => GroupIdentifier
      ) => boolean);
}): ResourceByIdRef<GroupIdentifier, State, ResourceParams> {
  const injector = inject(Injector);

  // maybe create a linkedSignal to enable to reset
  const resourceByGroup = signal<
    Partial<Record<GroupIdentifier, ResourceRef<State>>>
  >({});

  const resourceEqualParams =
    equalParams === 'useIdentifier'
      ? (a: NonNullable<ResourceParams>, b: NonNullable<ResourceParams>) =>
          a && b && identifier(a) === identifier(b)
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

  const resourcesHandler: ResourceByIdHandler<
    GroupIdentifier,
    State,
    ResourceParams
  > = {
    reset: () => {
      Object.values(resourceByGroup()).forEach((resource) =>
        (resource as ResourceRef<State>).destroy()
      );
      resourceByGroup.set({});
    },
    resetResource: (id: GroupIdentifier) => {
      resourceByGroup.update((state) => {
        const newState = { ...state };
        newState[id]?.destroy();
        delete newState[id];
        return newState;
      });
    },
    add: (resourceParams, options?: { defaultValue?: State }) => {
      const group = identifier(resourceParams);
      const filteredGlobalParamsByGroup = linkedSignal({
        source: params,
        computation: (incomingParamsValue, previousGroupParamsData) => {
          if (!incomingParamsValue) {
            return incomingParamsValue;
          }
          // filter the request push a value by comparing with the current group
          if (identifier(incomingParamsValue) !== group) {
            return (
              (previousGroupParamsData?.value as ResourceParams) ??
              resourceParams
            );
          }
          // The request push a value that concerns the current group
          return incomingParamsValue;
        },
      });
      const paramsWithEqualRule = computed(
        filteredGlobalParamsByGroup as Signal<NonNullable<ResourceParams>>,
        //@ts-expect-error TypeScript misinterpreting
        {
          ...(equalParams !== 'default' && {
            equal: resourceEqualParams,
          }),
        }
      );
      const resourceRef = createDynamicResource(injector, {
        group,
        resourceOptions: {
          loader,
          params: paramsWithEqualRule,
          stream,
          defaultValue: options?.defaultValue,
        } as ResourceOptions<unknown, unknown>,
      });
      resourceByGroup.update((state) => ({
        ...state,
        [group]: resourceRef,
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
