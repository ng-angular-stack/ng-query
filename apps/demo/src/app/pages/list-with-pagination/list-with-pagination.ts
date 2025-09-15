import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withServices } from './util';
import { ApiService } from './api.service';
import { withQueryById } from '@ng-query/ngrx-signals';
import { rxQueryById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { insertPrefetchData } from '@ng-query/ngrx-signals/insertions/insert-prefetch-next-data';
import { StatusComponent } from '../../ui/status.component';
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
  withQueryById('users', ({ pagination, api }) =>
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
      insertPaginationPlaceholderData,
      insertPrefetchData(
        ({
          insertions: { currentPageData, isPlaceHolderData },
          resourceParamsSrc,
        }) => ({
          hasNextData: computed(
            () => !isPlaceHolderData() && !!currentPageData()?.length
          ),
          nextParams: () => {
            const params = resourceParamsSrc();
            if (!params) {
              return undefined;
            }
            return {
              ...params,
              page: params.page + 1,
            };
          },
        })
      )
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
