# Pagination: place holder data

## Import

`import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';`

## What is does ?

Insert it inside `queryById` / `rxQueryById`.

Use it to display the previous page data during the incoming page loading
It also expose currentPageData / currentPageStatus / isPlaceholderData

## Example

```ts
withQueryById('users', (store) =>
  queryById(
    {
      params: store.pagination,
      identifier: (params) => `${params.page}-${params.pageSize}`,
      // ...
    },
    insertPaginationPlaceholderData
  )
);

usersQueryById.currentPageData; // Signal<User[] | undefined>
```
