# Rx Insert Observables

## Import

`import { rxInsertObservables } from '@ng-query/ngrx-signals-rxjs/rx-insertions/rx-insert-observables';`

## Aim

Add `data$` that will emit all the values from the `resource` / `resourceById` wrapped into an observable.

It may be useful if app still rely on observable

## Usage

```ts
// query
const { injectUserQuery } = globalQueries({
  queries: {
    user: {
      query: () =>
        query(
          {
            params: () => ({ id: '1' }),
            loader: async ({ params }) => {
              await wait(10000);
              return { name: 'User' + params.id };
            },
          },
          rxInsertObservables
        ),
    },
  },
});

const result = injectUserQuery().data$;
// values
// { value: undefined, status: 'loading', error: undefined },
// { value: { name: 'User1' }, status: 'resolved', error: undefined }

// QueryById
const { injectUserQueryById } = globalQueries({
  queriesById: {
    user: {
      queryById: () =>
        queryById(
          {
            params: () => ({
              id: '1',
            }),
            identifier: (params) => params.id,
            loader: async ({ params }) => {
              await wait(10000);
              return {
                id: params.id,
                name: 'Test Name',
              };
            },
          },
          rxInsertObservables
        ),
    },
  },
});

const result = injectUserQueryById();
const finalResult = result.data$;
// values
// { id: '1', value: undefined, status: 'loading', error: undefined },
// {
//   id: '1',
//   value: { id: '1', name: 'Test Name' },
//   status: 'resolved',
//   error: undefined
// }
```
