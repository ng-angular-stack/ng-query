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
    path: 'no-store-by-id/:userId',
    loadComponent: () => import('./pages/no-store-by-id/no-store-by-id'),
  },
  {
    path: 'list-with-pagination',
    loadComponent: () =>
      import('./pages/list-with-pagination/list-with-pagination'),
  },
  {
    path: 'list-with-pagination-global',
    loadComponent: () =>
      import('./pages/list-with-pagination-global/list-with-pagination'),
  },
  {
    path: 'pagination-granular-mutations',
    loadComponent: () =>
      import(
        './pages/pagination-granular-mutations/pagination-granular-mutations'
      ),
  },
];
