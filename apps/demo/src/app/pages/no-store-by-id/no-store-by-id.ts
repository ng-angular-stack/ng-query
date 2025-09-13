import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import {
  globalQueries,
  localStoragePersister,
  queryById,
  SignalProxy,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';
import { StatusComponent } from '../../ui/status.component';
import { Router } from '@angular/router';

const { injectUserQueryById } = globalQueries(
  {
    queriesById: {
      user: {
        queryById: (
          source: SignalProxy<{ id: string | undefined }>,
          api = inject(ApiService)
        ) =>
          queryById({
            params: source.id,
            identifier: (params) => params,
            loader: ({ params: id }) => api.getItemById(id),
          }),
      },
    },
  },
  {
    featureName: 'no-store-by-id',
    persister: localStoragePersister,
  }
);

@Component({
  selector: 'app-no-store',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styleUrls: ['no-store-by-id.css'],
  template: `
    <div>
      User @if(userQuery(); as userQueryData) {
      <app-status [status]="userQueryData.status()" />
      } : @if( userQuery()?.hasValue()) {
      <pre>{{ userQuery()?.value() | json }}</pre>
      }
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
export default class GlobalQueryAndMutation {
  public readonly userId = input<string>();
  private readonly userQueryById = injectUserQueryById(() => ({
    id: this.userId,
  }));

  protected readonly userQuery = computed(
    () => this.userQueryById()[this.userId() ?? '']
  );

  private readonly router = inject(Router);

  protected nextPage() {
    this.router.navigate(['no-store', parseInt(this.userId() ?? '0') + 1]);
  }

  protected previousPage() {
    this.router.navigate(['no-store', parseInt(this.userId() ?? '10') - 1]);
  }
}
