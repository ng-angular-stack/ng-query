# Cache & Persister

:::info
This api may be changed (check the last part for more info)
:::

## Overview

By default, global queries are stored in memory, which means they are lost when the user refreshes the page or navigates away. However, query results can be persisted to storage mechanisms like localStorage to enhance developer and user experience. This persistence layer provides several benefits:

- Preserves data between page reloads
- Reduces unnecessary network requests
- Enables offline functionality
- Improves application startup performance
- Maintains state consistency across browser tabs

## Aim

Persisters allow you to cache query results outside of memory, such as in localStorage, to improve performance, enable offline access, and share data between sessions or tabs. They help ensure that queries do not always need to refetch data from the server, and can restore state quickly.

## Using the localStorage Persister

The `localStoragePersister` is a built-in persister that stores query results in the browser's localStorage. It can be used with global queries to automatically persist and restore query data.

### Example Usage

```typescript
import { localStoragePersister } from '.../local-storage-persister';

const { withUserQuery, injectUserQuery } = globalQueries({
	queries: {
		user: {
			query: () => rxQuery({ ... }),
		},
	},
}, {
	persister: localStoragePersister,
	cacheTime: 60000, // 1 minute cache
});
```

### Features

- **Automatic persistence:** Query results are saved to localStorage when resolved.
- **Cache expiration:** You can set `cacheTime` to control how long cached data is valid.
- **Restoration:** If a valid cached value exists, it is restored automatically when the query is initialized.

---

Persisters are pluggable—other storage mechanisms (IndexedDB, sessionStorage, etc.) can be implemented for advanced use cases.

## Syntax improvement

It works pretty well like that, but I will surely deprecated this API, and handle all this functionalities in the incoming `ServerStateStore`

It may looks like that:

```ts
const { withUserQuery, injectUserQuery, withUserMutation, injectUserMutation } = serverStateStore(
  {
    providedIn: 'root',
    persister: localStoragePersister,
    cacheTime: 60000, // 1 minute cache
  },
  withMutation('user', () =>
    mutation({
      method: (user: User) => user,
      loader: async ({ params: user }) => user,
    })
  ),
  withQuery(
    'user',
    () =>
      query({
        params: () => '1',
        loader: async ({ params }) => ({
          id: params,
          name: 'Romain',
        }),
      }),
    () => ({
      // ... react on the user mutation
    })
  ),
  withUsersServerState()
);
```

- It will enable to create more advanced UX pattern.
- It will enable local ServerStateStore and server state composition.
