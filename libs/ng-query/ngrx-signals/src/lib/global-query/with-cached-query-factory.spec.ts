import { signalStore, withState } from '@ngrx/signals';
import {
  withCachedQueryByIdToPlugFactory,
  withCachedQueryToPlugFactory,
} from './with-cached-query-factory';
import { withMutation } from '../with-mutation';
import { TestBed } from '@angular/core/testing';
import { Expect, Equal } from 'test-type';
import { resource, ResourceRef, signal } from '@angular/core';
import { createSignalProxy } from '../signal-proxy';
import { mutation } from '../mutation';
import { resourceById } from '../resource-by-id';
import { ResourceByIdRef } from '../resource-by-id-signal-store';

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
        true,
        {
          pagination: 1;
        }
      >('user', pluggableConfig, () => ({
        queryRef: {
          resource: resourceRef,
          resourceParamsSrc: resourceParamsSrc,
          extendedOutputs: {
            pagination: 1,
          },
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
          mutation({
            method: (name: string) => name,
            loader: async ({ params }) => ({ id: '4', name: params }),
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
          }> & {
            pagination: 1;
          }
        >
      >;
      const t = signal(true);
      expect(signalStoreInstance.userQuery).toBeDefined();
    });
  });
});
describe('withCachedQueryByIdToPlugFactory', () => {
  it('should create a typed withQueryById for the signal store that can be plugged to the store', () => {
    TestBed.runInInjectionContext(() => {
      const pluggableConfig = createSignalProxy({
        id: undefined as number | undefined,
      });
      const resourceParamsSrc = signal<{ id: number } | undefined>(undefined);
      const resourceRef = resourceById({
        params: resourceParamsSrc,
        identifier: (request) => request.id,
        loader: ({ params }) =>
          Promise.resolve({ id: params?.id, name: 'Romain' }),
      });
      const withUserQueryById = withCachedQueryByIdToPlugFactory<
        'user',
        {
          id: number;
          name: string;
        },
        { id: number },
        { id: number | undefined },
        string,
        true,
        {
          pagination: 1;
        }
      >('user', pluggableConfig, () => ({
        queryByIdRef: {
          resourceById: resourceRef,
          resourceParamsSrc: resourceParamsSrc,
          extendedOutputs: {
            pagination: 1,
          },
        },
        __types: {} as any,
      }));

      expect(withUserQueryById).toBeDefined();

      const store = signalStore(
        {
          providedIn: 'root',
        },
        withState({ selected: { id: 1 } }),
        withMutation('name', () =>
          mutation({
            method: (name: string) => name,
            loader: async ({ params }) => ({ id: '4', name: params }),
          })
        ),
        withUserQueryById((store) => ({
          setQuerySource: (source) => ({ id: store.selected.id }),
        }))
      );
      const signalStoreInstance = TestBed.inject(store);

      type ExpectQueryToBeDefined = Expect<
        Equal<
          typeof signalStoreInstance.userQueryById,
          ResourceByIdRef<
            string,
            {
              id: number;
              name: string;
            }
          > & {
            pagination: 1;
          }
        >
      >;
      expect(signalStoreInstance.userQueryById).toBeDefined();
    });
  });
});
