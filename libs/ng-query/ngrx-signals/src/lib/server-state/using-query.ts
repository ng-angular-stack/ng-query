import {
  QueryDeclarativeEffect,
  setAllPatchFromMutationOnQueryValue,
  setAllUpdatesFromMutationOnQueryValue,
  triggerQueryReloadOnMutationStatusChange,
} from '../core/query.core';
import { InternalType, MergeObject } from '../types/util.type';
import {
  ContextConstraints,
  MutationDictionary,
  ServerStateFactoryUtility,
} from './server-state';
import { QueryRef } from '../with-query';
import {
  effect,
  EffectRef,
  Injector,
  linkedSignal,
  ResourceRef,
  untracked,
} from '@angular/core';
import { ResourceByIdRef } from '../resource-by-id';
import { nestedEffect } from '../types/util';

// todo Context['sources'] & Context['queryParams'] & Context['asyncMethods'];

type QueryOptions<
  Context extends ContextConstraints,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  OtherProperties
> = {
  testOn?: Context['__mutation'] extends infer Mutations ? Mutations : never;
  on?: Context['__mutation'] extends infer Mutations
    ? {
        [key in keyof Mutations as `${key &
          string}${'__types' extends keyof Mutations[key]
          ? Mutations[key]['__types'] extends InternalType<
              infer _State,
              infer _Params,
              infer _Args,
              infer IsGroupedResource
            >
            ? IsGroupedResource extends true
              ? 'MutationById'
              : 'Mutation'
            : never
          : never}`]?: '__types' extends keyof Mutations[key]
          ? Mutations[key]['__types'] extends InternalType<
              infer MutationState,
              infer MutationParams,
              infer MutationArgsParams,
              infer MutationIsByGroup,
              infer MutationGroupIdentifier
            >
            ? QueryDeclarativeEffect<{
                query: InternalType<
                  ResourceState,
                  ResourceParams,
                  ResourceArgsParams,
                  false
                >;
                mutation: InternalType<
                  MutationState,
                  MutationParams,
                  MutationArgsParams,
                  MutationIsByGroup,
                  MutationGroupIdentifier
                >;
              }>
            : never
          : never;
      }
    : never;
} & {
  [key in keyof OtherProperties]: OtherProperties[key];
};

type SpecificUsingQueryOutputs<
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs
> = {
  props: {
    [key in `${ResourceName & string}Query`]: MergeObject<
      ResourceRef<ResourceState>,
      InsertionsOutputs
    >;
  };
  methods: {};
  inputs: {};
  __injections: {};
  queryParams: {};
  sources: {};
  asyncMethods: {};
  __query: {
    [key in ResourceName & string]: {
      queryRef: QueryRef<
        NoInfer<ResourceState>,
        NoInfer<ResourceParams>,
        InsertionsOutputs
      >;
      __types: InternalType<
        ResourceState,
        ResourceParams,
        ResourceArgsParams,
        false
      >;
    };
  };
  __mutation: {};
};

type UseQueryOutputs<
  Context extends ContextConstraints,
  ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingQueryOutputs<
    ResourceName,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    InsertionsOutputs
  >
>;

export function usingQuery<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs,
  OtherProperties
>(
  resourceName: ResourceName,
  queryFactory: (
    context: Context['inputs'] & Context['__injections'] & Context['sources']
  ) => {
    // ! avoid to get the QueryRef directly, because it will return a ResourceRef that must be instantiated in an injectionContext
    // That why it is always wrapped in a function
    queryRef: QueryRef<
      NoInfer<ResourceState>,
      NoInfer<ResourceParams>,
      InsertionsOutputs
    >;
    __types: InternalType<
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      false
    >;
  },
  queryOptions?: QueryOptions<
    NoInfer<Context>,
    ResourceState,
    ResourceParams,
    ResourceArgsParams,
    OtherProperties
  >
): UseQueryOutputs<
  Context,
  ResourceName,
  ResourceState,
  ResourceParams,
  ResourceArgsParams,
  InsertionsOutputs
> {
  return (contextData, injector) => {
    const queryResult = queryFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.queryParams,
    });
    const {
      queryRef: { resource: queryResource, insertionsOutputs },
    } = queryResult;
    const mutationsConfigEffect = Object.entries(
      (queryOptions?.on ?? {}) as Record<string, QueryDeclarativeEffect<any>>
    );

    handleQueryMutationsReactions<
      Context,
      ResourceName,
      ResourceState,
      ResourceParams
    >(
      mutationsConfigEffect,
      contextData.context as unknown as Context,
      resourceName,
      queryResource,
      injector
    );

    return {
      props: {
        [`${resourceName as ResourceName}Query`]: Object.assign(
          queryResource,
          insertionsOutputs ?? {}
        ) as MergeObject<ResourceRef<ResourceState>, InsertionsOutputs>,
      },
      __query: {
        [resourceName as ResourceName]: queryResult,
      },
      __mutation: {},
      inputs: {},
      __injections: {},
      queryParams: {},
      sources: {},
      asyncMethods: {},
      methods: {},
    } as SpecificUsingQueryOutputs<
      ResourceName,
      ResourceState,
      ResourceParams,
      ResourceArgsParams,
      InsertionsOutputs
    >;
  };
}

function handleQueryMutationsReactions<
  Context extends ContextConstraints,
  const ResourceName extends string,
  ResourceState extends object | undefined,
  ResourceParams
>(
  mutationsConfigEffect: [string, QueryDeclarativeEffect<any>][],
  context: Context,
  resourceName: ResourceName,
  queryResource: ResourceRef<NoInfer<ResourceState> | undefined>,
  _injector: Injector
) {
  mutationsConfigEffect.reduce((acc, [mutationName, mutationEffectOptions]) => {
    const formattedMutationName = mutationName
      .replace('Mutation', '')
      .replace('ById', '');
    const mutationTargeted = (context.__mutation as MutationDictionary)[
      formattedMutationName
    ]?.mutationRef;
    console.log('formattedMutationName', formattedMutationName);
    console.log('mutationTargeted', mutationTargeted);
    if ('resource' in mutationTargeted) {
      const mutationResource = mutationTargeted.resource;
      return {
        ...acc,
        [`_on${formattedMutationName}${resourceName}QueryEffect`]: effect(
          () => {
            const mutationStatus = mutationResource.status();
            const mutationParamsSrc = (
              context.__mutation as MutationDictionary
            )[formattedMutationName].mutationRef.resourceParamsSrc;
            // use to track the value of the mutation
            const _mutationValueChanged = mutationResource.hasValue()
              ? mutationResource.value()
              : undefined;

            if (
              mutationEffectOptions?.optimisticUpdate ||
              mutationEffectOptions?.update
            ) {
              untracked(() => {
                setAllUpdatesFromMutationOnQueryValue({
                  mutationStatus,
                  queryResourceTarget: queryResource,
                  mutationEffectOptions,
                  mutationResource,
                  mutationParamsSrc,
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
                });
              });
            }
            const reloadCConfig = mutationEffectOptions.reload;
            if (reloadCConfig) {
              untracked(() => {
                triggerQueryReloadOnMutationStatusChange({
                  mutationStatus,
                  queryResourceTarget: queryResource,
                  mutationEffectOptions,
                  mutationResource,
                  mutationParamsSrc,
                  reloadCConfig,
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
                });
              });
            }
            if (
              mutationEffectOptions.optimisticPatch ||
              mutationEffectOptions.patch
            ) {
              untracked(() => {
                setAllPatchFromMutationOnQueryValue({
                  mutationStatus,
                  queryResourceTarget: queryResource,
                  mutationEffectOptions,
                  mutationResource,
                  mutationParamsSrc,
                  mutationIdentifier: undefined,
                  mutationResources: undefined,
                });
              });
            }
          }
        ),
      };
    }
    const mutationResources = mutationTargeted.resourceById;
    const newMutationResourceRefForNestedEffect = linkedSignal<
      ResourceByIdRef<string, ResourceState, ResourceParams>,
      { newKeys: string[] } | undefined
    >({
      source: mutationResources as any,
      computation: (currentSource, previous) => {
        if (!currentSource || !Object.keys(currentSource).length) {
          return undefined;
        }

        const currentKeys = Object.keys(currentSource) as string[];
        const previousKeys = Object.keys(previous?.source || {}) as string[];

        // Find keys that exist in current but not in previous
        const newKeys = currentKeys.filter(
          (key) => !previousKeys.includes(key)
        );

        return newKeys.length > 0 ? { newKeys } : previous?.value;
      },
    });

    return {
      ...acc,
      [`_on${formattedMutationName}${resourceName}QueryEffect`]: effect(() => {
        if (!newMutationResourceRefForNestedEffect()?.newKeys) {
          return;
        }
        newMutationResourceRefForNestedEffect()?.newKeys.forEach(
          (mutationIdentifier) => {
            nestedEffect(_injector, () => {
              const mutationResource =
                mutationTargeted.resourceById()[mutationIdentifier];

              if (!mutationResource) {
                return;
              }
              const mutationStatus = mutationResource.status();
              const mutationParamsSrc = (
                context.__mutation as MutationDictionary
              )[formattedMutationName].mutationRef.resourceParamsSrc;
              // use to track the value of the mutation
              const _mutationValueChanged = mutationResource.hasValue()
                ? mutationResource.value()
                : undefined;
              if (
                mutationEffectOptions?.optimisticUpdate ||
                mutationEffectOptions?.update
              ) {
                untracked(() => {
                  setAllUpdatesFromMutationOnQueryValue({
                    mutationStatus,
                    queryResourceTarget: queryResource,
                    mutationEffectOptions,
                    mutationResource,
                    mutationParamsSrc,
                    mutationIdentifier,
                    mutationResources,
                  });
                });
              }
              const reloadCConfig = mutationEffectOptions.reload;
              if (reloadCConfig) {
                untracked(() => {
                  triggerQueryReloadOnMutationStatusChange({
                    mutationStatus,
                    queryResourceTarget: queryResource,
                    mutationEffectOptions,
                    mutationResource,
                    mutationParamsSrc,
                    reloadCConfig,
                    mutationIdentifier,
                    mutationResources,
                  });
                });
              }
              if (
                mutationEffectOptions.optimisticPatch ||
                mutationEffectOptions.patch
              ) {
                untracked(() => {
                  setAllPatchFromMutationOnQueryValue({
                    mutationStatus,
                    queryResourceTarget: queryResource,
                    mutationEffectOptions,
                    mutationResource,
                    mutationParamsSrc,
                    mutationIdentifier: mutationIdentifier,
                    mutationResources,
                  });
                });
              }
            });
          }
        );
      }),
    };
  }, {} as Record<`_on${string}${ResourceName}QueryEffect`, EffectRef>);
}
