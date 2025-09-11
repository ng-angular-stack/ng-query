import {
  patchState,
  signalStore,
  withLinkedState,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { withQuery } from './with-query';
import { BehaviorSubject, delay, lastValueFrom, of } from 'rxjs';
import { resource, signal } from '@angular/core';
import { withMutation } from './with-mutation';
import { query } from './query';
import { mutation } from './mutation';

type User = {
  id: string;
  name: string;
  email: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
};
type Category = {
  id: string;
  name: string;
};

const api = {
  bffProductsAndCategories: of({
    products: [
      {
        id: '1',
        name: 'Product 1',
        price: 100,
      },
      {
        id: '2',
        name: 'Product 2',
        price: 200,
      },
    ] satisfies Product[],
    categories: [
      {
        id: '1',
        name: 'Category 1',
      },
    ] satisfies Category[],
  }).pipe(delay(2000)),
  updateCategory: (categoryName: string) =>
    of({
      categoryName,
    }).pipe(delay(2000)),
};

export const StoreWithBFF = signalStore(
  {
    providedIn: 'root',
  },
  withState({
    selectedUserId: '5' as string | undefined,
  }),
  //...
  withQuery('bffProductsAndCategories', (store) =>
    query({
      params: store.selectedUserId,
      loader: ({ params }) => {
        console.log('params', params);
        return lastValueFrom(api.bffProductsAndCategories);
      },
    })
  ),
  withMutation(
    'addCategory',
    () =>
      mutation({
        method: (categoryName: string) => {
          return categoryName;
        },
        loader: ({ params: categoryName }) => {
          return lastValueFrom(api.updateCategory(categoryName));
        },
      }),
    () => ({
      queriesEffects: {
        bffProductsAndCategoriesQuery: {
          optimisticPatch: {
            categories: ({ mutationParams, targetedState }) => {
              return [
                ...(targetedState ?? []),
                { id: `new${mutationParams}`, name: mutationParams },
              ];
            },
          },
          reload: {
            onMutationError: true,
          },
        },
      },
    })
  )
);

export const TestStore = signalStore(
  {
    providedIn: 'root',
  },
  withState({
    pagination: {
      page: 1,
      pageSize: 10,
    },
    selectedUserId: '5' as string | undefined,
    userDetails: {
      stateToPreserve: {
        test: true,
      },
      user: undefined as User | undefined,
      bff: {
        products: [] as Product[],
        categories: [] as Category[],
      },
    },
  }),
  //! Ce qui n'est pas ouf, c'est que ça propose les méthodes de `resource` et pas de `rxResource`
  withQuery('userQueryWithAssociatedClientState', (store) =>
    query({
      params: store.selectedUserId,
      loader: ({ params }) => {
        console.log('params', params);
        return lastValueFrom(
          of({
            id: '1',
            name: 'John Doe',
            email: 'a@a.fr',
          }).pipe(delay(2000))
        );
      },
    })
  ),
  withQuery('bffQueryProductsAndCategories', (store) =>
    query({
      params: store.selectedUserId,
      loader: ({ params }) => {
        console.log('params', params);
        const result = new BehaviorSubject<User | undefined>(undefined);
        return lastValueFrom(api.bffProductsAndCategories.pipe(delay(2000)));
      },
    })
  ),
  withProps(() => {
    const updateUserSrc = signal<User | undefined>(undefined);
    const resourceTest = resource({
      params: updateUserSrc,
      loader: ({ params }) => {
        console.log('params', params);
        return lastValueFrom(of(params).pipe(delay(2000)));
      },
    });

    return {
      updateUserSrc,
      resourceTest,
    };
  }),
  withMutation(
    'userName',
    (store) =>
      mutation({
        method: (userName: string) => {
          console.log('userName', userName);
          return {
            ...store.userDetails().user,
            name: userName,
          };
        },
        loader: ({ params }) => {
          console.log('params', params);
          return lastValueFrom(of(params).pipe(delay(2000)));
        },
      }),
    (store) => ({
      queriesEffects: {
        userQueryWithAssociatedClientStateQuery: {
          optimisticUpdate: ({ mutationParams, queryResource }) => {
            const queryValue = queryResource.value();
            if (!queryValue) {
              throw new Error('Query resource is not available');
            }
            return {
              ...queryValue,
              ...mutationParams,
            };
          },
        },
      },
    })
  ),
  withMutation(
    'addCategory',
    () =>
      mutation({
        method: (category: Category) => category,
        loader: ({ params: { name } }) => {
          console.log('params', name);
          return lastValueFrom(api.updateCategory(name).pipe(delay(2000)));
        },
      }),
    () => ({
      queriesEffects: {
        bffQueryProductsAndCategoriesQuery: {
          optimisticPatch: {
            categories: ({ mutationParams, targetedState }) => [
              ...(targetedState ?? []),
              mutationParams,
            ],
          },
        },
      },
    })
  )
);

export const DeclarativeStore = signalStore(
  { providedIn: 'root' },
  withMutation('userEmail', () =>
    mutation({
      method: ({ id, email }: { id: string; email: string }) => ({
        id,
        email,
      }),
      loader: ({ params }) => {
        return lastValueFrom(
          of({
            id: params.id,
            name: 'Updated Name',
            email: params.email,
          } satisfies User).pipe(delay(2000))
        );
      },
    })
  ),
  withQuery(
    'user',
    () =>
      query({
        params: () => '5',
        loader: async ({ params }) => {
          return lastValueFrom(
            of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            }).pipe(delay(2000))
          );
        },
      }),
    () => ({
      on: {
        userEmailMutation: {
          optimisticPatch: {
            email: ({ mutationParams }) => mutationParams?.email,
          },
        },
      },
    })
  ),
  withLinkedState(({ userQuery }) => ({
    draftUser: () => (userQuery.hasValue() ? userQuery.value() : undefined),
  })),
  withMethods((store) => ({
    updateUserEmail: (email: string) => {
      const draftUser = store.draftUser();
      if (!draftUser) {
        throw new Error('Draft user is not available');
      }
      patchState(store, {
        draftUser: { ...draftUser, email },
      });
    },
  }))
);

// const Store = signalStore(
//   {
//     providedIn: 'root',
//   },
//   withState({
//     selectedUserId: undefined as string | undefined,
//     user: undefined as User | undefined,
//   }),
//   withQuery(
//     'userDetails',
//     (store) =>
//       query({
//         params: store.selectedUserId,
//         loader: ({ params }) =>
//           lastValueFrom(
//             of({
//               id: params,
//               name: 'John Doe',
//               email: 'a@a.fr',
//             }).pipe(delay(2000))
//           ),
//       }),
//     (store) => ({
//       associatedClientState: {
//         path: 'user',
//       },
//     })
//   ),
//   withMutation(
//     'user',
//     (store) =>
//       mutation({
//         method: (user: User) => user,
//         // Or  params: store.user
//         loader: ({ params }) => lastValueFrom(of(params).pipe(delay(2000))),
//       }),
//     (store) => ({
//       queriesEffects: {
//         userDetails: {
//           optimistic: ({ mutationParams }) => mutationParams,
//           reload: {
//             onMutationError: true,
//           },
//         },
//       },
//     })
//   )
// );

// const store = inject(Store);
// const queryStatus = store.userDetailsQuery.status(); // "idle" | "error" | "loading" | "reloading" | "resolved" | "local"
// const queryValue = store.userDetailsQuery.value(); // {  id: string;  name: string;  email: string; }

// const mutationStatus = store.userMutation.status(); // "idle" | "error" | "loading" | "reloading" | "resolved" | "local"
// const mutationValue = store.userMutation.value(); // {  id: string;  name: string;  email: string; }

// store.mutateUser({
//   id: '1',
//   name: 'Jane Doe',
//   email: 'jane.doe@example.com',
// });
