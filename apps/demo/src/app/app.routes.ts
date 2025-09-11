import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'list-with-pagination',
    loadComponent: () =>
      import('./pages/list-with-pagination/list-with-pagination'),
  },
  {
    path: 'query-and-mutation-local',
    loadComponent: () =>
      import('./pages/query-and-mutation-local/query-and-mutation-local'),
  },
];
