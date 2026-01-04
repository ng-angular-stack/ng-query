import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiService } from './api.service';
import {
  queryById,
  craftInject,
  craft,
  craftMutations,
  mutation,
  craftQuery,
  query,
} from '@ng-query/ngrx-signals';
import { rxMutationById } from '@ng-query/ngrx-signals-rxjs';
import { insertPaginationPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { StatusComponent } from '../../../ui/status.component';

export type User = {
  id: string;
  name: string;
};

const { injectUserListCraft } = craft(
  {
    name: 'UserList',
    providedIn: 'root',
  },
  craftInject(() => ({
    ApiService,
  })),
  // craftQueryParams(
  //   'pagination',
  //   () => ({
  //     page: {
  //       fallbackValue: 1,
  //       parse: (value: string) => parseInt(value, 10),
  //       serialize: (value: unknown) => String(value),
  //     },
  //     pageSize: {
  //       fallbackValue: 4,
  //       parse: (value: string) => parseInt(value, 10),
  //       serialize: (value: unknown) => String(value),
  //     },
  //   }),
  //   {
  //     methods: ({ queryParams }) => ({
  //       nextPage: () => ({
  //         ...queryParams(),
  //         page: queryParams().page + 1,
  //       }),
  //       previousPage: () => ({
  //         ...queryParams(),
  //         page: Math.max(1, queryParams().page - 1),
  //       }),
  //       setPageSize: (size: number) => ({
  //         ...queryParams(),
  //         page: 1,
  //         pageSize: size,
  //       }),
  //     }),
  //   }
  // ),
  craftMutations(({ apiService }) => ({
    user: mutation({
      method: (user: User) => user,
      identifier: ({ id }) => id,
      loader: ({ params: user }) => apiService.updateItem(user),
    }),
  }))
  // craftQuery(
  //   'users',
  //   ({ pagination, apiService }) =>
  //     query({
  //       params: pagination,
  //       identifier: ({ page, pageSize }) => `${page}-${pageSize}`,
  //       loader: ({ params: pagination }) => apiService.getDataList(pagination),
  //     }),
  //   {
  //     on: {
  //       userMutation: {
  //         filter: ({ queryResource, mutationParams }) =>
  //           queryResource.hasValue() &&
  //           queryResource.value().some((item) => item.id === mutationParams.id),
  //         optimisticUpdate: ({ queryResource, mutationParams }) => {
  //           return queryResource
  //             .value()
  //             .map((item) =>
  //               item.id === mutationParams.id ? mutationParams : item
  //             );
  //         },
  //         reload: {
  //           onMutationError: true,
  //         },
  //       },
  //     },
  //   }
  // )
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
  protected readonly store = injectUserListCraft();

  updatePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    // this.store.setPaginationQueryParams(value);
  }

  protected mutateUserName(user: User) {
    // this.store.mutateUserById({
    //   ...user,
    //   name: user.name + '-',
    // });
  }
}
