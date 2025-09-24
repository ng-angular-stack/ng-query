## Deploy doc

Run `docs:publish`, then from the VSCode editor, add a commit with all the changes and push into the gh-pages branches.

## Versioning Nx

nx release version # calcule et applique les nouvelles versions
nx release publish # publie sur npm (selon "packageRoot" de chaque projet)

## Tests with UI

npx nx run ng-query-ngrx-signals:test --watch --ui

## Server State Store

const {withUserServerState, injectUserServerState, includeUserServerState} = serverState("user", useMutation("save"), useQuery("get", ....))
const {withUserServerState, injectUserServerState, includeUserServerState} = serverState("user", useMutation("save"), useQuery({
name: "get",
adapters: [signalStoreAdapter]
}, ....))
// pluggable
const {withUserServerState, injectUserServerState, includeUserServerState} = serverStateSetup("user", (entries: SignalProxy<>) => serverState(useMutation("save"), useQuery({
name: "get",
adapters: [signalStoreAdapter]
}, ....)))

const {withUserServerState, injectUserServerState, includeUserServerState} = serverStateSetup( (entries: SignalProxy<>) => serverState("user", useMutation("save"), useQuery({
name: "get",
adapters: [signalStoreAdapter]
}, ....)))

const {injectOtherServerState} = serverState("other", includeUserServerState({public: true/false}), ...)

injectOtherServerState() // pas accès direct à userState si pas explicitement public

///

const {includeSaveUserMutation(), injectSaveUserMutation} = globalMutation("saveUser", (entries: SignalProxy<>) => ...);

const {injectOtherServerState} = serverStateSetup("other", includeUserServerState({public: true/false}),includeSaveUserMutation(), ...)

const {includeUserQuery, withUserQuery} = globalQuery("user", ...); // can not be mutated, otherwise use serverStateSetup

// rajouter un flag feature
