import { craftQuery } from './craft-query';
import { craft } from './craft';
import { query } from '../query';
import { craftInputs } from './craft-inputs';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('craftInputs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a way to set serverState inputs', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectCraft } = craft(
        {
          name: '',
          providedIn: 'root',
        },
        craftInputs({
          myParams: undefined as string | undefined,
        }),
        craftQuery('user', (inputs) => {
          console.log('inputs', inputs);
          return query({
            params: inputs.myParams,
            loader: async ({ params }) => {
              console.log('query params', params);
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
      const store = injectCraft({
        inputs: {
          myParams,
        },
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
      const { injectTestCraft } = craft(
        {
          name: 'test',
          providedIn: 'root',
        },
        craftQuery('user', (inputs) => {
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
        })
      );
      const myParams = signal('1');
      const store = injectTestCraft();

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
