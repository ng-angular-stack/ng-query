import { effect, Signal, WritableSignal } from '@angular/core';
import { ContextConstraints, ServerStateFactoryUtility } from './server-state';
import { FilterPrivateFields } from './util/util.type';
import { ReadonlySource } from './util/source.type';
import { isSource } from './util/util';

// todo enable to sync with localStorage or sessionStorage
// todo sync about async methods that can be used to handle
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
  Methods extends
    | Record<
        string,
        ((...args: any[]) => NoInfer<State>) | ReadonlySource<State>
      >
    | undefined
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
      Context['sources'] &
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
    const methodsData = methodsFactory?.({
      state: readonlyState,
      context: {
        ...contextData.context.inputs,
        ...contextData.context.__injections,
        ...contextData.context.props,
        ...contextData.context.sources,
      },
    });
    const { methodsConnectedToSource, methods } = Object.entries(
      methodsData ?? {}
    ).reduce(
      (acc, [methodName, methodValue]) => {
        if (isSource(methodValue)) {
          acc.methodsConnectedToSource.push(
            methodValue as ReadonlySource<unknown>
          );
          return acc;
        }
        acc.methods[methodName] = methodValue as Function;
        return acc;
      },
      {
        methodsConnectedToSource: [],
        methods: {},
      } as {
        methodsConnectedToSource: ReadonlySource<unknown>[];
        methods: Record<string, Function>;
      }
    );

    const finalMethods = Object.entries(methods ?? {}).reduce(
      (acc, [methodName, method]) => {
        acc[methodName] = (...args: any[]) => {
          console.log('args', args);
          const result = method(...args);
          console.log('result', result);
          state.set(result);
        };
        return acc;
      },
      {} as Record<string, Function>
    );

    methodsConnectedToSource.forEach((sourceSignal) => {
      console.log('methodsConnectedToSource');
      effect(() => {
        const newValue = sourceSignal();
        console.log('effect newValue', newValue);
        if (newValue !== undefined) {
          state.set(newValue as NoInfer<State>);
        }
      });
    });

    return {
      props: { [stateName]: readonlyState },
      inputs: {},
      queryParams: {},
      sources: {},
      __injections: {},
      __query: {},
      __mutation: {},
      methods: finalMethods,
    } as unknown as SpecificUsingStateOutputs<StateName, State, Methods>;
  };
}
