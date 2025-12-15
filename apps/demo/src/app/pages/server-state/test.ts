import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  linkedSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  afterRecomputation,
  craft,
  craftInject,
  craftInputs,
  craftQuery,
  craftSources,
  craftState,
  insertLocalStoragePersister,
  query,
  source,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';

const { injectTestPersisterCraft } = craft(
  {
    name: 'testPersister',
    providedIn: 'root',
  },
  craftInject(() => ({ ApiService })),
  craftQuery('users', ({ apiService }) =>
    query(
      {
        params: () => '1',
        // identifier: (params: string) => params,
        loader: async ({ params }) =>
          apiService.getDataList({ page: +params, pageSize: 10 }),
      },
      insertLocalStoragePersister({
        storeName: 'testPersister',
        key: 'users-page-params',
      })
    )
  )
);

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    status: {{ store.users.status() }}
    <pre>{{ store.users.value() | json }}</pre>
  `,
})
export default class TestComponent {
  protected readonly store = injectTestPersisterCraft();
  constructor() {
    console.log('this.store', this.store);
  }
}
