import { signalStore, withState } from '@ngrx/signals';
import { withCachedQueryToPlugFactory } from './with-cached-query-factory';
import { withMutation } from '../with-mutation';
import { rxMutation } from '../rx-mutation';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Equal, Expect } from '../../../../../../test-type';
import { resource, ResourceRef, signal } from '@angular/core';
import { createSignalProxy } from '../signal-proxy';

describe('withCachedQueryFactory', () => {
  it('should create a typed withQuery for the signal store that can be plugged to the store', () => {
    TestBed.runInInjectionContext(() => {
      const pluggableConfig = createSignalProxy({
        id: undefined as number | undefined,
      });
      const resourceParamsSrc = signal<{ id: number } | undefined>(undefined);
      const resourceRef = resource({
        params: resourceParamsSrc,
        loader: ({ params }) =>
          Promise.resolve({ id: params?.id, name: 'Romain' }),
      });
      const withUserQuery = withCachedQueryToPlugFactory<
        'user',
        {
          id: number;
          name: string;
        },
        { id: number },
        { id: number | undefined },
        true
      >('user', pluggableConfig, () => ({
        queryRef: {
          resource: resourceRef,
          resourceParamsSrc: resourceParamsSrc,
        },
        __types: {} as any,
      }));

      expect(withUserQuery).toBeDefined();

      const store = signalStore(
        {
          providedIn: 'root',
        },
        withState({ selected: { id: 1 } }),
        withMutation('name', () =>
          rxMutation({
            method: (name: string) => name,
            stream: ({ params }) => of({ id: '4', name: params }),
          })
        ),
        withUserQuery((store) => ({
          setQuerySource: (source) => ({ id: store.selected.id }),
        }))
      );
      const signalStoreInstance = TestBed.inject(store);

      type ExpectQueryToBeDefined = Expect<
        Equal<
          typeof signalStoreInstance.userQuery,
          ResourceRef<{
            id: number;
            name: string;
          }>
        >
      >;
      const t = signal(true);
      expect(signalStoreInstance.userQuery).toBeDefined();
    });
  });
});
