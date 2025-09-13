import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import {
  globalQueries,
  localStoragePersister,
  query,
  SignalProxy,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';
import { StatusComponent } from '../../ui/status.component';
import { Router } from '@angular/router';

const { injectUserQuery } = globalQueries(
  {
    queries: {
      user: {
        query: (
          source: SignalProxy<{ id: string | undefined }>,
          api = inject(ApiService)
        ) =>
          query({
            params: source.id,
            loader: ({ params: id }) => api.getItemById(id),
            preservePreviousValue: () => true, // keep the previous user display while the new one fetching
          }),
        config: {
          // 👇wait for the userId from the component to be set before retrieve the cached data
          // It is useful when the last cached user (with id: 2), and when accessing to the page for the user with id 3
          // It avoids to display wrong data
          waitForParamsSrcToBeEqualToPreviousValue: true,
        },
      },
    },
  },
  {
    featureName: 'no-store',
    persister: localStoragePersister,
  }
);

@Component({
  selector: 'app-no-store',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styleUrls: ['no-store.css'],
  template: `
    <div>
      User
      <app-status [status]="userQuery.status()" />

      : @if( userQuery.hasValue()) {
      <pre>{{ userQuery.value() | json }}</pre>
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
  protected readonly userQuery = injectUserQuery(() => ({
    id: this.userId,
  }));

  private readonly router = inject(Router);

  protected nextPage() {
    this.router.navigate(['no-store', parseInt(this.userId() ?? '0') + 1]);
  }

  protected previousPage() {
    this.router.navigate(['no-store', parseInt(this.userId() ?? '10') - 1]);
  }
}
