import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  on,
  serverState,
  source,
  usingInputs,
  usingSources,
  usingState,
} from '@ng-query/ngrx-signals';

const { usingDataPaginationServerState } = serverState(
  usingInputs({
    defaultNumber: undefined as number | undefined,
  }),
  usingState(
    'numberList',
    () => signal([1]),
    ({ state, context: { defaultNumber } }) => {
      return {
        addNumber: (numberValue: number) => {
          const stateValue = state();
          return [...stateValue, numberValue];
        },
        addDefaultNumber: () => {
          const stateValue = state();
          return [...stateValue, defaultNumber() ?? 0];
        },
        reset: () => {
          return [];
        },
      };
    }
  ),
  {
    name: 'dataPagination',
  }
);

const { injectHost1ServerState } = serverState(
  usingSources({
    increment: source<{}>(),
    decrement: source<{}>(),
    reset: source<{}>(),
  }),
  usingState(
    'counter',
    () => signal(0),
    ({ context: { increment, decrement }, state }) => ({
      increment: on(increment, () => state() + 1),
      decrement: on(decrement, () => state() - 1),
      reset: () => 0,
    })
  ),
  usingDataPaginationServerState(({ reset, counter }) => ({
    inputs: {
      defaultNumber: counter,
    },
    methods: {
      reset,
    },
  })),
  {
    name: 'host1',
  }
);

const { injectHost2ServerState } = serverState(
  usingSources({
    increment: source<{}>(),
    decrement: source<{}>(),
    reset: source<{}>(),
  }),
  usingState(
    'counter',
    () => signal(0),
    ({ context: { increment, decrement }, state }) => ({
      increment: on(increment, () => state() + 1),
      decrement: on(decrement, () => state() - 1),
      reset: () => 0,
    })
  ),
  usingDataPaginationServerState(({ reset, counter }) => ({
    inputs: {
      defaultNumber: 'EXTERNALLY_PROVIDED',
    },
    methods: {
      reset,
    },
  })),
  {
    name: 'host2',
  }
);

// const mySource = source<{ test: string }>();

// const { injectAsyncMethodsFeatureServerState } = serverState(
//   usingAsyncMethods(() => ({
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
// const { injectTest2ServerState } = serverState(
//   usingSources({
//     myLocalSource: source<{
//       timeToWait: number;
//       searchChange: string;
//     }>(),
//   }),
//   usingAsyncMethods(({ myLocalSource }) => ({
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
// const { usingBasicFeature } = serverState(
//   usingSources({
//     reset: source<{}>(),
//   }),
//   usingQueryParams(
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
//   usingState(
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

// const {injectStore, setMyReset} = serverState(
//   usingSources({
//     myReset: source<{}>(),
//   }),
//   usingBasicFeature(({myReset}) => ({
//     reset: myReset // bind the basicFeature reset source to myReset source
//   })),
//   usingState(
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
    <div class="counter-container">
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
    <button (click)="store.addDefaultNumber()">Add default number</button>
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
  store = injectHost1ServerState();
  store2 = injectHost2ServerState();

  // storeAsyncMethods = injectAsyncMethodsFeatureServerState();

  // store2 = injectTest2ServerState();

  // myGlobalSource = myGlobalSource;
}
