import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ApiService } from './api.service';
import { globalQueries, SignalProxy } from '@ng-query/ngrx-signals';
import { rxQueryById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { StatusComponent } from '../../ui/status.component';
import { localStoragePersister } from '@ng-query/ngrx-signals/persisters/local-storage';

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
  withProps(() => ({
    api: inject(ApiService),
  })),
  withState({
    pagination: {
      page: 1,
      pageSize: 4,
    },
  }),
  withUsersQueryById((store) => ({
    setQuerySource: () => ({ pagination: store.pagination }),
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
  selector: 'app-list-with-pagination',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  templateUrl: './list-with-pagination.html',
  styleUrls: ['./list-with-pagination.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserListServerStateStore],
})
export default class ListWithPagination {
  protected readonly userListServerStateStore = inject(
    UserListServerStateStore
  );

  updatePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.userListServerStateStore.updatePageSize(value);
  }
}
