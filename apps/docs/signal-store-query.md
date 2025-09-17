# Query - `withQuery`

## Import:

`import { query, withQuery } from '@ng-query/ngrx-signals';`

`import { rxQuery } from '@ng-query/ngrx-signals-rxjs';`

## What is a Query?

A query in Signal Store is used to fetch and manage server state in your Angular application. Based on Angular `Resource`, it provides a reactive and declarative way to retrieve data, track its status (`idle, loading, resolved, error`), and keep your UI in sync with remote resources. Queries are the foundation for building robust, user-friendly interfaces that respond to server data changes automatically.

## How to Use a Query - `withQuery`

To use a query, you define it in your Signal Store using the `withQuery` feature. You specify the resource name, a factory function that returns a query configuration, and optionally, options for client state mapping or mutation reactions.

### Example

```typescript
const Store = signalStore(
  withState({ id: 5 }),
  withQuery('user', (store) =>
    // 👇 use query or rxQuery
    query({
      params: store.id, // signal source
      loader: ({ params }) => fetchUser(params),
    })
  )
);

// Inject the store and use the query resource
const store = inject(Store);
// store.userQuery (expose the `ResourceRef API`)
const user = store.userQuery.value(); // Access the fetched user
const status = store.userQuery.status(); // 'idle', 'loading', 'resolved', 'error'
```

### Key Benefits

- Automatic status tracking (idle, loading, resolved, error)
- Reactive updates to your UI
- Easy integration with mutations and optimistic updates
- Type-safe and autocompleted in Angular

::: warning
Both `query` and `rxQuery` relies on signal source, only the last value emitted in very short period of time is considered.
(A possible evolution is to works internally with observable when `params$` from `rxQuery` is used, but it is not really useful in this case).
[info](https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1)
:::

## `query` vs `rxQuery`

Both `query` and `rxQuery` are used to fetch server state in Signal Store, but they differ in how they handle data sources and reactivity:

- **query**: Based on `resource` is designed for promise-based or synchronous data loaders. It expose all `resource` functionalities.

- **rxQuery**: Based on `rxResource` is designed for observable-based data streams (RxJS). It expose all `rxResource` functionalities.

## `query` & `rxQuery` Insertions

The `query` & `rxQuery` accepts up to 7 insertions. These insertions can be used to add properties to the query or handle side effects. See the Insertions section in the documentation.
For example, you may want to insert a custom loading state that only appears if the request takes more than 200 ms, and remains visible for at least 500 ms to avoid flakiness.

## `rxQuery` options

The `rxQuery` function provides flexible options for configuring how your query receives parameters and streams data:

- **params**: A function returning the parameters for the query. This is typically a signal or a value that changes reactively.

  ```typescript
  params: signal({ id: 5 });
  ```

- **params$**: An Observable that emits parameters for the query. Use this if your parameters come from an RxJS stream.

  ```typescript
  params$: of('5');
  ```

- **stream**: A function that receives the current parameters and returns an Observable of the resource data. This is where you connect to your data source (REST, GraphQL, WebSocket, etc.).
  ```typescript
  stream: ({ params }) => api.getUser(params.is); // return an Observable<User>
  ```

### Example Usage

```typescript
// Using params (signal or function)
rxQuery({
  params: signal(5),
  stream: ({ params: id }) => of({ id, name: 'John Doe' }),
});

// Using params$ (observable)
rxQuery({
  params$: of('5'),
  stream: ({ params: id }) => of({ id, name: 'John Doe' }),
});
```

### Notes

- You can use either `params` or `params$`, but not both at the same time.
- The `stream` function is required and should always return an Observable.
- The query will automatically update its value and status whenever the parameters or the stream emit new values.
