## Query

Gestion de la method pour trigger une query & ajout à la signature

## ById

gérer le trigger de plusieurs d'un coup

## Doc

Ajout des tests manquants en même temps

## Feature

- préserver les résultats précédents pagintation, ajouter une fonction qui va exposer current page et current résult ? et exposer en plus des resources ? évite de recréer des trucs dédiés
- gérer les mutations qui se lancent mais on n'a pas le résultat (car on a refresh la page avant)
- returned source should be an object, it will be easier for improvments
- ajouter inject dans cachedQueries
- todo inject global queries directly & tester une seule instance shared
- permettre au non l'ajout d'un persister (option)
- ajouter test queryById localstorage
- checker de voir si on a encore besoin du runOnInjectionContext & injector
- Faire un withRxMutation basé sur les observables
- cache persister, auto reload si observé ?
- Dans les cachesPersister rajouter une map clé/date d'expiration, comme ça à l'initialisation ça peut clean tout ce qui est outdated
- Penser au cas où une mutation vient modifier une query qui n'est pas encore récupérée du cache (pas possible je crois, via ce que j'ai mis en place)
- Cache auto refetch si /WindowsFocus / interval...
- query pagination & cache
- query infinit pagination & cache
- resourceById cache pour ne pas relancer l'appel ? Si on revient sur une même "page"
- Plus tard quand les events du signalStore seront OP, ajouter un opérateur on$ ou un helper pour récupérer l'observable
- Ajout uxLoader / rxLoader
- un système où on créé une mutation global, que l'on peut facilement hériter depuis différente query dans des store globale ou non (faire un cache avec les mutations comme clés, comme ça si une mutation change on invalide le cache même si la query n'est pas en train d'écouter) => voir si on utilise preservedResource ou un outil de deepCompare avec le params ?
- dans les reload, forcer à n'utiliser que les clé définis
- associatedState, prévoir un cas où ça vient du store ?
- pour les withQuery/MutationById créer un proxy
- gérer les streams via les resourcesById?
- withServerState
- toGlobalServerState
- localServer state: https://stackblitz.com/edit/stackblitz-starters-31qrd2nq?file=withFeature%2F1-simple-only-one-helper-to-use.ts
- genericLocalServerState (use created https://stackblitz.com/edit/stackblitz-starters-31qrd2nq?file=withFeature%2Fhandle-feature-with-generic.ts)
  -faire les with... avec les events/sources de ngrx

### ServerStateStore

- Accepter d'avoir directement un signalStore, mais ne pas exposer with...
- Pas forcément global, rajouter une option ? (Utile seulement si c'est une feature de passée)

## NestedEffect

- Add some tests

## Idea

- Ajouter le on event dans les rxQuery/rxMutation
- Ajouter la gestion du status reloading pour trigger le relaod d'une query ?
- rename associatedState by patchState
- Ajout d'une liste des actions local (des optimistic patch/update), pour pouvoir revert plus facilement pour en appliquer une nouvelle ? Cette list se reset à chaque fetch success
- faire en sorte d'accepter la syntax WithQuery("name", query())
