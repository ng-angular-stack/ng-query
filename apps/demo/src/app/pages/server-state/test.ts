import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  craft,
  craftInject,
  craftQuery,
  craftState,
  insertLocalStoragePersister,
  query,
  state,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';

const { injectTestPersisterCraft } = craft(
  {
    name: 'testPersister',
    providedIn: 'root',
  },
  craftInject(() => ({ ApiService })),
  craftQuery('users', ({ apiService, INSERT_CONFIG }) =>
    query(
      {
        params: () => '1',
        // identifier: (params: string) => params,
        loader: async ({ params }) =>
          apiService.getDataList({ page: +params, pageSize: 10 }),
      },
      insertLocalStoragePersister(INSERT_CONFIG)
    )
  ),
  // craftState(
  //   'counter',
  //   () => signal(0),
  //   ({ state }) => ({
  //     increment: (by: number) => state() + by,
  //   })
  // )
  craftState('counter', () =>
    state(signal(0), ({ state }) => ({
      increment: (by: number) => state() + by,
    }))
  )
);

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    status: {{ store.users.status() }}
    <pre>{{ store.users.value() | json }}</pre>
    <!-- status: {{ store.users.select('1')?.status() }}
    <pre>{{ store.users.select('1')?.value() | json }}</pre> -->
  `,
})
export default class TestComponent {
  protected readonly store = injectTestPersisterCraft();
  constructor() {
    console.log('this.store', this.store);
  }
}
