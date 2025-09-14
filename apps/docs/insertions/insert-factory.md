# Insert Factory

An helper that help you to create custom insertion function.

:::warning

- It only accepts one parameter
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
