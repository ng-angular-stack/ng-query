import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  asyncMethod,
  query,
  craftAsyncMethods,
  craftInject,
  craftQuery,
  craft,
  craftMutations,
  mutation,
} from '@ng-query/ngrx-signals';
import { ApiService } from './api.service';
import { StatusComponent } from '../../../../ui/status.component';

function cancellableTimeout(ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  let canceled = false;

  const promise = new Promise<void>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!canceled) resolve();
    }, ms);
  });

  return {
    promise,
    cancel() {
      canceled = true;
      clearTimeout(timeoutId);
    },
  };
}

// const { promise, cancel } = cancellableTimeout(3000);
// abortSignal.addEventListener('abort', () => {
//   cancel();
// });
// await promise;

// Promise/abort
// fromResourceById limitation de TS

// suite: craftComputed/rename/inject/craftLocalGlobal

// const { injectGranularDeletionWithDelayCraft } = craft(
//   {
//     name: 'granularDeletionWithDelay',
//     providedIn: 'root',
//   },
//   craftInject(() => ({
//     ApiService,
//   })),
//   craftAsyncMethods(() => ({
//     delayDeleteWithUndo: asyncMethod({
//       method: (payload: { id: string; status: 'delete' | 'cancel' }) => payload,
//       identifier: ({ id }) => id,
//       loader: async ({ params: { id, status } }) => {
//         console.log('loader', id);
//         if (status === 'cancel') {
//           return { id, status };
//         }
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//         return { id, status: 'confirm' as const };
//       },
//     }),
//   })),
//   craftMutations(({ apiService, delayDeleteWithUndo }) => ({
//     deleteItem: mutation({
//       fromResourceById: delayDeleteWithUndo._resourceById,
//       params: (delayDeleteWithUndoResource) => {
//         return delayDeleteWithUndoResource?.status() === 'resolved' &&
//           delayDeleteWithUndoResource?.value()?.status === 'confirm'
//           ? delayDeleteWithUndoResource?.value()?.id
//           : undefined;
//       },
//       identifier: (id) => id,
//       loader: ({ params: id }) => {
//         return apiService.deleteItem(id);
//       },
//     }),
//   })),
//   craftQuery(
//     'items',
//     ({ apiService }) =>
//       query({
//         params: () => ({ page: 1, pageSize: 10 }),
//         loader: ({ params: pagination }) => {
//           return apiService.getDataList(pagination);
//         },
//       }),
//     {
//       on: {
//         deleteItemMutation: {
//           filter: ({ queryResource, mutationIdentifier }) =>
//             queryResource.hasValue() &&
//             queryResource
//               .value()
//               .some((item) => item.id === mutationIdentifier),
//           update: ({ queryResource, mutationIdentifier }) =>
//             queryResource
//               .value()
//               .filter((item) => item.id !== mutationIdentifier),
//         },
//       },
//     }
//   )
// );

@Component({
  selector: 'app-granular-delay',
  standalone: true,
  imports: [CommonModule, StatusComponent],
  styleUrl: './granular-delay.css',
  template: `
    <!-- <div class="container">
      <main class="content">
        <div class="content-wrapper">
          <div class="card">
            <h2 class="card-title">
              User Management:

              <app-status [status]="store.items.status()"></app-status>
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
                  @if(store.items.hasValue()) { @for(user of
                  store.items.value(); track user.id) {
                  <tr>
                    <td>{{ user.id }}</td>

                    <td>{{ user.name }}</td>

                    <td>
                      @if(!store.deleteItem.select(user.id)) {
                      @if(store.delayDeleteWithUndo.select(user.id)?.status()
                      === 'loading') {
                      <span>Deleting in 5s...</span>
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
                      } }@else { Deletion... }
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
    </div> -->
  `,
})
export default class GranularDeletionWithDelayComponent {
  // protected readonly store = injectGranularDeletionWithDelayCraft();
}
