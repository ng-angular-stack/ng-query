# Parallel Queries & Mutations

## Overview

`withQueryById` and `withMutationById` are specialized versions of `withQuery` and `withMutation` designed for handling collections of resources identified by a unique key (such as an ID). They work with `queryById`/`rxQueryById` and `mutationById`/`rxMutationById` respectively.

## Key Concepts

- **identifier:**

  - Both `queryById` and `mutationById` require an `identifier` property to specify how each resource is grouped (e.g., by `id`).
  - This enables parallel management of multiple resources (e.g., users, items) in a single store.

- **filter:**
  - When reacting to a queryById or mutationById, you should use a `filter` function to determine which resource(s) should be affected by an effect (optimistic update, patch, reload, etc).
  - The effect is only applied if `filter` returns `true` for the given identifier.

::: danger
`queryById`, `rxQueryById` `mutationById` and `rxMutationById` relies on signal source, only the last value emitted in very short period of time is considered. (A possible evolution is creating a `withRxMutationById` associated with `rxMutationById`that relies on observables, the same for queries).
For more [info on this limitation](https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1)
:::

## Usage Example

### Store Setup

```typescript
const Store = signalStore(
  withState({ usersFetched: [] as User[], selectedUserId: undefined as string | undefined }),
  withQueryById("user", (store) =>
    queryById({
      params: store.selectedUserId,
      loader: ({ params }) => fetchUser(params),
      identifier: (params) => params,
    }),
    () => {
        associatedClientState: {
            usersFetched: ({
              queryResource,
            }) => {
              return [
                ...store
                  .usersFetched()
                  .filter((user) => user.id !== queryResource.value()?.id),
                queryResource.value(),
              ];
            },
          },
    }
  ),
  withMutationById(
    "user",
    () =>
      mutationById({
        method: (user: User) => user,
        loader: ({ params: user }) => updateUser(user),
        identifier: ({ id }) => id,
      }),
    () => ({
      queriesEffects: {
        userQueryById: {
          optimistic: ({ queryResource }) => ({
            ...queryResource.value(),
            ...mutationParams,
          }),
          reload: {
            onMutationError: true,
          },
          filter: ({ mutationParams, queryIdentifier }) => queryIdentifier === mutationParams.id,
        },
      },
    })
  )
);
```

### Reacting to Parallel Mutations

When using effects (optimistic update, patch, reload), always use a `filter` to target the correct resource(s):

```typescript
withMutationById(
	'user',
	() => mutationById({ ... }),
	() => ({
		queriesEffects: {
			userQueryById: {
				optimisticPatch: {
					name: ({ mutationParams }) => mutationParams.name,
				},
				filter: ({ mutationParams, queryIdentifier }) => queryIdentifier === mutationParams.id,
			},
		},
	})
)
```

## Component Usage Example

You can access a specific resource by ID in your component:

```typescript
const user5 = store.userQueryById()["5"];
if (user5?.hasValue()) {
  // Use user5 data
}

// for the mutation
store.userMutationById()["5"]?.hasValue();

// To mutate a specific user
store.mutateUser({ id: "5", name: "New Name", email: "new@example.com" });
```

## Summary

- Use `withQueryById`/`withMutationById` for collections of resources.
- Always provide an `identifier` function.
- Use `filter` in effects to target the correct resource(s).
- Access and mutate resources by ID in your components for fine-grained control.
