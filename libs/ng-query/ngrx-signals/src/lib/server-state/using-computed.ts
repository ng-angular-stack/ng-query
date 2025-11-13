import { Signal } from '@angular/core';
import {
  ContextConstraints,
  ServerStateFactoryUtility,
} from './server-state';
import { MergeObjects, UnionToTuple } from '../types/util.type';
import { ReadonlySource } from './util/source.type';
import { Prettify } from '@ngrx/signals';
import { capitalize } from './util/util';
import { ResourceByIdRef } from '../resource-by-id';

type SpecificUsingComputedOutputs<Computed extends {}> = {
  props: Computed;
  methods: {};
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
  asyncMethods: {};
};

type UsingComputedStatesOutputs<
  Context extends ContextConstraints,
  Computed extends {}
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingComputedOutputs<Computed>
>;

export type AsyncMethodByIdRef<
  GroupIdentifier,
  State,
  ResourceParams
> = () => Prettify<
  Partial<
    Record<
      GroupIdentifier & string,
      {
        readonly value: Signal<State | undefined>;
        readonly status: Signal<string>;
        readonly error: Signal<Error | undefined>;
        readonly isLoading: Signal<boolean>;
        hasValue(): boolean;
      }
    >
  >
>;

export type AsyncMethodRef<
  Value,
  ArgParams,
  Params,
  Insertions,
  IsMethod,
  SourceParams,
  GroupIdentifier
> = MergeObjects<
  [
    [unknown] extends [GroupIdentifier]
      ? {
          readonly value: Signal<Value | undefined>;
          readonly status: Signal<string>;
          readonly error: Signal<Error | undefined>;
          readonly isLoading: Signal<boolean>;
          hasValue(): boolean;
        }
      : {},
    Insertions,
    IsMethod extends true
      ? {
          method: (args: ArgParams) => Params;
        }
      : {
          source: ReadonlySource<SourceParams>;
        },
    [unknown] extends [GroupIdentifier]
      ? {}
      : ResourceByIdRef<
          GroupIdentifier & string,
          Value,
          ArgParams
        > & {
          _resourceById: ResourceByIdRef<
            GroupIdentifier & string,
            Value,
            ArgParams
          >;
          /**
           * Get the associated resource by id
           *
           * Only added to help TS inference (TS cannot infer ResourceByIdHandler without erasing the signal getter, () => ResourceByIdRef<...>) )
           *
           * return the associated resource or undefined if not existing
           */
          select: (id: GroupIdentifier) =>
            | {
                readonly value: Signal<Value | undefined>;
                readonly status: Signal<string>;
                readonly error: Signal<Error | undefined>;
                readonly isLoading: Signal<boolean>;
                hasValue(): boolean;
              }
            | undefined;
        }
  ]
>;

export function usingComputedStates<
  Context extends ContextConstraints,
  Computed extends {}
>(
  computedFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => Computed
): UsingComputedStatesOutputs<Context, Computed> {
  return (contextData, injector) => {
    const computedValues = computedFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.sources,
      ...contextData.context.props,
    }) as Record<string, Signal<unknown>>;

    return {
      props: computedValues,
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods: {},
      asyncMethods: {},
    } as unknown as SpecificUsingComputedOutputs<Computed>;
  };
}
