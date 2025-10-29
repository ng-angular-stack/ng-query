import { linkedSignal, Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { query } from '../query';
import { serverState } from './server-state';
import { usingInputs } from './using-inputs';
import { usingQuery } from './using-query';
import { usingSources } from './using-sources';
import { source } from './source';
import { usingState } from './using-state';

describe('usingState', () => {
  it('should enable to defined a state that react on sources and inputs and other states', async () => {
    await TestBed.runInInjectionContext(async () => {
      const { injectServerState } = serverState(
        usingInputs({
          myParams: undefined as string | undefined,
        }),
        usingSources({
          reset: source<string>(),
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
        }),
        usingState(
          'user',
          ({ userQuery }) =>
            linkedSignal<
              | {
                  id: string;
                  name: string;
                  email: string;
                }
              | undefined,
              | {
                  id: string;
                  name: string;
                  email: string;
                }
              | undefined
            >({
              source: () =>
                userQuery.hasValue() ? userQuery.value() : undefined,
              computation: (currentSource, previousData) => {
                if (currentSource) {
                  return currentSource;
                }
                return previousData?.value;
              },
            }),
          ({ state, context: { userQuery, connectToResetSource } }) => ({
            restart: () => userQuery.value(),
            setName: (name: string) => {
              const stateValue = state();
              if (!stateValue) {
                return undefined;
              }
              return {
                ...stateValue,
                name,
              };
            },
            _resetToUndefined: connectToResetSource(
              (resetValue) => {
                expectTypeOf(resetValue).toEqualTypeOf<string>();
                return userQuery.value();
              },
              {
                expose: true,
              }
            ),
          })
        )
      );
      const myParams = signal('1');
      const store = injectServerState({
        myParams,
      });

      expectTypeOf(store.user).toEqualTypeOf<
        Signal<
          | {
              id: string;
              name: string;
              email: string;
            }
          | undefined
        >
      >();

      expect(store.user).toEqual(undefined);

      expect(store.userQuery).toBeDefined();
      await vi.runAllTimersAsync();
      expect(store.userQuery.value()).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
      expect(store.user).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });

      store.setName('Jane Doe'); // todo store.user.setName
      expect(store.user).toEqual({
        id: '1',
        name: 'Jane Doe',
        email: 'test@a.com',
      });

      store.restart();
      expect(store.user).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'test@a.com',
      });
      //@ts-expect-error should not be accessible, it's a private method
      expect(() => store._resetToUndefined()).toThrow();
      store.reset('resetValue');
      expect(store.user()).toEqual(undefined);
    });
  });
});
