import {
  effect,
  inject,
  Injector,
  linkedSignal,
  ResourceRef,
  signal,
  Signal,
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
        if (queryStatus !== 'resolved') {
          return;
        }
        untracked(() => {
          const queryParams = queryResourceParamsSrc();
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              queryParams,
              queryValue: queryResource.value(),
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
      const {
        key,
        queryByIdResource,
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
            queryByIdResource.set(queryValue);
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
          waitForParamsSrcToBeEqualToPreviousValue,
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
