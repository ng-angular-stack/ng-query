# Query/Mutation Effects

This tool provides flexible ways to handle side effects between queries and mutations, such as optimistic updates, patching, and reloading. These can be configured either imperatively (via options \_> `queriesEffects` in `withMutation`) or declaratively (via the `on` property in `withQuery`).

## Declarative Effects (Recommended)

Declarative configuration is done inside `withQuery` using the `on` property. This allows you to declare how queries should react to mutations. (The mutations should be declared before the query)

### Example: Declarative Query Effects

```typescript
withMutation("user", ...),
withQuery(
	'user',
	() => query({ ... }),
	(store) => ({
		on: {
			userMutation: {
				optimisticUpdate: ({ mutationParams }) => mutationParams,
				optimisticPatch: {
					name: ({ mutationParams }) => mutationParams.name,
				},
				reload: {
					onMutationLoading: true,
					onMutationResolved: true,
				},
			},
		},
	})
)
```

**Supported Effects:**

- `optimisticUpdate`: Perform an optimistic update of the query value - when the mutation start.
- `update`: Perform an update of the query value - when mutation is resolved
- `optimisticPatch`: Optimistic patch specific fields in the query value - when the mutation start
- `patch`: Patch specific fields in the query value - when mutation is resolved
- `reload`: Reload the query - when the mutation is loading or resolved or error

**Required field**

- `filter`: Target specific queries by identifier (return `true` to apply the effect). (Mandatory when working with a `queryById` or `mutationById`)

## Data Flow Principle - Best Practices

Query state represents the server state in your application. When a query state changes, any associated client state is automatically updated. For the most efficient workflow:

1. Associate query results with dedicated client state
2. When performing mutations, use optimistic updates on the query state
3. Let the changes automatically flow to the client state

This approach maintains a single source of truth and ensures consistency between server and client representations.

## Imperative Effects

:::warning
Unless someone like this pattern, I think I will remove these imperative effects from mutation, in favor of declarative effects.
So let me know if you need it or not !
:::

Imperative configuration is done by passing an options object to `withMutation`. This allows you to specify how mutations affect queries directly.

### Example: Imperative Mutation Effects

```typescript
withMutation(
	'user',
	(store) => mutation({ ... }),
	() => ({
		queriesEffects: {
			userQueryById: {
				optimistic: ({ mutationParams, queryResource, queryIdentifier }) => ({
					...queryResource.value(),
					...mutationParams,
				}),
				optimisticPatch: {
					email: ({ mutationParams }) => mutationParams.email,
				},
				reload: {
					onMutationLoading: true,
					onMutationResolved: true,
				},
			},
		},
	})
)
```

**Supported Effects:**

- `optimisticUpdate`: Perform an optimistic update of the query value - when the mutation start.
- `optimisticPatch`: Optimistic patch specific fields in the query value - when the mutation start
- `reload`: Reload the query - when the mutation is loading or resolved or error

**Required field**

- `filter`: Target specific queries by identifier (return `true` to apply the effect). (Mandatory when working with a `queryById` or `mutationById`)
