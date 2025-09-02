import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { injectUserDetailsServerState } from './user-details.store';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-2xl p-6">
      <div class="rounded-lg bg-white p-6 shadow-md">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            User Details (id: {{ userId() | json }})
          </h2>
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
            [class]="
              store.userQuery.status() === 'loading'
                ? 'bg-yellow-100 text-yellow-800'
                : store.userQuery.status() === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            "
          >
            {{ store.userQuery.status() }}
          </span>
        </div>

        @if(store.userQuery.status() === 'loading') {
        <div class="flex items-center justify-center py-8">
          <div
            class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
          ></div>
          <span class="ml-3 text-gray-600">Loading user details...</span>
        </div>
        } @if(store.userQuery.hasValue()) {
        <div class="space-y-4">
          <div class="border-l-4 border-blue-500 pl-4">
            <label
              class="block text-sm font-medium uppercase tracking-wide text-gray-500"
              >ID</label
            >
            <p class="mt-1 text-lg font-semibold text-gray-900">
              {{ store.userQuery.value().id }}
            </p>
          </div>

          <div class="border-l-4 border-green-500 pl-4">
            <label
              class="block text-sm font-medium uppercase tracking-wide text-gray-500"
              >Name</label
            >
            <p class="mt-1 text-lg font-semibold text-gray-900">
              {{ store.userQuery.value().name }}
            </p>
          </div>
        </div>
        } @if(store.userQuery.status() === 'error') {
        <div class="rounded-md border border-red-200 bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">
                Failed to load user details. Please try again.
              </p>
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  `,
})
export default class UserDetailsView {
  readonly userId = input.required<string>();

  protected readonly store = injectUserDetailsServerState({
    selectedId: this.userId,
  });
}
