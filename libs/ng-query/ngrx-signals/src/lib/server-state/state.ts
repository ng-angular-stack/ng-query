import { isSignal, Signal, signal, WritableSignal } from '@angular/core';
import {
  InsertionsStateFactory,
  InsertionStateFactoryContext,
} from '../core/query.core';
import { ReadonlySource } from './util/source.type';
import { MergeObject } from '../types/util.type';
import { IsEmptyObject } from './util/util.type';

type FilterReadonlySource<Insertions> = {
  [K in keyof Insertions as Insertions[K] extends ReadonlySource<any>
    ? never
    : K]: Insertions[K];
};

export type StateOutput<StateType, Insertions> = MergeObject<
  Signal<StateType>,
  IsEmptyObject<Insertions> extends true ? {} : FilterReadonlySource<Insertions>
>;

type StateConfig<State> = State | WritableSignal<State>;

export function state<StateType>(
  stateConfig: StateConfig<StateType>
): StateOutput<StateType, {}>;
export function state<StateType, Insertion1>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>
): StateOutput<StateType, Insertion1>;
export function state<StateType, Insertion1, Insertion2>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<NoInfer<StateType>, Insertion2, Insertion1>
): StateOutput<StateType, Insertion1 & Insertion2>;
export function state<StateType, Insertion1, Insertion2, Insertion3>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion3,
    Insertion1 & Insertion2
  >
): StateOutput<StateType, Insertion1 & Insertion2 & Insertion3>;
export function state<
  StateType,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4
>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >
): StateOutput<StateType, Insertion1 & Insertion2 & Insertion3 & Insertion4>;
export function state<
  StateType,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5
>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >
): StateOutput<
  StateType,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
>;
export function state<
  StateType,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6
>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >
): StateOutput<
  StateType,
  Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
>;
export function state<
  StateType,
  Insertion1,
  Insertion2,
  Insertion3,
  Insertion4,
  Insertion5,
  Insertion6,
  Insertion7
>(
  stateConfig: StateConfig<StateType>,
  insertion1: InsertionsStateFactory<NoInfer<StateType>, Insertion1>,
  insertion2: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion2,
    Insertion1
  >,
  insertion3: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion3,
    Insertion1 & Insertion2
  >,
  insertion4: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion4,
    Insertion1 & Insertion2 & Insertion3
  >,
  insertion5: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion5,
    Insertion1 & Insertion2 & Insertion3 & Insertion4
  >,
  insertion6: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion6,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5
  >,
  insertion7: InsertionsStateFactory<
    NoInfer<StateType>,
    Insertion7,
    Insertion1 & Insertion2 & Insertion3 & Insertion4 & Insertion5 & Insertion6
  >
): StateOutput<
  StateType,
  Insertion1 &
    Insertion2 &
    Insertion3 &
    Insertion4 &
    Insertion5 &
    Insertion6 &
    Insertion7
>;
export function state<StateType>(
  stateConfig: StateConfig<StateType>,
  ...insertions: any[]
): StateOutput<StateType, {}> {
  const isSignalState = isSignal(stateConfig);
  const stateSignal = isSignalState
    ? (stateConfig as WritableSignal<StateType>)
    : signal(stateConfig as StateType);

  return Object.assign(
    stateSignal,
    (insertions as InsertionsStateFactory<StateType, {}>[])?.reduce(
      (acc, insert) => {
        return {
          ...acc,
          ...insert({
            state: stateSignal.asReadonly(),
            set: (newState: StateType) => stateSignal.set(newState),
            update: (updateFn: (currentState: StateType) => StateType) =>
              stateSignal.update(updateFn),
            insertions: acc as {},
          } as InsertionStateFactoryContext<StateType, {}>),
        };
      },
      {} as Record<string, unknown>
    )
  ) as unknown as StateOutput<StateType, {}>;
}
