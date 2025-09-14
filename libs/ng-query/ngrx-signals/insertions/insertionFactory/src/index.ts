type OneParams<InsertionFn extends (data: any) => any> = InsertionFn extends (
  data: infer Params
) => any
  ? Params
  : never;

/**
 * It helps to create custom insertions
 * **Limitations**:
 * - It only supports one parameter function
 * - It does not support generic parameters
 * **Usage**:
 * ```ts
 * const myInsertion = insertionFactory(({ myParam }: { myParam: string | undefined }) => {
 *   // do something with myParam
 *   return { myOutput: myParam ? myParam + '!' : 'default!' };
 * });
 *
 * // later in the query
 * query(
 *  { ... },
 *  myInsertion(({resource}) => ({ myParam: resource.value() }))
 * )
 *
 */
export function insertFactory<InsertionFn extends (data: any) => unknown>(
  insertion: InsertionFn
) {
  return <T>(entries: (context: T) => OneParams<InsertionFn>) =>
    (data: T) =>
      insertion(entries(data as T)) as ReturnType<InsertionFn>;
}
