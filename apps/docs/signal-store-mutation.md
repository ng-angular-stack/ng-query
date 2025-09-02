# Mutation

// todo import link

## What is a Mutation?

A mutation in Signal Store is mainly used to update a server state (with POST, PUT, DELETE requests). Mutations are declarative and reactive, type-safe, and can be linked to queries for automatic UI updates, optimistic updates, and error handling.

## How to Use a Mutation

Define a mutation in your Signal Store using the `withMutation` feature. Specify the mutation name, a function `mutation` or `rxMutation`, and optionally, options for linking the mutation to queries (optimistic updates, reloads, etc, check the next section for more info).

::: danger
Both `mutation` and `rxMutation` relies on signal source, only the last value emitted in very short period of time is considered. (A possible evolution is creating a `withRxMutation` associated with `rxMutation`that relies on observables).
For more [info](https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1)
:::

### Example

```typescript
import { signalStore, withMutation } from "@ngrx/signals";
import { mutation } from "./mutation";

const Store = signalStore(
  withMutation("updateUser", () =>
    mutation({
      method: (id: string) => ({ id }),
      loader: ({ params }) => updateUserOnServer(params),
    })
  )
);

// Inject the store and use the mutation
const store = inject(Store);
store.mutateUpdateUser("5"); // Triggers the mutation
const status = store.updateUserMutation.status(); // 'idle', 'loading', 'resolved', 'error'
```

## `mutation` vs `rxMutation`

Both `mutation` and `rxMutation` are used to fetch server state in Signal Store, but they differ in how they handle data sources and reactivity:

- **mutation**: Based on `resource` is designed for promise-based or synchronous data loaders. It expose all `resource` functionalities.

- **rxMutation**: Based on `rxResource` is designed for observable-based data streams (RxJS). It expose all `rxResource` functionalities.

## rxMutation Options

The `rxMutation` function provides flexible options for configuring how your mutation receives parameters and streams data:

- **method**: A function that returns the mutation parameters. This is typically. This function is exposed into the store

  ```typescript
  method: (id: string) => ({ id });
  ```

- **params$**: An Observable that emits parameters for the mutation. Use this if your parameters come from an RxJS stream.

  ```typescript
  params$: of({ id: "5" });
  ```

- **param**: A function that returns the mutation parameters. This is typically. This function is exposed into the store

  ```typescript
  param: signal({ id: "5" });
  ```

- **stream**: A function that receives the current parameters and returns an Observable of the mutation result. This is where you connect to your mutation source (REST, GraphQL, WebSocket, etc.).
  ```typescript
  stream: ({ params }) => updateUser$(params);
  ```

### Example Usage

```typescript
// Using method (function or signal)
rxMutation({
  method: (id: string) => ({ id }),
  stream: ({ params }) => updateUserStream$(params), // returns Observable<User>
});

// Using params$ (observable)
rxMutation({
  params$: of({ id: "5" }),
  stream: ({ params }) => updateUserStream$(params), // returns Observable<User>
});
```

### Notes

- You can use either `method` or `params$` or `param`, but not both at the same time.
- The `stream` function is required and should always return an Observable.
- The mutation will automatically update its value and status whenever the parameters or the stream emit new values.

### When to use each

- Use `mutation` for single-shot updates (REST, GraphQL, etc.) or when you only need the result once.
- Use `rxMutation` for real-time updates, websockets, polling, or any scenario where the mutation source is an Observable and can emit multiple values over time.
