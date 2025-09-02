# ng-query in Signal Store - Overview

If the Angular `resource` are not enough for you, you may appreciate this tool that provide utilities function to handle server state management in declarative and reactive way.

:::info
This tool evolves continuously based on community feedback and needs. The initial version required overcoming significant TypeScript challenges to integrate properly with `signalStore`. Having addressed these foundational typing complexities, this tool is now well-positioned for future enhancements and feature additions.
:::

## Why You May Need This Tool

Signal Store for Server State simplifies complex data operations with features like:

- Declarative optimistic updates for responsive UIs
- Automatic query reloading
- Seamless integration between client and server state
- Centralized management of loading, error, and success states
- Easy to use with CRUD or BFF (backend for frontend)

## Why Signal Store for Server State?

Integrating server state management directly within `signalStore` provides a seamless approach to handling queries and mutations. This integration offers a declarative and reactive pattern that simplifies complex server interactions.

For more advanced scenarios, you can associate client state with query state, leveraging the full power of Signal Store for a unified state management solution that handles both client and server concerns elegantly.

## Current Implementation Details

This implementation is built on Angular's `signals` using a state-driven approach. While this offers a fully synchronous solution with predictable behavior, it comes with certain limitations compared to Observable-based patterns (event driven approach). For more information about the differences between pull-based signals and push-based observables, see this [detailed article](https://dev.to/lcsga/les-signals-angular-ne-remplacent-pas-les-observables-push-vs-pull-4jk1).

> RxJs is optional, but may be required for handling more advanced case (for retry strategy, interval...)

### Quick start overview : Handle server state management inside the `signalStore`

```typescript
import { signalStore, withQuery } from "@ngrx/signals";
import { query } from "./query";

const Store = signalStore(
  withState({
    user: undefined as User | undefined,
    userSelected: undefined as { id: string } | undefined,
  }),
  withMutation(
    "userEmail",
    // 👇 access to the store if needed
    (store) =>
      mutation({
        // 👇 expose a method: store.mutateUserEmail({ id: '5', email:  'mutated@test.com', });
        method: ({ id, email }: { id: string; email: string }) => ({
          id,
          email,
        }),
        loader: ({ params }) => store._api.updateEmail(params),
      })
  ),
  withQuery(
    "user",
    // 👇 access to the store
    (store) =>
      query({
        params: store.userSelected,
        loader: ({ params: { id } }) => store._api.getUser(id),
      }),
    // 👇 access to the store if needed
    (store) => ({
      associatedClientState: {
        user: true, // will update the state.user to with the fetchUser data
      },
      on: {
        userEmailMutation: {
          // 👇 Perform optimistic update each time the mutation is loading
          optimisticUpdate: ({ queryResource, mutationParams }) => {
            return {
              ...queryResource.value(),
              email: mutationParams.email,
            };
          },
          // 👇 Perform optimistic patch each time the mutation is loading
          optimisticPatch: {
            email: ({ mutationParams }) => mutationParams?.email,
          },
          reload: {
            onMutationError: true, //👈 Reload the query if the mutation failed
          },
        },
      },
    })
  )
);

// Inject the store and use the query resource
const store = inject(Store);
// store.userQuery (expose the `ResourceRef API`)
const user = store.userQuery.value(); // Access the fetched user
const status = store.userQuery.status(); // 'idle', 'loading', 'resolved', 'error'
// trigger a mutation
store.mutateUserEmail({ id: "5", email: "mutated@test.com" });
```
