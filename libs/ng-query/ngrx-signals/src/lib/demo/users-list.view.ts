import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { User } from '../../resource-store/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mx-auto max-w-4xl p-6">
      <h2 class="mb-6 text-3xl font-bold text-gray-800">User List</h2>

      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <ul class="divide-y divide-gray-200">
          @for (user of userList(); track user.id) {
          <li class="transition-colors duration-150 hover:bg-gray-50">
            <a
              [routerLink]="[user.id]"
              class="block px-6 py-4 text-lg text-blue-600 transition-colors duration-150 hover:text-blue-800 hover:underline"
            >
              {{ user.name }}
            </a>
          </li>
          }
        </ul>
      </div>

      <div class="mt-8">
        <router-outlet />
      </div>
    </div>
  `,
})
export default class UserListView {
  protected readonly userList = signal<User[]>([
    { id: '1', name: 'Romain' },
    { id: '2', name: 'Alice' },
    { id: '3', name: 'Bob' },
  ]);
}
