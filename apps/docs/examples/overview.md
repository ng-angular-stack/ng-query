# Examples

## Query & Mutation inside signal store

- Display a user
- Mutate the user data

## A cached global query and mutation

- Display a user by using a cached global query
- Plug the userId from the signal store to the global query

## A cached global query used without store

- Display a user by using a cached global query
- Plug the userId from the component input to the global query

## List with pagination (Local query)

- Display a paginated list of user (previous page, next page, page size)

## List with cached pagination (Global query)

- Display a paginated list of user (previous page, next page, page size)
- Using a cached (from localStorage) global query, that is plugged inside a signalStore

## List with pagination and granular mutations

- Display a paginated list of user (previous page, next page, page size)
- Using a cached (from localStorage) global query, that is plugged inside a signalStore
- Edit user name concurrently
