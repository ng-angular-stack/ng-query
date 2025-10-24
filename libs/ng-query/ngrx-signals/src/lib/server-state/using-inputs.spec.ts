import { usingQuery } from './using-query';
import { serverState } from './server-state';
import { query } from '../query';
import { usingInputs } from './using-inputs';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
        usingQuery('user', (inputs) => {
          console.log('inputs', inputs);
          return query({
            params: inputs.myParams,
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
      const myParams = signal('1');
      const store = injectServerState({
        myParams,
      });

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
