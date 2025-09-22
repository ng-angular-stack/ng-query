import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  globalQueries,
  query,
  queryById,
  SignalProxy,
} from '@ng-query/ngrx-signals';
import { insertPlaceholderData } from '@ng-query/ngrx-signals/insertions/insert-pagination-place-holder-data';
import { ApiService } from './api.service';
import { StatusComponent } from '../../../ui/status.component';

const { injectUserQueryById, injectUserQuery } = globalQueries(
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
            preservePreviousValue: () => true,
          }),
      },
    },
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
  }
);

@Component({
  selector: 'app-query-vs-query-by-id',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styles: [
    `
      .comparator-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
        background: #f9f9f9;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        max-width: 900px;
        margin: 2rem auto;
        font-family: 'Chivo', Arial, Helvetica, sans-serif;
      }
      .comparator-header {
        font-size: 2rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 1rem;
        text-align: center;
      }
      .comparator-sections-row {
        display: flex;
        flex-direction: row;
        gap: 2rem;
        justify-content: center;
        align-items: stretch;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .comparator-section {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        padding: 1.5rem;
        flex: 1 1 350px;
        min-width: 300px;
        max-width: 420px;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
      }
      .comparator-section-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: #222;
        margin-bottom: 0.75rem;
      }
      .comparator-section-content {
        font-size: 1rem;
        color: #4a5568;
        line-height: 1.6;
      }
      .comparator-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
      }
      .comparator-user-id {
        font-size: 1.1rem;
        font-weight: 500;
        color: #444;
        padding: 0 0.5rem;
      }
      button {
        background: #444;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1.2rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      button:hover {
        background: #222;
      }
      pre {
        background: #edf2f7;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.95rem;
        overflow-x: auto;
      }
      ul {
        padding-left: 1.2rem;
      }
      li {
        margin-bottom: 0.3rem;
      }

      code {
        background: #f7fafc;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
      }
    `,
  ],
  template: `
    <div class="comparator-container">
      <div class="comparator-header">User Query Comparison</div>
      <div class="comparator-sections-row">
        <div class="comparator-section">
          <div class="comparator-section-title">User [Query]</div>
          <app-status [status]="userQuery.status()" />
          <div class="comparator-section-content">
            @if( userQuery.hasValue()) {
            <pre>{{ userQuery.value() | json }}</pre>
            }
            <div>Option: <code>preservePreviousValue: () => true</code></div>
          </div>
        </div>
        <div class="comparator-section">
          <div class="comparator-section-title">User [Query By Id]</div>
          <app-status [status]="userQueryById.currentPageStatus()" />
          <div class="comparator-section-content">
            <pre>{{ userQueryById.currentPageData() | json }}</pre>
            <div>Option: <code>insertPlaceholderData</code></div>
            <div>
              Cache:
              <ul>
                @for( data of listOfUserResourceInCache(); track data[0]) {
                <li>
                  UserId {{ data[0] }}: <code>{{ data[1]?.status() }}</code>
                </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="comparator-actions">
        <button (click)="previousUser()">Previous user</button>
        <span class="comparator-user-id">{{ userId() }}</span>
        <button (click)="nextUser()">Next user</button>
      </div>
    </div>
  `,
})
export default class QueryVsQueryByIdComponent {
  userId = signal('1');

  protected readonly userQueryById = injectUserQueryById(() => ({
    id: this.userId,
  }));

  protected readonly userQuery = injectUserQuery(() => ({
    id: this.userId,
  }));

  protected listOfUserResourceInCache = computed(() => {
    return Object.entries(this.userQueryById());
  });

  nextUser() {
    this.userId.set('' + (parseInt(this.userId()) + 1));
  }
  previousUser() {
    this.userId.set('' + (parseInt(this.userId()) - 1));
  }
}
