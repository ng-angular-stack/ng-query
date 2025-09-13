import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  mutation,
  query,
  withMutation,
  withQuery,
} from '@ng-query/ngrx-signals';
import { signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { ApiService, User } from './api.service';
import { StatusComponent } from '../../ui/status.component';

const Store = signalStore(
  withState({
    id: '1',
  }),
  withProps(() => ({
    _api: inject(ApiService),
    apiReturnError: inject(ApiService).updateError.asReadonly(),
  })),
  withMutation('user', ({ _api }) =>
    mutation({
      method: (user: User) => user,
      loader: ({ params: user }) => {
        return _api.updateItem(user);
      },
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
          optimisticUpdate: ({ mutationParams }) => mutationParams,
          reload: {
            onMutationError: true,
          },
        },
      },
    })
  ),
  withMethods(({ _api }) => ({
    toggleApiError: () => _api.updateError.set(!_api.updateError()),
  }))
);

@Component({
  selector: 'app-query-and-mutation-local',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  providers: [Store],
  styleUrls: ['query-and-mutation-local.css'],
  template: `
    <div>
      User
      <app-status [status]="store.userQuery.status()" />
      : @if( store.userQuery.hasValue()) {
      <pre>{{ store.userQuery.value() | json }}</pre>
      }
    </div>
    <button (click)="mutateUserName(store.userQuery.value())">
      Mutate user name
      <app-status [status]="store.userMutation.status()" />
    </button>

    <div>
      <label for="toggleApiError">Toggle API Error</label>
      <input
        type="checkbox"
        name="toggleApiError"
        [value]="store.apiReturnError()"
        (change)="store.toggleApiError()"
      />
    </div>
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
