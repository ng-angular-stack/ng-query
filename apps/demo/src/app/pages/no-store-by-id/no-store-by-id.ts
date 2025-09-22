import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { globalQueries, queryById, SignalProxy } from '@ng-query/ngrx-signals';
import { localStoragePersister } from '@ng-query/ngrx-signals/persisters/local-storage';
import { ApiService } from './api.service';
import { StatusComponent } from '../../ui/status.component';
import { Router } from '@angular/router';
import { insertPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';

const { injectUserQueryById } = globalQueries(
  {
    queriesById: {
      user: {
        queryById: (
          source: SignalProxy<{ id: string | undefined }>,
          api = inject(ApiService)
        ) =>
          queryById(
            {
              params: source.id,
              identifier: (params) => params,
              loader: ({ params: id }) => api.getItemById(id),
            },
            insertPlaceholderData
          ),
      },
    },
  },
  {
    featureName: 'no-store-by-id',
    persister: localStoragePersister,
  }
);

@Component({
  selector: 'app-no-store-by-id',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styleUrls: ['no-store-by-id.css'],
  template: `
    <div>
      User
      <app-status [status]="userQueryById.currentPageStatus()" />
      :
      <pre>{{ userQueryById.currentPageData() | json }}</pre>
    </div>

    <div>
      <p>
        > Reload the page to see the query result to be retrieved from the cache
      </p>
    </div>

    <button (click)="previousPage()">Previous user</button>
    <button (click)="nextPage()">Next user</button>
  `,
})
export default class GlobalQueryById {
  public readonly userId = input<string>();
  protected readonly userQueryById = injectUserQueryById(() => ({
    id: this.userId,
  }));

  private readonly router = inject(Router);

  protected nextPage() {
    this.router.navigate([
      'no-store-by-id',
      parseInt(this.userId() ?? '0') + 1,
    ]);
  }

  protected previousPage() {
    this.router.navigate([
      'no-store-by-id',
      parseInt(this.userId() ?? '10') - 1,
    ]);
  }
}
