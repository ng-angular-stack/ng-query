# Examples

## Query & Mutation inside signal store (local)

- Display a user
- Toggle Api error via a checkbox
- Mutate the user data
  - Optimistic update the query state on mutate
  - Reload if the API return an error

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Fquery-and-mutation-local%2Fquery-and-mutation-local.ts">Example
</a> 👉 Select the "Query and Mutation (Local)" example in the dropdown

## A cached global query and mutation

- Display a user by using a cached global query
- Plug the userId from the signal store to the global query
- Toggle Api error via a checkbox
- Mutate the user data
  - Optimistic update the query state on mutate
  - Reload if the API return an error

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Fglobal-query-and-mutation%2Fglobal-query-and-mutation.ts">Example
</a> 👉 Select the "Global Query and Mutation" example in the dropdown

## A cached global query used without store

- Display a user by using a cached global query without injecting a store (`injectUserQuery`)
- Plug the userId from the component input to the global query
- Use `preservePreviousValue` to preserve the previous user data during the new one to being fetch (may avoid flickering data)
- Use `waitForParamsSrcToBeEqualToPreviousValue` to wait for the userId to be retrieved from the url before retrieve the data from cache (eg: if the cached user has id 2, and now the page userId is 3)

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Fno-store%2Fno-store.ts">Example
</a> 👉 Select the "No Store (User ID: 1)" example in the dropdown

## A cached global query (byId) used without store

- Display a user by using a cached global query without injecting a store (`injectUserQueryById`)
  - Compare to a simple `query` This enable to cache all visited user page (instead of the last user visited when using `query`)
- Plug the userId from the component input to the global query
- Use `insertPlaceholderData` to display the data from the previous visited page while the new user data load

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Fno-store-by-id%2Fno-store-by-id.ts">Example
</a> 👉 Select the "No Store By ID (User ID: 1)" example in the dropdown

## List with pagination (Local query)

- Display a paginated list of user (previous page, next page, page size)
- Keep in memory the loaded data per page
- Use `insertPaginationPlaceholderData` to easily display the current page data and a placeholder data while the next page data is loading
- Use `insertPrefetchNextData`
  - will fetch the next page once the current page is loaded.
  - use `(mouseenter)` and `prefetchNext` to start the prefetch of the next page before the user click on the button.

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Flist-with-pagination%2Flist-with-pagination.ts">Example
</a> 👉 Select the "List with Pagination" example in the dropdown

## List with cached pagination (Global query)

- Display a paginated list of user (previous page, next page, page size)
- Keep in memory the loaded data per page
- Using a cached (from localStorage) global query, that is plugged inside a signalStore
- Use `insertPaginationPlaceholderData` to easily display the current page data and a placeholder data while the next page data is loading

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Flist-with-pagination-global%2Flist-with-pagination.ts">Example
</a> 👉 Select the "List with Pagination (Global)" example in the dropdown

## List with pagination and granular mutations

- Display a paginated list of user (previous page, next page, page size)
- Using a cached (from localStorage) global query, that is plugged inside a signalStore
- Edit user name concurrently (click on the `Update` button of multiples items)

<a href="https://stackblitz.com/github/ng-angular-stack/ng-query-demo?file=src%2Fapp%2Fpages%2Flist-with-pagination-global%2Flist-with-pagination.ts">Example
</a> 👉 Select the "Pagination Granular Mutations" example in the dropdown

## Display X independents resources to display and granular mutations

- Available soon
- Display a dynamic list of selected user
- Apply granular mutation on selected user
- Pokemon
