# Pagination: place holder data

## Import

`import { insertPrefetchNextData } from '@ng-query/ngrx-signals/insertions/insert-prefetch-next-data';`

## Example

```ts
rxQueryById(
  {
    params: pagination,
    identifier: (params) => `${params.page}-${params.pageSize}`,
    stream: ({ params }) =>
      api.getDataList$({
        page: params.page,
        pageSize: params.pageSize,
      }),
  },
  insertPaginationPlaceholderData,
  insertPrefetchNextData(({ insertions: { currentPageData, isPlaceHolderData }, resourceParamsSrc }) => ({
    hasNextData: computed(() => !isPlaceHolderData() && !!currentPageData()?.length),
    nextParams: () => {
      const params = resourceParamsSrc();
      if (!params) {
        return undefined;
      }
      return {
        ...params,
        page: params.page + 1,
      };
    },
  }))
);
```

Usage like:

```html
Next page status: <app-status [status]="userListServerStateStore.usersQueryById.nextResource()?.status() ?? 'idle'" />
```

## Effect

Once the current resource (often the current page) is loaded, it will fetch the next page data.

- `hasNextData` is an observable, and every time it returns `true`, `nextParams` will be called and generate an the next identifier. If their is no matching identifier, a new resource is created otherwise, it just return the existing resource
