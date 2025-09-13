import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'query-and-mutation-local',
    loadComponent: () =>
      import('./pages/query-and-mutation-local/query-and-mutation-local'),
  },
  {
    path: 'global-query-and-mutation',
    loadComponent: () =>
      import('./pages/global-query-and-mutation/global-query-and-mutation'),
  },
  {
    path: 'no-store/:userId',
    loadComponent: () => import('./pages/no-store/no-store'),
  },
  {
    path: 'list-with-pagination',
    loadComponent: () =>
      import('./pages/list-with-pagination/list-with-pagination'),
  },
];
