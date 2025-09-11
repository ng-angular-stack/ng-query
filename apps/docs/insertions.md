# Insertions: Extend and Compose Query Features

Insertions are a powerful mechanism to extend the behavior and shape of your queries in a composable and type-safe way.

## What are Insertions?

- **Custom Properties:** Insertions allow you to add custom properties to the query result, making it easy to expose additional state or computed values alongside your query data.
- **Custom Side Effects:** Insertions can be used to add custom side effects to the query. For example, you can implement features like `preservePreviousValue` to keep showing the previous value while a new value is loading.
- **Composable:** Insertions are composable. Each insertion can access the results of previous insertions, allowing you to build up complex behaviors from simple, reusable functions.
- **Reusable:** Insertion functions can be easily reused across different queries, promoting DRY and maintainable code.
- **Runs in Injection Context:** Insertions are executed within Angular's injection context, allowing you to use dependency injection and access Angular services seamlessly.

## Example: Adding Two Insertions

Here is a simple example showing how to add two insertions to a query:

```ts
const { injectUserQuery } = globalQueries({
  queries: {
    user: {
      query: () =>
        query(
          {
            // ...
            loader: () => getItems(), // Promise<Item[]>
          },
          // Add total property to the query
          ({ resource }) => ({
            total: computed(() => (resource.hasValue() ? resource.value() : 0)),
          }),
          // Add an effect to log the query result and total
          ({ resource, insertions: { total } }) => {
            effect(() => {
              console.log('items', resource.hasValue() ? resource.value() : undefined);
              console.log('total', total());
            });
            return {};
          }
        ),
    },
  },
});

// Access to total
const userQuery = injectUserQuery();
userQuery.total(); // number
```

## Best Practices

- **Do not use insertions to interact with other queries or mutations.** Insertions are designed to extend the current query or mutation only.

## Bundle Size Consideration

The insertions are inside Secondary Entry Points libs. This means you only import what you use, helping to keep your bundle size small.

Like: `import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';`

::: info
If you have an idea for a useful insertion (such as a new side effect or property), please consider opening a PR or feature request! Community contributions help make this library more powerful and flexible for everyone.
:::
