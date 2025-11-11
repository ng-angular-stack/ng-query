import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  asyncMethod,
  mutationById,
  query,
  serverState,
  usingAsyncMethods,
  usingInject,
  usingMutationById,
  usingQuery,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';
import { StatusComponent } from '../../../../ui/status.component';

const { injectGranularDeletionWithDelayServerState } = serverState(
  usingInject(() => ({
    ApiService,
  })),
  usingAsyncMethods(() => ({
    delayDeleteWithUndo: asyncMethod({
      method: (payload: { id: string; status: 'delete' | 'cancel' }) => payload,
      identifier: ({ id }) => id,
      loader: async ({ params: { id, status } }) => {
        if (status === 'cancel') {
          return { id, status };
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return { id, status: 'confirm' as const };
      },
    }), // todo expose lastResolved all ? ça compare la ref
  })),
  usingMutationById('deleteItem', ({ apiService, delayDeleteWithUndo }) =>
    // ! il peut y avoir une désyncrhonisation entre le trigger de params et la delayDeleteWithUndo
    // ! permettre d'avoir params qui attend une liste de params ? Spécifique pour ce cas d'usage
    // todo use a symbol : params: paramsForEach(delayDeleteWithUndo, ...), le params va transmettre le resourceById pour pouvoir appeler le addById
    mutationById({
      params: () =>
        delayDeleteWithUndo.status() === 'resolved' &&
        delayDeleteWithUndo.value()?.status === 'confirm'
          ? delayDeleteWithUndo.value()?.id
          : undefined,
      identifier: (id) => id,
      loader: ({ params: id }) => {
        return apiService.deleteItem(id);
      },
    })
  ),
  usingQuery('items', ({ apiService }) =>
    query({
      params: () => ({ page: 1, pageSize: 10 }),
      loader: ({ params: pagination }) => {
        return apiService.getDataList(pagination);
      },
    })
  ),
  {
    name: 'granularDeletionWithDelay',
  }
);

@Component({
  selector: 'app-granular-delay',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styleUrl: './granular-delay.css',
  template: `
    <div class="container">
      <main class="content">
        <div class="content-wrapper">
          <div class="card">
            <h2 class="card-title">
              User Management:

              <app-status [status]="store.itemsQuery.status()"></app-status>
            </h2>

            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @if(store.itemsQuery.hasValue()) { @for(user of
                  store.itemsQuery.value(); track user.id) {
                  <tr>
                    <td>{{ user.id }}</td>

                    <td>{{ user.name }}</td>

                    <td>
                      @if(store.delayDeleteWithUndo.status() === 'loading') {
                      <button
                        class="action-btn"
                        (click)="
                          store.setDelayDeleteWithUndo({
                            id: user.id,
                            status: 'cancel'
                          })
                        "
                      >
                        Cancel deletion
                      </button>
                      }@else {
                      <button
                        class="action-btn"
                        (click)="
                          store.setDelayDeleteWithUndo({
                            id: user.id,
                            status: 'delete'
                          })
                        "
                      >
                        Delete
                      </button>
                      }
                    </td>
                  </tr>
                  } @empty {
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 32px">
                      No users found
                    </td>
                  </tr>
                  }}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export default class GranularDeletionWithDelayComponent {
  protected readonly store = injectGranularDeletionWithDelayServerState();
}
