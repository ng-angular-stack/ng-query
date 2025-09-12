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
  imports: [CommonModule],
  providers: [Store],
  styleUrls: ['query-and-mutation-local.css'],
  template: `
    <div>
      User
      <ng-container
        *ngTemplateOutlet="
          statusTemplate;
          context: { status: store.userQuery.status() }
        "
      ></ng-container>
      : @if( store.userQuery.hasValue()) {
      <pre>{{ store.userQuery.value() | json }}</pre>
      }
    </div>
    <button (click)="mutateUserName(store.userQuery.value())">
      Mutate user name
      <ng-container
        *ngTemplateOutlet="
          statusTemplate;
          context: { status: store.userMutation.status() }
        "
      ></ng-container>
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

    <ng-template #statusTemplate let-status="status">
      @switch(status) { @case ('idle') {
      <span class="badge-container">
        <span class="status-emoji">🛌</span>
        <span class="badge badge-gray">Idle</span>
      </span>
      } @case ('error') {
      <span class="badge-container">
        <span class="status-emoji error">❌</span>
        <span class="badge badge-red">Error</span>
      </span>
      } @case ('loading') {
      <span class="badge-container">
        <span class="status-emoji loading">⏳</span>
        <span class="badge badge-orange">Loading</span>
      </span>
      } @case ('reloading') {
      <span class="badge-container">
        <span class="status-emoji loading">🔄</span>
        <span class="badge badge-orange">Reloading</span>
      </span>
      } @case ('resolved') {
      <span class="badge-container">
        <span class="status-emoji success">✅</span>
        <span class="badge badge-green">Loaded</span>
      </span>
      } @case ('local') {
      <span class="badge-container">
        <span class="status-emoji">📦</span>
        <span class="badge badge-blue">Local</span>
      </span>
      } @default {
      <span class="badge-container">
        <span class="status-emoji">-</span>
        <span class="badge badge-darkgray">-</span>
      </span>
      } }
    </ng-template>
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
