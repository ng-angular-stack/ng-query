import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  globalQueries,
  mutation,
  query,
  SignalProxy,
  withMutation,
} from '@ng-query/ngrx-signals';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ApiService, User } from './api.service';
import { StatusComponent } from '../../ui/status.component';
import { localStoragePersister } from '@ng-query/ngrx-signals/persisters/local-storage';

const { withUserQuery } = globalQueries(
  {
    queries: {
      user: {
        query: (
          source: SignalProxy<{ id: string | undefined }>,
          api = inject(ApiService)
        ) =>
          query({
            params: source.id,
            loader: ({ params: id }) => api.getItemById(id),
          }),
      },
    },
  },
  {
    featureName: 'globalQueryAndMutationDemo',
    persister: localStoragePersister,
  }
);

const Store = signalStore(
  withState({
    id: '1' as string | undefined,
  }),
  withProps(() => ({
    _api: inject(ApiService),
  })),
  withComputed(({ _api }) => ({
    apiReturnError: _api.updateError.asReadonly(),
  })),
  withMutation('user', ({ _api }) =>
    mutation({
      method: (user: User) => user,
      loader: ({ params: user }) => {
        return _api.updateItem(user);
      },
    })
  ),
  withUserQuery((store) => ({
    on: {
      userMutation: {
        optimisticUpdate: ({ mutationParams }) => mutationParams,
        reload: {
          onMutationError: true,
        },
      },
    },
    setQuerySource: () => ({
      id: store.id,
    }),
  })),
  withMethods(({ _api }) => ({
    toggleApiError: () => _api.updateError.set(!_api.updateError()),
  }))
);

@Component({
  selector: 'app-global-query-and-mutation',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  providers: [Store],
  styleUrls: ['global-query-and-mutation.css'],
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

    <div>
      <p>
        > Reload the page to see the query result to be retrieved from the cache
      </p>
    </div>
  `,
})
export default class GlobalQueryAndMutation {
  protected readonly store = inject(Store);
  protected mutateUserName(user: User) {
    this.store.mutateUser({
      ...user,
      name: user.name + '-',
    });
  }
}
