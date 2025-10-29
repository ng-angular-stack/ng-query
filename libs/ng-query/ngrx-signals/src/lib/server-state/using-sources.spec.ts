import { usingQuery } from './using-query';
import { serverState } from './server-state';
import { query } from '../query';
import { usingInputs } from './using-inputs';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { usingSources } from './using-sources';
import { source, Source } from './source';

describe('usingInputs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a way to set serverState inputs', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        usingInputs({
          myParams: undefined as string | undefined,
        }),
        usingSources({
          params: source<string>(),
          reset: source<string>(),
        }),
        usingQuery('user', (context) => {
          return query({
            params: context.myParams,
            loader: async ({ params }) => {
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
            },
          });
        })
      );
      const myParamsInput = signal('1');
      const paramsSource = signal('1');
      const resetSource = source<{id: string}>();
      const store = injectServerState((reset) => ({
        myParams: myParamsInput, // required
        params: paramsSource, // not required
        reset(resetSource, ({id}) => id, { exposeSource: true }),
    }));

      store.setParams('1');

      expect(store.userQuery).toBeDefined();
      await vi.runAllTimersAsync();
      expect(store.userQuery.value()).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
    });
  });
  it('2- It should not require inputs if no inputs are requested', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectTestServerState } = serverState(
        usingQuery('user', (inputs) => {
          console.log('inputs', inputs);
          return query({
            params: () => '1',
            loader: async ({ params }) => {
              return {
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              };
            },
          });
        }),
        {
          name: 'test',
        }
      );
      const myParams = signal('1');
      const store = injectTestServerState();

      expect(store.userQuery).toBeDefined();
      await vi.runAllTimersAsync();
      expect(store.userQuery.value()).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
    });
  });
});
