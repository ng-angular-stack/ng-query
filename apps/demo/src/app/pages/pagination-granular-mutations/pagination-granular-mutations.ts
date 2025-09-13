import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withServices } from './util';
import { ApiService } from './api.service';
import {
  globalQueries,
  localStoragePersister,
  SignalProxy,
  withMutationById,
} from '@ng-query/ngrx-signals';
import { rxMutationById, rxQueryById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { StatusComponent } from '../../ui/status.component';

export type User = {
  id: string;
  name: string;
};

const { withUsersQueryById } = globalQueries(
  {
    queriesById: {
      users: {
        queryById: (
          {
            pagination,
          }: SignalProxy<{ pagination: { page: number; pageSize: number } }>,
          api = inject(ApiService)
        ) =>
          rxQueryById(
            {
              params: pagination,
              identifier: (params) => `${params.page}-${params.pageSize}`,
              stream: ({ params }) =>
                api.getDataList$({
                  page: params.page,
                  pageSize: params.pageSize,
                }),
            },
            insertPaginationPlaceholderData
          ),
      },
    },
  },
  {
    featureName: 'list-with-pagination-global',
    persister: localStoragePersister,
  }
);

const UserListServerStateStore = signalStore(
  withServices(() => ({
    api: inject(ApiService),
  })),
  withState({
    pagination: {
      page: 1,
      pageSize: 4,
    },
  }),
  withMutationById('user', (store) =>
    rxMutationById({
      method: (user: User) => user,
      identifier: ({ id }) => id,
      stream: ({ params: user }) => store.api.updateItem(user),
    })
  ),
  withUsersQueryById((store) => ({
    setQuerySource: () => ({ pagination: store.pagination }),
    on: {
      userMutationById: {
        filter: ({ mutationParams, queryResource }) =>
          queryResource.value().some((user) => user.id === mutationParams.id),
        optimisticUpdate: ({ queryResource, mutationParams: userMutated }) =>
          queryResource
            .value()
            .map((user) => (user.id === userMutated.id ? userMutated : user)),
      },
    },
  })),
  withMethods((store) => ({
    nextPage: () =>
      patchState(store, (state) => ({
        pagination: {
          ...state.pagination,
          page: state.pagination.page + 1,
        },
      })),
    previousPage: () =>
      patchState(store, (state) => ({
        pagination: {
          ...state.pagination,
          page: state.pagination.page - 1,
        },
      })),
    updatePageSize: (pageSize: number) =>
      patchState(store, () => ({
        pagination: {
          page: 1,
          pageSize: pageSize,
        },
      })),
  }))
);

@Component({
  selector: 'app-pagination-granular-mutations',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  templateUrl: './pagination-granular-mutations.html',
  styleUrls: ['./pagination-granular-mutations.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserListServerStateStore],
})
export default class ListWithPagination {
  protected readonly store = inject(UserListServerStateStore);

  updatePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.store.updatePageSize(value);
  }

  protected mutateUserName(user: User) {
    this.store.mutateUser({
      ...user,
      name: user.name + '-',
    });
  }
}
