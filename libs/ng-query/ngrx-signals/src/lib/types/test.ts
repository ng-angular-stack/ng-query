import {
  DeepSignal,
  Prettify,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from '@ngrx/signals';
import { Expect, Equal } from 'test-type';
import { Signal } from '@angular/core';

type Scalar = null | boolean | number | string;

type HasBrandedKey<HostKeys, Brandedkeys> = HostKeys & Brandedkeys;
type tHasBrandedKey = HasBrandedKey<'a' | 'b', 'b' | 'c'>;
type t2HasBrandedKey = HasBrandedKey<'a' | 'D', 'b' | 'c'>;

type Book = {
  title: string;
  author: string;
  published: number;
};

// ! Handle Array
type UnBrand<
  T extends Record<string, unknown>,
  BrandedTypes extends Record<string, unknown>
> = {
  [key in keyof T]: T[key] extends Scalar | undefined
    ? T[key]
    : keyof T[key] extends keyof BrandedTypes
    ? BrandedTypes[keyof T[key]]
    : T[key] extends Record<string, unknown>
    ? UnBrand<T[key], BrandedTypes>
    : never;
};

type u = UnBrand<
  {
    state: {
      result: unknown & {
        __entity: true;
      };
      nothing: string;
    };
    props: {
      result: unknown & {
        __entity: true;
      };
      nothing: string;
    };
    methods: {};
  },
  {
    ['__entity']: Book;
  }
>;

type Success = ReturnType<SignalStoreFeature<SignalStoreFeatureResult, u>>;

type ts = Success['stateSignals'];
type tsP = Success['props'];

type ExpectSuccessStats = Expect<
  Equal<
    ts,
    {
      result: DeepSignal<Book>;
      nothing: Signal<string>;
    }
  >
>;

type ExpectSuccess = Expect<
  Equal<
    tsP,
    {
      result: Book;
      nothing: string;
    }
  >
>;

const t = {} as Prettify<u>;
//.   ^?

const withSelectedEntity = withFeatureFactoryG(
  <
    //👇 List all your generics types
    MyGenericTypes extends GenericTypes<['entity']>
  >({
    entityMap,
  }: {
    //                           👇 Ref the generic types like that
    entityMap: Signal<EntityMap<MyGenericTypes['entity']>>;
  }) =>
    signalStoreFeature(
      withState({
        selectedEntityId: null as string | null,
      }),
      withProps((store) => ({
        selectedEntity: entityMap[store.selectedEntityId() ?? ''],
      })),
      withMethods(() => ({}))
    )
);
