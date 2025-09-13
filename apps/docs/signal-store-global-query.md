# Global Queries

Global queries provide a way to define, cache, and reuse query logic across multiple signal stores and components. The goal is to centralize query definitions, enable shared caching, and simplify integration of common data sources throughout your application.

:::info
This api may be changed (check the last part for more info)
:::

## Aim

- **Centralization:** Define queries in one place, making them easy to maintain and update.
- **Reusability:** Plug queries into any signal store or inject them directly into components, reducing duplication.
- **Caching:** Share cached data between stores and components, improving performance and consistency.
- **Extensibility:** Support for custom persisters, cache time configuration, and dependency injection (e.g., services).
- **Avoid error:** Defining all globalQueries in the same place avoid to recreate an already existing query and ensure that the key is not already used
- **Organization:** Define queries at a feature level for better modularization and maintainability.
- **Clarity:** Make dependencies between features explicit rather than creating a monolithic query library.

## Usage Overview

1. **Define global queries:**
   Use `globalQueries` to declare queries. Each query can be configured with cache options and injected dependencies.

   ```typescript
   export const {
    withUserQuery,
    withUsersQuery,
    withUserQueryById,
    injectUserQuery,
    injectUsersQuery,
    injectUserQueryById
    } = globalQueries({
   	 queries: {
   		 user: {
   			 query: () => rxQuery({ ... }),
   		 },
   		 users: {
   			 query: () => rxQuery({ ... }),
   		 },
   	 },
   	 queriesById: {
   		 user: {
   			 queryById: () => rxQueryById({ ... }),
   		 },
   	 },
   });
   ```

2. **Plug queries into signal stores:**
   Use the generated `withUserQuery`, `withUsersQuery`, or `withUserQueryById` functions to add queries to your signal stores.

   ```typescript
   const store = signalStore(
     withState({ selected: '1' }),
     withUserQuery((store) => ({ setQuerySource: (source) => ({ id: store.selected }) })),
     withUsersQuery(),
     withUserQueryById()
   );
   ```

3. **Inject queries directly:**
   Use the generated `injectUserQuery` or `injectUserQueryById` functions to access query resources in components or services.

   ```typescript
   private readonly userQueryResource = injectUserQuery();
   ```

4. **React to mutation**
   All the default options of the queries are usable with global queries. It is possible to react to a mutation, or a mutation to mutate a query state.

```typescript{11-13}
signalStore(
      { providedIn: 'root' },
      withState({ selected: '1' }),
      withMutation('name', () =>
        rxMutation({
          method: (name: string) => name,
          stream: ({ params }) => of({ id: '4', name: params }),
        })
      ),
      withUserQuery((store) => ({
        on: {
          nameMutation: {...},
        },
      }))
    );
```

## Features

### Plugging data from component or signalStore

For queries that need dynamic parameters (e.g: an input from a component or a state from a store), define a source `SignalProxy` and use the `setQuerySource` option when plugging into a signal store, or in the inject function:

```typescript
globalQueries({
  queries: {
    user: {
      query: (source: SignalProxy<{ id: string | undefined }>) =>
        rxQuery({
          params: source.id,
          stream: ({ params: id }) => api.getUserDetails(id),
        }),
    },
  },
});
```

```typescript
const store = signalStore(withUserQuery((store) => ({ setQuerySource: (source) => ({ id: store.selected }) })));
```

In a component, you can use the pluggable API:

```typescript
@Component(...) class UserComponent {
    // The Angular router will automatically bind userId
    // as `withComponentInputBinding` is added to `provideRouter`.
    // See https://angular.dev/api/router/withComponentInputBinding
    readonly userId = input<string>();
    readonly userQueryResource = injectUserQuery((source) => ({ id: this.userId }));
}

```

### Injecting a service

You can inject Angular services directly into your query definitions:

```typescript
globalQueries({
  queries: {
    user: {
      query: (api = inject(ApiService)) =>
        rxQuery({
          params: () => "1",
          stream: ({ params: id }) => api.getUserDetails(id),
        }),
    },
    users: {
      query: (source: SignalProxy<{ id: string | undefined }>, api = inject(ApiService)) =>
        rxQuery(...),
    }
  },
});
```

This allows queries to use any injectable dependency, such as HTTP clients or custom services.

### Modifying cacheTime

You can set the cache duration for each query or globally:

- **Per-query:**
  ```typescript
  globalQueries({
     queries: {
        user: {
           config: { cacheTime: 60000 }, // 1 minute
           query: () => rxQuery({ ... }),
        },
     },
  });
  ```
- **Global default:**
  ```typescript
  globalQueries({ queries: { ... } }, { cacheTime: 120000 }); // 2 minutes
  ```

### Feature flag

You can organize queries by feature using the `featureName` option:

```typescript
globalQueries({ queries: { ... } }, { featureName: 'user' });
```

This helps modularize queries and avoid key collisions.

## Syntax improvement idea

It works pretty well like that, but I will surely deprecated this API, and handle all this functionalities in the incoming `ServerStateStore`

It may looks like that:

```ts
const { withUserQuery, injectUserQuery, withUserMutation, injectUserMutation } = serverStateStore(
  {
    providedIn: 'root',
    persister: localStoragePersister, // optional
    cacheTime: 60000, // optional 1 minute cache
  },
  withMutation('user', () =>
    mutation({
      method: (user: User) => user,
      loader: async ({ params: user }) => user,
    })
  ),
  ({ id }: SignalProxy<{ id: string | undefined }>) =>
    withQuery(
      'user',
      () =>
        query({
          params: id,
          loader: async ({ params: id }) => ({
            id,
            name: 'Romain',
          }),
        }),
      () => ({
        // ... react on the user mutation
      })
    ),
  withUsersServerState()
);
```

- While the current pattern enforce to create one globalQueries for the app, that avoids cached key collision (when used with a persister), it does not share easily mutation. And also, split the query declaration in multiples files (when reacting to mutation).
- This new pattern will enable to create fully declarative and reactive queries, that will help to create more advanced UX pattern.
- It will enable local ServerStateStore and server state composition.
