import { rxResource } from '@angular/core/rxjs-interop';
import { signalStore, withState, withHooks } from '@ngrx/signals';
import { of, lastValueFrom } from 'rxjs';
import { resourceById } from '../resource-by-id';
import { resource } from '@angular/core';
import { withQueryById } from './archive/with-query-by-id';
import { withQuery } from './with-query';

type UserTest = {
  id: string;
  name: string;
  email: string;
};

const r = rxResource({
  params: () => ({
    page: 1,
    pageSize: 10,
  }),
  stream: ({ params }) => {
    return of<UserTest>({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@a.com',
    });
  },
});

const storeTest = signalStore(
  withState({
    pagination: {
      page: 1,
      pageSize: 10,
    },
    selectedUserId: undefined as string | undefined,
  }),
  withQuery('users', (store) =>
    rxResource({
      params: store.pagination,
      stream: ({ params }) => {
        return of<UserTest>({
          id: '1',
          name: 'John Doe',
          email: 'john.doe@a.com',
        });
      },
      defaultValue: {
        id: '1',
        name: 'John Doe',
        email: '',
      },
    })
  ),
  withQueryById('usersById', (store) =>
    resourceById({
      params: store.selectedUserId,
      loader: (params) => {
        return lastValueFrom(
          of({
            id: '1',
            name: 'John Doe',
            email: 'test@a.com',
          })
        );
      },
      identifier: (params) => params,
    })
  ),
  withHooks((store) => ({
    onInit: () => {
      const test = store.users;
      const test2 = store.usersById()['1']?.value;
      //    ^?
      const effect = store._usersEffect;

      console.log('Store initialized', store);
    },
    onDestroy: () => {
      console.log('Store destroyed');
    },
  }))
);

const queryTest = withQuery('users', (store) =>
  resource({
    loader: () => {
      return lastValueFrom(
        of<UserTest>({
          id: '1',
          name: 'John Doe',
          email: 'john.doe@a.com',
        })
      );
    },
    defaultValue: {
      id: '1',
      name: 'John Doe',
      email: '',
    },
  })
);
