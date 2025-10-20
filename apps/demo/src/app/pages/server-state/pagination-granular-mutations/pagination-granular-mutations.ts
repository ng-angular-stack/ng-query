import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiService } from './api.service';
import {
  queryById,
  serverState,
  usingInject,
  usingMutationById,
  usingQueryById,
  usingQueryParams,
} from '@ng-query/ngrx-signals';
import { rxMutationById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { StatusComponent } from '../../../ui/status.component';

export type User = {
  id: string;
  name: string;
};

const { injectUserListServerState } = serverState(
  usingInject(() => ({
    ApiService,
  })),
  usingQueryParams(
    'pagination',
    () => ({
      page: {
        defaultValue: 1,
        parse: (value: string) => parseInt(value, 10),
        serialize: (value: unknown) => String(value),
      },
      pageSize: {
        defaultValue: 4,
        parse: (value: string) => parseInt(value, 10),
        serialize: (value: unknown) => String(value),
      },
    }),
    {
      methods: {
        nextPage: (state) => ({
          ...state,
          page: state.page + 1,
        }),
        previousPage: (state) => ({
          ...state,
          page: Math.max(1, state.page - 1),
        }),
        setPageSize: (state, size: number) => ({
          ...state,
          page: 1,
          pageSize: size,
        }),
      },
    }
  ),
  usingMutationById('user', ({ apiService }) =>
    rxMutationById({
      method: (user: User) => user,
      identifier: ({ id }) => id,
      stream: ({ params: user }) => apiService.updateItem(user),
    })
  ),
  usingQueryById('users', ({ pagination, apiService }) =>
    queryById(
      {
        params: pagination,
        identifier: ({ page, pageSize }) => `${page}-${pageSize}`,
        loader: ({ params: pagination }) => apiService.getDataList(pagination),
      },
      insertPaginationPlaceholderData
    )
  ),
  {
    name: 'UserList',
  }
);

@Component({
  selector: 'app-pagination-granular-mutations',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  templateUrl: './pagination-granular-mutations.html',
  styleUrls: ['./pagination-granular-mutations.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListWithPagination {
  protected readonly store = injectUserListServerState();

  updatePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.store.setPageSize(value);
  }

  protected mutateUserName(user: User) {
    this.store.mutateUserById({
      ...user,
      name: user.name + '-',
    });
  }
}
