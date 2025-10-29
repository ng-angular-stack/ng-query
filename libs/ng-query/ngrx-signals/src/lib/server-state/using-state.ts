import { computed, effect, Signal, WritableSignal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { Source } from './source';
import { FilterPrivateFields } from './util/util.type';

type ToConnectableSource<Sources, State> = {
  [K in keyof Sources as `connectTo${Capitalize<
    string & K
  >}Source`]: Sources[K] extends Source<infer SourceType>
    ? <Expose extends boolean = false>(
        reducer: (source: SourceType) => State,
        options?: {
          expose?: Expose;
        }
      ) => () => State
    : never;
};

type SpecificUsingStateOutputs<
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = {
  props: { [key in StateName]: Signal<State> };
  methods: Methods extends undefined ? {} : FilterPrivateFields<Methods>;
  inputs: {};
  queryParams: {};
  sources: {};
  __injections: {};
  __query: {};
  __mutation: {};
};

type UsingStateOutputs<
  Context extends ContextConstraints,
  StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => any> | undefined
> = ServerStateFactoryUtility<
  Context,
  SpecificUsingStateOutputs<StateName, State, Methods>
>;

export function usingState<
  Context extends ContextConstraints,
  const StateName extends string,
  State,
  Methods extends Record<string, (...args: any[]) => NoInfer<State>> | undefined
>(
  stateName: StateName,
  stateFactory: (
    context: Context['inputs'] &
      Context['__injections'] &
      Context['sources'] &
      Context['props']
  ) => WritableSignal<State>,
  methodsFactory?: (state: {
    state: Signal<NoInfer<State>>;
    context: Context['inputs'] &
      Context['__injections'] &
      ToConnectableSource<Context['sources'], NoInfer<State>> &
      Context['props'];
  }) => Methods
): UsingStateOutputs<Context, StateName, State, Methods> {
  return (contextData, injector) => {
    const stateResult = stateFactory({
      ...contextData.context.inputs,
      ...contextData.context.__injections,
      ...contextData.context.sources,
      ...contextData.context.props,
    });

    const state = stateResult;
    const readonlyState = stateResult.asReadonly();
    const methods = methodsFactory?.({
      state: readonlyState,
      context: {
        ...contextData.context.inputs,
        ...contextData.context.__injections,
        ...contextData.context.props,
        ...Object.entries(
          contextData.context.sources as Record<string, Source<unknown>>
        )?.reduce((acc, [sourceKey, source]) => {
          const connectableName = `connectTo${unCapitalize(sourceKey)}Source`;
          //@ts-expect-error Can not find a way to tell to TS that sourceKey is the key of source
          acc[connectableName] = (
            reducer: (sourceValue: unknown) => NoInfer<State>
          ) => {
            const source = (
              contextData.context.sources as Record<string, Source<unknown>>
            )[sourceKey];
            effect(() => {
              const sourceValue = source();
              if (sourceValue !== undefined) {
                const newState = reducer(sourceValue);
                state.set(newState);
              }
            });
            return () => {};
          };
          return acc;
        }, {} as ToConnectableSource<Context['sources'], NoInfer<State>>),
      },
    });
    Object.values(methods ?? {}).forEach((method) => {
      const originalMethod = method as Function;
      (method as Function) = (...args: any[]) => {
        const result = originalMethod(...args);
        state.set(result);
      };
    });

    return {
      props: { [stateName]: readonlyState },
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods,
    } as unknown as SpecificUsingStateOutputs<StateName, State, Methods>;
  };
}

function unCapitalize(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
