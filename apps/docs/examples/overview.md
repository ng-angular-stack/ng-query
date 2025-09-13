# Examples

## Query & Mutation inside signal store (local)

- Display a user
- Toggle Api error via a checkbox
- Mutate the user data
  - Optimistic update the query state on mutate
  - Reload if the API return an error

## A cached global query and mutation

- Display a user by using a cached global query
- Plug the userId from the signal store to the global query
- Toggle Api error via a checkbox
- Mutate the user data
  - Optimistic update the query state on mutate
  - Reload if the API return an error

## A cached global query used without store

- Display a user by using a cached global query without injecting a store (`injectUserQuery`)
- Plug the userId from the component input to the global query
- Use `preservePreviousValue` to preserve the previous user data during the new one to being fetch (may avoid flickering data)
- Use `waitForParamsSrcToBeEqualToPreviousValue` to wait for the userId to be retrieved from the url before retrieve the data from cache (eg: if the cached user has id 2, and now the page userId is 3)

## A cached global query (byId) used without store

- Display a user by using a cached global query without injecting a store (`injectUserQueryById`)
  - Compare to a simple `query` This enable to cache all visited user page (instead of the last user visited when using `query`)
- Plug the userId from the component input to the global query
- Use `insertPlaceholderData` to display the data from the previous visited page while the new user data load

## List with pagination (Local query)

- Display a paginated list of user (previous page, next page, page size)
- Use `insertPaginationPlaceholderData` to easily display the current page data and a placeholder data while the next page data is loading

## List with cached pagination (Global query)

- Display a paginated list of user (previous page, next page, page size)
- Using a cached (from localStorage) global query, that is plugged inside a signalStore
- Use `insertPaginationPlaceholderData` to easily display the current page data and a placeholder data while the next page data is loading

## List with pagination and granular mutations

- Display a paginated list of user (previous page, next page, page size)
- Using a cached (from localStorage) global query, that is plugged inside a signalStore
- Edit user name concurrently (click on the `Update` button of multiples items)

## Display X independents resources to display and granular mutations

- Available soon
- Display a dynamic list of selected user
- Apply granular mutation on selected user
- Pokemon
