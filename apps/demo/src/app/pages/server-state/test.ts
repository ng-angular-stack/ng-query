import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  linkedSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  afterRecomputation,
  craft,
  craftInputs,
  craftSources,
  craftState,
  source,
} from '@ng-query/ngrx-signals';
import { Source } from 'libs/ng-query/ngrx-signals/src/lib/server-state/source';
import { ReadonlySource } from 'libs/ng-query/ngrx-signals/src/lib/server-state/util/source.type';

const { injectCraft } = craft(
  {
    name: '',
    providedIn: 'root',
  },
  craftInputs({
    myParams: undefined as number | undefined,
  }),
  craftSources({
    reset: source<string>(),
  }),
  craftState(
    'numberList',
    ({ myParams }) => linkedSignal(() => [myParams() ?? 0]),
    ({ state, context: { reset } }) => {
      return {
        addNumber: (numberValue: number) => {
          console.log('addNumber numberValue', numberValue);
          const stateValue = state();
          return [...stateValue, numberValue];
        },
        filterNumber: (filterValue: number) => {
          const stateValue = state();
          return stateValue.filter((num) => num !== filterValue);
        },
        reset: afterRecomputation(reset, () => {
          return [];
        }),
      };
    }
  )
);

// const { injectQpCraft, setAllQpQueryParams } = craft(
//   {
//     name: 'qp',
//     providedIn: 'root',
//   },
//   craftQueryParams(
//     'pagination',
//     () => ({
//       page: {
//         defaultValue: 1,
//         parse: (value: string) => parseInt(value, 10),
//         serialize: (value: unknown) => String(value),
//       },
//     }),
//     {
//       methods: ({ queryParams }) => ({
//         nextPage: () => ({
//           ...queryParams(),
//           page: queryParams().page + 1,
//         }),
//       }),
//     }
//   ),
//   craftQueryParams(
//     'activeFilters',
//     () => ({
//       active: {
//         defaultValue: false,
//         parse: (value: string) => value === 'true',
//         serialize: (value: unknown) => String(value),
//       },
//     }),
//     {
//       methods: ({ queryParams }) => ({
//         setActive: () => ({
//           ...queryParams(),
//           active: !queryParams().active,
//         }),
//       }),
//     }
//   ),
//   craftSetAllQueriesParamsStandalone()
// );

// const { craftDataPaginationServerState } = craft(
//   craftInputs({
//     defaultNumber: undefined as number | undefined,
//   }),
//   craftState(
//     'numberList',
//     () => signal([1]),
//     ({ state, context: { defaultNumber } }) => {
//       return {
//         addNumber: (numberValue: number) => {
//           const stateValue = state();
//           return [...stateValue, numberValue];
//         },
//         addDefaultNumber: () => {
//           const stateValue = state();
//           return [...stateValue, defaultNumber() ?? 0];
//         },
//         reset: () => {
//           return [];
//         },
//       };
//     }
//   ),
//   {
//     name: 'dataPagination',
//     providedIn: 'feature',
//   }
// );

// const { injectHost1ServerState } = craft(
//   craftSources({
//     increment: source<{}>(),
//     decrement: source<{}>(),
//     reset: source<{}>(),
//   }),
//   craftState(
//     'counter',
//     () => signal(0),
//     ({ context: { increment, decrement }, state }) => ({
//       increment: on(increment, () => state() + 1),
//       decrement: on(decrement, () => state() - 1),
//       reset: () => 0,
//     })
//   ),
//   craftDataPaginationCraft(({ reset, counter }) => ({
//     inputs: {
//       defaultNumber: counter,
//     },
//     methods: {
//       reset,
//     },
//   })),
//   {
//     name: 'host1',
//   }
// );

// const { injectHost2ServerState } = craft(
//   craftSources({
//     increment: source<{}>(),
//     decrement: source<{}>(),
//     reset: source<{}>(),
//   }),
//   craftState(
//     'counter',
//     () => signal(0),
//     ({ context: { increment, decrement }, state }) => ({
//       increment: on(increment, () => state() + 1),
//       decrement: on(decrement, () => state() - 1),
//       reset: () => 0,
//     })
//   ),
//   craftDataPaginationCraft(({ reset, counter }) => ({
//     inputs: {
//       defaultNumber: counter,
//     },
//     methods: {
//       reset,
//     },
//   })),
//   {
//     name: 'host2',
//   }
// );

// const mySource = source<{ test: string }>();

// const { injectAsyncMethodsFeatureServerState } = craft(
//   craftAsyncMethods(() => ({
//     // should enable to provide multiples status
//     // should provide async method by id
//     searchChange: asyncMethod({
//       method: ({
//         timeToWait,
//         searchChange,
//       }: {
//         timeToWait: number;
//         searchChange: string;
//       }) => ({
//         timeToWait,
//         searchChange,
//       }),
//       identifier: (params) => params.searchChange,
//       loader: async ({ params: { timeToWait, searchChange } }) => {
//         await new Promise((resolve) => setTimeout(resolve, timeToWait));
//         return { searchChange };
//       },
//     }),
//     testSource: asyncMethod({
//       method: on(mySource, (payload) => payload),
//       loader: async ({ params: { test } }) => {
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         return { test };
//       },
//     }),
//   })),
//   {
//     name: 'asyncMethodsFeature',
//   }
// );

// const myGlobalSource = source<{
//   timeToWait: number;
//   searchChange: string;
// }>();
// const { injectTest2ServerState } = craft(
//   craftSources({
//     myLocalSource: source<{
//       timeToWait: number;
//       searchChange: string;
//     }>(),
//   }),
//   craftAsyncMethods(({ myLocalSource }) => ({
//     searchGlobalChange: asyncMethod({
//       method: on(myGlobalSource, (payload) => {
//         console.log('payload', payload);
//         return payload;
//       }),
//       identifier: (params) => params.searchChange,
//       loader: async ({ params: { timeToWait, searchChange }, abortSignal }) => {
//         await new Promise((resolve) => setTimeout(resolve, timeToWait));
//         return { searchChange };
//       },
//     }),
//     // searchLocalChange: asyncMethod({
//     //   method: on(myLocalSource, (payload) => payload),
//     //   identifier: (params) => params.searchChange,
//     //   loader: async ({ params: { timeToWait, searchChange } }) => {
//     //     await new Promise((resolve) => setTimeout(resolve, timeToWait));
//     //     console.log('loader', searchChange);
//     //     return { searchChange };
//     //   },
//     // }),
//   })),
//   {
//     name: 'test2',
//   }
// );
// const { craftBasicFeature } = craft(
//   craftSources({
//     reset: source<{}>(),
//   }),
//   craftQueryParams(
//     'pagination',
//     () => ({
//       page: {
//         defaultValue: 1,
//         parse: (value: string) => parseInt(value, 10),
//         serialize: (value: unknown) => String(value),
//       },
//     }),
//     {
//       methods: ({ context: { reset }, queryParams }) => ({
//         nextPage: () => ({
//           ...queryParams(),
//           page: queryParams().page + 1,
//         }),
//         _reset: on(reset, () => ({
//           ...queryParams(),
//           page: 1,
//         })),
//       }),
//     }
//   ),
//   craftState(
//     'counter',
//     () => signal(0),
//     ({ context: { reset }, state }) => ({
//       increment: () => state() + 1,
//       decrement: () => state() - 1,
//       _reset: on(reset, () => 0),
//     })
//   ),
//   {
//     name: 'basicFeature'
//   }
// );

// const {injectStore, setMyReset} = craft(
//   craftSources({
//     myReset: source<{}>(),
//   }),
//   craftBasicFeature(({myReset}) => ({
//     reset: myReset // bind the basicFeature reset source to myReset source
//   })),
//   craftState(
//     'selectedProducts',
//     () => signal([] as Book[]),
//     ({ context: { reset }, state }) => ({
//       addBook: //...,
//       removeBook://...,
//       _reset: on(reset, () => []),
//     })
//   ),
//   {
//     name: 'basicFeature',
//   }
// );

// somewhere (no need to be in injection context)
// setMyReset({}); // trigger myReset source

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    numberList{{ store.numberList() | json }}
    <button (click)="addNumberSource.set(5)">add</button>
    <button (click)="store.filterNumber(10)">filter</button>
    <!-- <div>{{ storeQp.pagination() | json }}</div>
    <button (click)="storeQp.nextPage()">Next Page</button> -->
    <!-- <div class="counter-container">
      <div class="counter-display">{{ store.counter() }}</div>
      <div class="counter-controls">
        <button
          class="counter-btn counter-btn--decrement"
          (click)="store.setDecrement({})"
        >
          −
        </button>
        <button
          class="counter-btn counter-btn--increment"
          (click)="store.setIncrement({})"
        >
          +
        </button>
      </div>
    </div>

    <div>store nested State numberList: {{ store.numberList() }}</div>
    <div>store2 nested State numberList: {{ store2.numberList() }}</div>
    <button (click)="store.addDefaultNumber()">Add default number</button> -->
    <!-- Display async methods status /value-->
    <!-- <div>
      <h3>Async Method Status</h3>
      <p>
        Status: {{ storeAsyncMethods.searchChange.select('demo')?.status() }}
      </p>
      <p>
        Value:
        {{ storeAsyncMethods.searchChange.select('demo')?.value() | json }}
      </p>
      <button
        (click)="
          storeAsyncMethods.setSearchChange({
            searchChange: 'demo',
            timeToWait: 1000,
          })
        "
      >
        Trigger Async Method
      </button>
    </div>

    <div>
      <h3>Async Method Status</h3>
      <p>Status: {{ store2.searchGlobalChange.select('demo')?.status() }}</p>
      <p>
        Value:
        {{ store2.searchGlobalChange.select('demo')?.value() | json }}
      </p>
      <button
        (click)="
          myGlobalSource.set({
            searchChange: 'demo',
            timeToWait: 1000,
          })
        "
      >
        Trigger Async Method
      </button>
    </div> -->
  `,
  styles: [
    `
      .counter-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        max-width: 200px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        background-color: #fafafa;
      }

      .counter-display {
        font-size: 3rem;
        font-weight: 300;
        color: #374151;
        min-width: 60px;
        text-align: center;
      }

      .counter-controls {
        display: flex;
        gap: 0.75rem;
      }

      .counter-btn {
        width: 44px;
        height: 44px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background-color: #ffffff;
        color: #374151;
        font-size: 1.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .counter-btn:hover {
        border-color: #9ca3af;
        background-color: #f9fafb;
      }

      .counter-btn:active {
        transform: translateY(1px);
        background-color: #f3f4f6;
      }

      .counter-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
      }

      .counter-btn--increment:hover {
        border-color: #10b981;
        color: #10b981;
      }

      .counter-btn--decrement:hover {
        border-color: #ef4444;
        color: #ef4444;
      }
    `,
  ],
})
export default class TestComponent {
  // storeQp = injectQpCraft();
  // store = injectHost1Craft();
  // store2 = injectHost2Craft();
  // storeAsyncMethods = injectAsyncMethodsFeatureCraft();
  // store2 = injectTest2Craft();
  // myGlobalSource = myGlobalSource;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  myParams = signal('1');
  addNumberSource = source<number>({ equal: () => false });
  resetSource = source<string>();
  store = injectCraft({
    inputs: {
      myParams: signal(10),
    },
    methods: {
      setReset: this.resetSource,
      addNumber: this.addNumberSource,
      // reset: resetSource,
      // addNumber: addNumberSource,
    },
    // sources: {
    //   reset: resetSource,
    // },
  });
}
