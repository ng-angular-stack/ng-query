import { Signal } from '@angular/core';

export type ExtractSignalPropsAndMethods<
  State,
  StateKeysTuple,
  Acc extends { props: {}; methods: Record<string, Function> }
> = StateKeysTuple extends [infer Head, ...infer Tail]
  ? Head extends keyof State
    ? [State[Head]] extends [Signal<any>]
      ? ExtractSignalPropsAndMethods<
          State,
          Tail,
          {
            props: { [K in Head]: State[Head] } & Acc['props'];
            methods: Acc['methods'];
          }
        >
      : ExtractSignalPropsAndMethods<
          State,
          Tail,
          {
            props: Acc['props'];
            methods: Acc['methods'] & { [K in Head]: State[Head] };
          }
        >
    : Acc
  : Acc;
