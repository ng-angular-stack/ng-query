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
      { text: 'Docs', link: '/markdown-examples' },
    ],

    sidebar: [
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
                link: '/insertions/insert-pagination-place-holder-data.md',
              },
            ],
          },
          { text: 'Server State Store', link: '/signal-store-server-state' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
  head: [['link', { rel: 'icon', href: '/assets/favicon.png' }]],
});
