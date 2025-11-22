import { usingQuery } from './using-query';
import { serverState } from './server-state';
import { query } from '../query';
import { Injectable, InjectionToken, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { usingInject } from './using-inject';

// todo expose inputs by {inputs, queryParams}
// todo test injection tokens, geneics

describe('usingInject', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('1- Should expose a way to use injectable services', async () => {
    @Injectable({
      providedIn: 'root',
    })
    class MyService {
      myParams = signal('1');
    }
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingInject(() => ({
          MyService,
        })),
        usingQuery('user', ({ myService }) => {
          return query({
            params: myService.myParams,
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
      const store = injectServerState();

      expect(store.userQuery).toBeDefined();
      await vi.runAllTimersAsync();
      expect(store.userQuery.value()).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
    });
  });

  it('2- Should expose a way to set injectable with generics', async () => {
    @Injectable({
      providedIn: 'root',
    })
    class MyService<T> {
      myParams = signal('1');
      getValue(): T {
        return '1' as T;
      }
    }
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingInject(() => ({
          MyService: MyService<{ id: string }>,
        })),
        usingQuery('user', ({ myService }) => {
          expectTypeOf<typeof myService>().toEqualTypeOf<
            MyService<{ id: string }>
          >();
          return query({
            params: () => myService.getValue(),
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
      const store = injectServerState();

      expect(store.userQuery).toBeDefined();
      await vi.runAllTimersAsync();
      expect(store.userQuery.value()).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
    });
  });

  it('3- Should expose a way to set injectable with injection tokens', async () => {
    const MyToken = new InjectionToken('MyToken', {
      providedIn: 'root',
      factory: () => ({ id: '1' }),
    });

    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        {
          name: '',
          providedIn: 'root',
        },
        usingInject(() => ({
          MyToken: MyToken,
        })),
        usingQuery('user', ({ myToken }) => {
          expectTypeOf<typeof myToken>().toEqualTypeOf<{ id: string }>();
          return query({
            params: () => myToken,
            loader: async ({ params }) => {
              return {
                id: params.id,
                name: 'John Doe',
                email: 'test@a.com',
              };
            },
          });
        })
      );
      const store = injectServerState();

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
