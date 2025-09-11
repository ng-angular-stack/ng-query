import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  mutation,
  query,
  withMutation,
  withQuery,
} from '@ng-query/ngrx-signals';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { ApiService, User } from './api.service';

const Store = signalStore(
  withState({
    id: '1',
  }),
  withProps(() => ({
    _api: inject(ApiService),
  })),
  withMutation('user', ({ _api }) =>
    mutation({
      method: (user: User) => user,
      loader: ({ params: user }) => _api.updateItem(user),
    })
  ),
  withQuery(
    'user',
    ({ id, _api }) =>
      query({
        params: id,
        loader: ({ params: id }) => _api.getItemById(id),
      }),
    () => ({
      on: {
        userMutation: {
          optimisticUpdate: ({ mutationParams }) => {
            console.log('mutationParams', mutationParams);
            return mutationParams;
          },
        },
      },
    })
  )
);

@Component({
  selector: 'app-query-and-mutation-local',
  standalone: true,
  imports: [CommonModule],
  providers: [Store],
  template: `
    User {{ store.userQuery.status() }} : @if( store.userQuery.status() ===
    'resolved') {
    {{ store.userQuery.value() | json }}

    }
    <button>Mutate user name</button>
  `,
})
export default class QueryAndMutationLocal {
  protected readonly store = inject(Store);
  protected mutateUserName(user: User) {
    this.store.mutateUser({
      ...user,
      name: user.name + '-',
    });
  }
}
