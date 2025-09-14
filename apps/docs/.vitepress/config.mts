import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '@ng-query',
  base: '/query/',
  description: '@ng-query is a server state management tool',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/assets/favicon.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/get-started' },
    ],

    sidebar: [
      {
        text: 'Get Started',
        link: '/get-started',
      },
      {
        text: 'Signal Store',
        items: [
          { text: 'Overview', link: '/signal-store' },
          { text: 'Query - withQuery', link: '/signal-store-query' },
          { text: 'Mutation - withMutation', link: '/signal-store-mutation' },
          {
            text: 'Optimistic update & other effects',
            link: '/signal-store-optimistic',
          },
          {
            text: 'Global Queries',
            items: [
              { text: 'Overview', link: '/signal-store-global-query' },
              { text: 'Persister', link: '/signal-store-global-persister' },
            ],
          },
          {
            text: 'Parallel Queries & Mutations',
            link: '/signal-store-parallel',
          },
          { text: 'Paginated Query', link: '/signal-store-paginated' },
          {
            text: 'Insertions (states & effects)',
            items: [
              {
                text: 'Overview',
                link: '/insertions',
              },
              {
                text: 'Pagination Placeholder Data',
                link: '/insertions/insert-pagination-place-holder-data',
              },
              {
                text: 'Placeholder Data',
                link: '/insertions/insert-place-holder-data',
              },
              {
                text: 'UX Loader',
                link: '/insertions/insert-ux-loader.md',
              },
              {
                text: 'Last successful value',
                link: '/insertions/insert-last-successful-value.md',
              },
            ],
          },
          { text: 'Server State Store', link: '/signal-store-server-state' },
        ],
      },
      {
        text: 'Examples',
        items: [{ text: 'Examples', link: '/examples/overview' }],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ng-angular-stack/ng-query' },
    ],
  },
  head: [['link', { rel: 'icon', href: '/assets/favicon.png' }]],
});
