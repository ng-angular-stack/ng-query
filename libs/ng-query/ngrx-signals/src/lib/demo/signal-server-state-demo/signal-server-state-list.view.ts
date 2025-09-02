import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { ServerStateStore } from '../../server-state-store';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { withQueryById } from '../../with-query-by-id';
import { rxQueryById } from '../../rx-query-by-id';
import { withServices } from './util';
import { ApiService } from './api.service';
import { withMutationById } from '../../with-mutation-by-id';
import { rxMutationById } from '../../rx-mutation-by-id';
import { rxResource } from '@angular/core/rxjs-interop';

export type User = {
  id: string;
  name: string;
};

const UserListServerStateStore = signalStore(
  {
    providedIn: 'root',
  },
  withServices(() => ({
    api: inject(ApiService),
  })),
  withState({
    pagination: {
      page: 1,
      pageSize: 4,
    },
  }),
  withMutationById('userName', (store) =>
    rxMutationById({
      method: (user: User) => user,
      stream: ({ params: user }) => store.api.getItemById(user.id),
      identifier: (params) => params.id,
    })
  ),
  withQueryById(
    'users',
    (store) =>
      rxQueryById({
        params: store.pagination,
        identifier: (params) => params.page,
        stream: ({ params }) =>
          store.api.getDataList$({
            page: params.page,
            pageSize: params.pageSize,
          }),
      }),
    () => ({
      on: {
        userNameMutationById: {
          filter: ({ queryResource, mutationIdentifier }) =>
            queryResource
              .value()
              .some((user) => user.id === mutationIdentifier),
          optimisticUpdate: ({ mutationParams, queryResource }) =>
            queryResource
              .value()
              .map((user) =>
                user.id === mutationParams.id
                  ? { ...user, name: mutationParams.name }
                  : user
              ),
          reload: {
            onMutationError: true,
            onMutationResolved: true,
          },
        },
      },
    })
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
    updateUserWithARandomName: (user: User) =>
      store.mutateUserName({
        id: user.id,
        name: `Random Name ${Math.floor(Math.random() * 100)}`,
      }),
  })),
  withComputed((store) => ({
    currentUserList: computed(
      () => store.usersQueryById()[store.pagination.page()]?.value() ?? []
    ),
    currentUserListStatus: computed(
      () => store.usersQueryById()[store.pagination.page()]?.status() ?? {}
    ),
  }))
);

@Component({
  selector: 'app-server-state-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signal-server-state-list.view.html',
  styleUrls: ['./signal-server-state-list.view.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignalServerStateListViewComponent {
  protected readonly userListServerStateStore = inject(
    UserListServerStateStore
  );

  sourcePage = signal(1);
  nextPage = () => this.sourcePage.update((page) => page + 1);
  previousPage = () => this.sourcePage.update((page) => page - 1);

  testResource = rxResource({
    params: this.sourcePage,
    stream: ({ params: page }) => {
      return this.userListServerStateStore.api.getDataList$({
        page,
        pageSize: 4,
      });
    },
  });

  constructor() {
    effect(() => {
      console.log(
        'userListServerStateStore',
        this.userListServerStateStore.usersQueryById()
      );
      const page1 = this.userListServerStateStore.usersQueryById()[1];
      console.log('page1', page1?.value());
    });
  }
}
