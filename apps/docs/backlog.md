# Backlog

## Priority

- A package that does not use the NgRx SignalStore & Server State Store (it will come together)
  - A way for query to be updated by other query result
- Infinite pagination/query (the a strategy to invalidate the cache as tanstackQuery does)
- Why the globalQueries does not propose the autocompletion (I may not do that if I find a better approach with the Server State Store, that will replace it)
- `fallbackUpdate` to help to set the query state when a mutation failed (useful if their is an optimistic update) (I would like to propose the `lastSuccessfulValue` but it is not simple, because their is cases where multiples mutations can be trigger in parallel).
- When `signalStore events` will be stable, the `rxQuery/rxMutation...` will accepts an event as params source, the property may be named `onEvent: event`
- Adding `insertUxLoader`, as it may avoid some flaky screen/loader. It is something that can easily improve the UX and the is a fundamental value of this lib
- Propose a dedicated utility for handling update from `websocket`
- Improve `method` implementation from `mutationById`(when it will be called multiple times in the same cycle, it will create all the target resource according to the generated identifiers). eg. mutateUserById(1);mutateUserById(2);mutateUserById(3); => will create all the resources and set the mutationParamsSrc to 3

## Other

- A Chrome Dev tool to track queries and mutations requests
- A page that compare Angular TanStackQuery and other solutions with @ng-query
- Once ng-query will be standalone (can works without the signalStore), a page to show how to implements ng-query with client state management (StateAdapt, RxAngular...)
- Improve the insertObservables (to help to know when a new resource is created, and when is it reset/deleted) (their is maybe a memory leak to check)
- Add a more complex example named "Pokemon" based on queryById / mutationById
- Add property `reset` / `resetResource` for `ById` to help to remove/clean some resource that are no more needed (in pagination, it may be used to clean some not valid pagination)
- Add more doc, specially when hovering the function, to show an example on how it should be implemented
- Add doc for llm
- Handle specific case when a mutation is trigger and some queries should react to it. But the mutation may be abort by the user who close the browser, or a bad connection... In this case, the idea may to force the cached queries to reload
- When a query is pluggable, I would like to improve how it is bind to a component to help to deal with more complex case
- Check if queries still needs runOnInjectionContext & injector (internal)
- Create a withRxMutation only based on observables
- Add queries options `interval` to reload queries, refresh when windows focus ...
- Improve the localStorePersister to remove expired cached queries when init
- Maybe creating a proxy to access to queryById resources, like `userQueryById["1"].status()` instead of `userQueryById()["1"]?.status()`
