# Insert Factory

An helper that help you to create custom insertion function.

:::warning

- The first parameter is used to be the expected return type where the insertion is added
- It does not handle generic type parameter
  :::

## Example

```ts
const myInsertion = insertionFactory(({ myParam }: { myParam: string | undefined }) => {
  // do something with myParam
  return { myOutput: myParam ? myParam + '!' : 'default!' };
});

query(
 { ... },
 //             👇 Access to all available data with type safety
  myInsertion(({resource}) =>
  ({ myParam: resource.value() }) // 👈 Expect to be of the type of your first parameter
  )
)

myQuery.myOutput // string

```

## 2nd parameter : Access to the query/mutation context

It is possible to access to the context in order to use the resourceById or resource...
Add a second parameter to the custom function.

- `context` type is `InsertFactoryAllContext`

:::warning

- For now it is not fully correctly typed, TS does not handle correctly the types
- The generics parameters does not works
  :::

Example:

```ts
export const insertPrefetchDataEffect = insertFactory(
  (
    firstParam: {
      hasNextData: Signal<boolean>;
      nextDataIdentifier: () => string;
    },
    context
  ) => {
    const { resourceById, identifier, resourceParamsSrc } = context as DefaultInsertionByIdParams;
    // do some stuff
    return {
      // ...
    };
  }
);
```
