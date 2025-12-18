import {
  ContextConstraints,
  craftFactoryEntries,
  CraftFactoryEntries,
  CraftFactoryUtility,
  partialContext,
  PartialContext,
  StoreConfigConstraints,
} from './craft';
import { StateOutput } from './state';
import { UnionToTuple } from '../types/util.type';
import { ExtractSignalPropsAndMethods } from './util/extract-signal-props-and-methods';
import { isSignal, Signal } from '@angular/core';
import { capitalize } from './util/util';

// Helper type to defer evaluation and avoid infinite recursion
type DeferredExtract<Insertions> = UnionToTuple<
  keyof Insertions
> extends infer Keys
  ? ExtractSignalPropsAndMethods<
      Insertions,
      Keys,
      { props: {}; methods: Record<string, Function> }
    >
  : never;

type SpecificCraftStateOutputs<
  StateName extends string,
  State,
  Insertions
> = DeferredExtract<Insertions> extends infer Extracted
  ? Extracted extends { props: unknown; methods: Record<string, Function> }
    ? PartialContext<{
        props: {
          [key in StateName]: Signal<State>;
        } & {
          [key in keyof Extracted['props'] as `${StateName &
            string}${Capitalize<key & string>}`]: Extracted['props'][key];
        };
        methods: {
          [key in keyof Extracted['methods'] as `${StateName &
            string}${Capitalize<key & string>}`]: Extracted['methods'][key];
        };
      }>
    : never
  : never;

type CraftStateOutputs<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  StateName extends string,
  State,
  Insertions
> = CraftFactoryUtility<
  Context,
  StoreConfig,
  SpecificCraftStateOutputs<StateName, State, Insertions>
>;

export function craftState<
  Context extends ContextConstraints,
  StoreConfig extends StoreConfigConstraints,
  const StateName extends string,
  State,
  Insertions
>(
  stateName: StateName,
  stateFactory: (
    context: CraftFactoryEntries<Context>
  ) => StateOutput<State, Insertions>
): CraftStateOutputs<Context, StoreConfig, StateName, State, Insertions> {
  return () => (contextData) => {
    const stateResult = stateFactory(craftFactoryEntries(contextData));

    const { props, methods } = Object.entries(stateResult).reduce(
      (acc, [key, value]) => {
        if (isSignal(value)) {
          (acc.props as Record<string, Signal<any>>)[capitalize(key)] = value;
        } else {
          (acc.methods as Record<string, Function>)[
            `${stateName}${capitalize(key)}`
          ] = value;
        }
        return acc;
      },
      {} as {
        props: Record<string, Signal<any>>;
        methods: Record<string, Function>;
      }
    );
    return partialContext({
      props: { [stateName]: stateResult, ...props },
      methods,
    }) as unknown as SpecificCraftStateOutputs<StateName, State, Insertions>;
  };
}
