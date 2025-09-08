# `insertPaginationPlaceholderData`

The `insertPaginationPlaceholderData` insertion improves paginated data queries by providing placeholder data for the current page while new data is loading. This prevents empty states and allows the previous page's data to be displayed until the new page's data is available.

## Features

- **Placeholder Data During Loading:** When navigating between pages, if the new page's data is still loading, the previous page's data is shown as a placeholder.
- **Current Page Status:** Exposes the loading status of the current page.
- **Seamless Transitions:** Avoids flickering or empty states when switching pages.

## Usage

Integrate `insertPaginationPlaceholderData` with your paginated query using `queryById` or similar APIs. The insertion provides the following outputs:

- `currentPageData`: The data for the current page, or placeholder data if loading.
- `currentPageStatus`: The status of the current page (`loading`, `resolved`, etc.).
- `isPlaceHolderData`: Boolean indicating if placeholder data is being shown.

### Example

```typescript
const { injectUsersQueryById } = globalQueries({
  queriesById: {
    users: {
      queryById: () =>
        queryById(
          {
            params: pagination,
            loader: async ({ params: pagination }) => {
              await wait(10000);
              return Promise.resolve([
                {
                  name: 'User' + pagination,
                },
              ]);
            },
            identifier: (params) => params,
          },
          insertPaginationPlaceholderData
        ),
    },
  },
});
const userQuery = injectUsersQueryById();

userQuery.currentPageData();
userQuery.currentPageStatus();
```

## When to Use

Use this insertion when you want to provide a smoother experience for paginated data, especially in scenarios where loading new pages may take time and you want to avoid showing empty states.
