import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  asyncMethod,
  on,
  serverState,
  source,
  usingAsyncMethods,
  usingSources,
  usingState,
} from '@ng-query/ngrx-signals';

const { injectServerState } = serverState(
  usingSources({
    increment: source<{}>(),
    decrement: source<{}>(),
  }),
  usingState(
    'counter',
    () => signal(0),
    ({ context: { increment, decrement }, state }) => ({
      increment: on(increment, () => state() + 1),
      decrement: on(decrement, () => state() - 1),
    })
  )
);

const { injectAsyncMethodsFeatureServerState } = serverState(
  usingAsyncMethods(() => ({
    // should enable to provide multiples status
    // should provide async method by id
    searchChange: asyncMethod({
      method: ({
        timeToWait,
        searchChange,
      }: {
        timeToWait: number;
        searchChange: string;
      }) => ({
        timeToWait,
        searchChange,
      }),
      loader: async ({ params: { timeToWait, searchChange } }) => {
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        return { searchChange };
      },
    }),
  })),
  {
    name: 'asyncMethodsFeature',
  }
);

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
    <!-- Display async methods status /value-->
    <div>
      <h3>Async Method Status</h3>
      <p>Status: {{ storeAsyncMethods.searchChange.status() }}</p>
      <p>Value: {{ storeAsyncMethods.searchChange.value() | json }}</p>
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
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
          'Courier New', monospace;
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
  store = injectServerState();

  storeAsyncMethods = injectAsyncMethodsFeatureServerState();
}
