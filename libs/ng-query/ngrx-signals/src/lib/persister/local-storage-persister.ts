import {
  effect,
  inject,
  Injector,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import {
  PersistedQuery,
  PersistedQueryById,
  QueriesPersister,
} from './persister.type';
import { nestedEffect } from '../types/util';
import { isEqual } from '../global-query/util';

export function localStoragePersister(prefix: string): QueriesPersister {
  const _injector = inject(Injector);
  const queriesMap = signal(
    new Map<string, PersistedQuery & { storageKey: string }>(),
    {
      equal: () => false,
    }
  );

  const queriesByIdMap = signal(
    new Map<string, PersistedQueryById & { storageKey: string }>(),
    {
      equal: () => false,
    }
  );

  const newQueryKeysForNestedEffect = linkedSignal<
    any,
    { newKeys: string[] } | undefined
  >({
    source: queriesMap,
    computation: (currentSource, previous) => {
      if (!currentSource || !Array.from(currentSource.keys()).length) {
        return undefined;
      }

      const currentKeys = Array.from(currentSource.keys());
      const previousKeys = Array.from(previous?.source?.keys() || []);
      // Find keys that exist in current but not in previous
      const newKeys = currentKeys.filter(
        (key) => !previousKeys.includes(key)
      ) as string[];
      return newKeys.length > 0 ? { newKeys } : previous?.value;
    },
  });

  effect(() => {
    if (!newQueryKeysForNestedEffect()?.newKeys) {
      return;
    }

    newQueryKeysForNestedEffect()?.newKeys.forEach((newKey) => {
      const data = untracked(() => queriesMap().get(newKey));
      nestedEffect(_injector, () => {
        if (!data) {
          return;
        }
        const { queryResource, queryResourceParamsSrc, storageKey } = data;
        const queryStatus = queryResource.status();
        const queryValue = queryResource.value(); // also track the query value, because the status can stayed local but the value may change

        if (queryStatus !== 'resolved' && queryStatus !== 'local') {
          return;
        }
        untracked(() => {
          const queryParams = queryResourceParamsSrc();
          console.log('queryResource.value()', queryResource.value());
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              queryParams,
              queryValue,
              timestamp: Date.now(),
            })
          );
        });
      });

      if (data?.waitForParamsSrcToBeEqualToPreviousValue) {
        const waitForParamsSrcToBeEqualToPreviousValueEffect = nestedEffect(
          _injector,
          () => {
            const { queryResourceParamsSrc, storageKey, queryResource } = data;
            const params = queryResourceParamsSrc();
            if (params === undefined) {
              return;
            }
            const storedValue = localStorage.getItem(storageKey);
            if (!storedValue) {
              waitForParamsSrcToBeEqualToPreviousValueEffect.destroy();
              return;
            }
            try {
              const { queryValue, queryParams, timestamp } =
                JSON.parse(storedValue);

              // Check if cache is expired
              if (
                timestamp &&
                data.cacheTime > 0 &&
                isValueExpired(timestamp, data.cacheTime)
              ) {
                localStorage.removeItem(storageKey);
                waitForParamsSrcToBeEqualToPreviousValueEffect.destroy();
                return;
              }

              const isEqualParams = isEqual(params, queryParams);
              if (!isEqualParams) {
                localStorage.removeItem(storageKey);
                waitForParamsSrcToBeEqualToPreviousValueEffect.destroy();
                return;
              }
              if (isEqualParams) {
                queryResource.set(queryValue);
              }
              waitForParamsSrcToBeEqualToPreviousValueEffect.destroy();
            } catch (e) {
              console.error('Error parsing stored value from localStorage', e);
              waitForParamsSrcToBeEqualToPreviousValueEffect.destroy();
              return;
            }
          }
        );
      }
    });
  });

  const newQueryByIdKeysForNestedEffect = linkedSignal<
    any,
    { newKeys: string[] } | undefined
  >({
    source: queriesByIdMap,
    computation: (currentSource, previous) => {
      if (!currentSource || !Array.from(currentSource.keys()).length) {
        return undefined;
      }

      const currentKeys = Array.from(currentSource.keys());
      const previousKeys = Array.from(previous?.source?.keys() || []);
      const newKeys = currentKeys.filter(
        (key) => !previousKeys.includes(key)
      ) as string[];
      return newKeys.length > 0 ? { newKeys } : previous?.value;
    },
  });

  effect(() => {
    if (!newQueryByIdKeysForNestedEffect()?.newKeys) {
      return;
    }

    // Each time their is a status change in the queryById resource it will save the query with only the resource that are 'resolved' or 'local' (it may be improved)
    newQueryByIdKeysForNestedEffect()?.newKeys.forEach((newKey) => {
      const data = untracked(() => queriesByIdMap().get(newKey));
      nestedEffect(_injector, () => {
        if (!data) {
          return;
        }

        const { queryByIdResource, queryResourceParamsSrc, storageKey } = data;
        const queryByIdValue = Object.entries(queryByIdResource() ?? {}).reduce<
          Record<string, any>
        >((acc, [resourceKey, resource]) => {
          const queryStatus = resource?.status();
          if (queryStatus !== 'resolved' && queryStatus !== 'local') {
            return acc;
          }
          acc[resourceKey] = resource?.value();
          return acc;
        }, {});

        untracked(() => {
          const queryParams = queryResourceParamsSrc();
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              queryParams,
              queryByIdValue,
              timestamp: Date.now(),
            })
          );
        });
      });
    });
  });

  function isValueExpired(timestamp: number, cacheTime: number): boolean {
    return Date.now() - timestamp > cacheTime;
  }

  return {
    addQueryToPersist(data: PersistedQuery): void {
      const {
        key,
        queryResource,
        queryResourceParamsSrc,
        waitForParamsSrcToBeEqualToPreviousValue,
        cacheTime,
      } = data;

      const storageKey = `${prefix}${key}`;
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue && !waitForParamsSrcToBeEqualToPreviousValue) {
        try {
          const { queryValue, timestamp } = JSON.parse(storedValue);
          if (
            timestamp &&
            cacheTime > 0 &&
            isValueExpired(timestamp, cacheTime)
          ) {
            localStorage.removeItem(storageKey);
          } else {
            queryResource.set(queryValue);
          }
        } catch (e) {
          console.error('Error parsing stored value from localStorage', e);
          localStorage.removeItem(storageKey);
        }
      }
      queriesMap.update((map) => {
        map.set(key, {
          queryResource,
          queryResourceParamsSrc,
          storageKey,
          waitForParamsSrcToBeEqualToPreviousValue,
          cacheTime,
          key,
        });
        return map;
      });
    },

    addQueryByIdToPersist(data: PersistedQueryById): void {
      const { key, queryByIdResource, queryResourceParamsSrc, cacheTime } =
        data;

      const storageKey = `${prefix}${key}`;
      const storedValue = localStorage.getItem(storageKey);

      if (storedValue) {
        try {
          const { queryByIdValue, timestamp } = JSON.parse(storedValue);
          if (
            timestamp &&
            cacheTime > 0 &&
            isValueExpired(timestamp, cacheTime)
          ) {
            localStorage.removeItem(storageKey);
          } else {
            if (queryByIdValue && typeof queryByIdValue === 'object') {
              Object.entries(queryByIdValue).forEach(
                ([resourceKey, resourceValue]) => {
                  queryByIdResource.add(() => resourceKey, {
                    defaultValue: resourceValue,
                  });
                }
              );
            }
          }
        } catch (e) {
          console.error('Error parsing stored value from localStorage', e);
          localStorage.removeItem(storageKey);
        }
      }
      queriesByIdMap.update((map) => {
        map.set(key, {
          queryByIdResource,
          queryResourceParamsSrc,
          storageKey,
          cacheTime,
          key,
        });
        return map;
      });
    },

    clearQuery(queryKey: string): void {
      queriesMap.update((map) => {
        map.delete(queryKey);
        localStorage.removeItem(`${prefix}${queryKey}`);
        return map;
      });
    },

    clearQueryBy(queryByIdKey: string): void {
      queriesByIdMap.update((map) => {
        map.delete(queryByIdKey);
        localStorage.removeItem(`${prefix}${queryByIdKey}`);
        return map;
      });
    },

    clearAllQueries(): void {
      queriesMap().forEach((_, key) => {
        localStorage.removeItem(`${prefix}${key}`);
      });
      queriesMap.update((map) => {
        map.clear();
        return map;
      });
    },

    clearAllQueriesById(): void {
      queriesByIdMap().forEach((_, key) => {
        localStorage.removeItem(`${prefix}${key}`);
      });
      queriesByIdMap.update((map) => {
        map.clear();
        return map;
      });
    },
    clearAllCache(): void {
      this.clearAllQueriesById();
      this.clearAllQueries();
    },
  };
}
