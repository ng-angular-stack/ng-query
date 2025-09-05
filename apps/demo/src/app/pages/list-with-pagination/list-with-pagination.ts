import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withServices } from './util';
import { ApiService } from './api.service';
import { withQueryById } from '@ng-query/ngrx-signals';
import { rxQueryById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/insertions/pagination-place-holder-data';

export type User = {
  id: string;
  name: string;
};

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
  withQueryById('users', (store) =>
    rxQueryById(
      {
        params: store.pagination,
        identifier: (params) => params.page,
        stream: ({ params }) =>
          store.api.getDataList$({
            page: params.page,
            pageSize: params.pageSize,
          }),
      },
      insertPaginationPlaceholderData
    )
  ),
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
  }))
);

@Component({
  selector: 'app-list-with-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-with-pagination.html',
  styleUrls: ['./list-with-pagination.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserListServerStateStore],
})
export default class ListWithPagination {
  protected readonly userListServerStateStore = inject(
    UserListServerStateStore
  );
}
