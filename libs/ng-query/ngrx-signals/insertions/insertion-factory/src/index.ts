import {
  DefaultInsertionByIdParams,
  DefaultInsertionParams,
} from '@ng-query/ngrx-signals';

type FirstParams<
  InsertionFn extends (data: any, context: InsertFactoryAllContext) => any
> = InsertionFn extends (data: infer Params, context: any) => any
  ? Params
  : never;

/**
 * It helps to create custom insertions
 *
 * **Limitations**:
 * - It only supports one parameter function
 * - It does not support generic parameters
 *
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
export function insertFactory<
  InsertionFn extends (data: any, context: InsertFactoryAllContext) => unknown
>(insertion: InsertionFn) {
  return <T>(entries: (context: T) => FirstParams<InsertionFn>) =>
    (data: T) =>
      insertion(
        entries(data as T),
        data as InsertFactoryAllContext
      ) as ReturnType<InsertionFn>;
}

export type InsertFactoryAllContext =
  | DefaultInsertionParams
  | DefaultInsertionByIdParams;
