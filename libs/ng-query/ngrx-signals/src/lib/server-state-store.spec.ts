import {
  signalStore,
  signalStoreFeature,
  withProps,
  withState,
} from '@ngrx/signals';
import { ServerStateStore } from './server-state-store';
import { withMutation } from './with-mutation';
import { rxMutation } from './rx-mutation';
import { of } from 'rxjs';
import { withQuery } from './with-query';
import { rxQuery } from './rx-query';
import { TestBed } from '@angular/core/testing';
import { Expect, Equal } from 'test-type';
import { ApplicationRef, signal, Signal } from '@angular/core';
import { IsAny } from './types/util.type';
import { expectTypeOf } from 'vitest';
import { SignalProxy } from './signal-proxy';

type User = {
  id: string;
  name: string;
};
describe('SignalServerState', () => {
  it('1-should create an instance', () => {
    const serverStateFeature = signalStoreFeature(
      withMutation('updateName', () =>
        rxMutation({
          method: (user: User) => user,
          stream: ({ params: user }) => of(user),
        })
      ),
      withQuery('user', () =>
        rxQuery({
          params: () => '1',
          stream: ({ params }) =>
            of({
              id: params,
              name: 'Romain',
            }),
        })
      )
    );

    const { UserServerStateStore, withUserServerState } = ServerStateStore(
      'user',
      serverStateFeature
    );

    expect(UserServerStateStore).toBeDefined();
    expect(withUserServerState).toBeDefined();

    const consumerStore = signalStore(
      withState({
        selectedId: '1',
      }),
      withUserServerState()
    );
  });

  it('2-should inject a store and expose global server state api', () => {
    const serverStateFeature = signalStoreFeature(
      withMutation('updateName', () =>
        rxMutation({
          method: (user: User) => user,
          stream: ({ params: user }) => of(user),
        })
      ),
      withQuery('user', () =>
        rxQuery({
          params: () => '1',
          stream: ({ params }) =>
            of({
              id: params,
              name: 'Romain',
            }),
        })
      )
    );

    const { UserServerStateStore, test } = ServerStateStore(
      'user',
      serverStateFeature
    );

    TestBed.configureTestingModule({
      providers: [UserServerStateStore],
    });
    TestBed.runInInjectionContext(() => {
      const userServerStateStore = TestBed.inject(UserServerStateStore);

      type ExpectServerStateStorePropertiesToBeExposed = Expect<
        Equal<

            | 'updateNameMutation'
            | 'userQuery'
            | 'mutateUpdateName' extends keyof typeof userServerStateStore
            ? true
            : false,
          true
        >
      >;

      expect(userServerStateStore).toBeDefined();
      expect(userServerStateStore.updateNameMutation).toBeDefined();
      expect(userServerStateStore.userQuery).toBeDefined();
      expect(userServerStateStore.mutateUpdateName).toBeDefined();
    });
  });

  it('3-should you the withServerState in signalStore and expose global server state api', () => {
    const serverStateFeature = signalStoreFeature(
      withMutation('updateName', () =>
        rxMutation({
          method: (user: User) => user,
          stream: ({ params: user }) => of(user),
        })
      ),
      withQuery('user', () =>
        rxQuery({
          params: () => '1',
          stream: ({ params }) =>
            of({
              id: params,
              name: 'Romain',
            }),
        })
      )
    );

    const { withUserServerState } = ServerStateStore(
      'user',
      serverStateFeature
    );

    const ConsumerStore = signalStore(
      withState({
        selectedId: '1',
      }),
      withUserServerState()
    );

    TestBed.configureTestingModule({
      providers: [ConsumerStore],
    });
    const consumerUserServerStateStore = TestBed.inject(ConsumerStore);

    type ExpectServerStateStorePropertiesToBeExposed = Expect<
      Equal<

          | 'updateNameMutation'
          | 'userQuery'
          | 'mutateUpdateName' extends keyof typeof consumerUserServerStateStore
          ? true
          : false,
        true
      >
    >;

    expect(consumerUserServerStateStore).toBeDefined();
    expect(consumerUserServerStateStore.updateNameMutation.value).toBeDefined();
    expect(consumerUserServerStateStore.userQuery.value).toBeDefined();
    expect(consumerUserServerStateStore.mutateUpdateName).toBeDefined();
  });

  it('4- should inject a single instance of server state store', () => {
    let instanceCount = 0;
    const serverStateFeature = signalStoreFeature(
      withMutation('updateName', () =>
        rxMutation({
          method: (user: User) => user,
          stream: ({ params: user }) => of(user),
        })
      ),
      withQuery('user', () =>
        rxQuery({
          params: () => '1',
          stream: ({ params }) =>
            of({
              id: params,
              name: 'Romain',
            }),
        })
      ),
      withProps(() => {
        instanceCount++;
        return {};
      })
    );

    const { UserServerStateStore, withUserServerState, isPluggable } =
      ServerStateStore('user', serverStateFeature, {
        providedIn: 'root',
      });

    const ConsumerStore = signalStore(
      withState({
        selectedId: '1',
      }),
      withUserServerState()
    );

    TestBed.configureTestingModule({
      providers: [UserServerStateStore, ConsumerStore],
    });
    const userServerStateStore = TestBed.inject(UserServerStateStore);
    type ExpectSuerStoreNotAny = Expect<
      Equal<IsAny<typeof userServerStateStore>, false>
    >;
    const consumerServerStateStore = TestBed.inject(ConsumerStore);

    type ExpectConsumerServerStateStoreNotAny = Expect<
      Equal<IsAny<typeof consumerServerStateStore>, false>
    >;

    expect(userServerStateStore).toBeDefined();
    expect(consumerServerStateStore).toBeDefined();
    expect(instanceCount).toBe(1);
  });

  it('5- should enable to set the pluggable config by using the custom inject server state store', (done) => {
    const { injectUserServerState, withUserServerState, isPluggable } =
      ServerStateStore(
        'user',
        (data: SignalProxy<{ selectedId: string | undefined }>) =>
          signalStoreFeature(
            withMutation('updateName', () =>
              rxMutation({
                method: (user: User) => user,
                stream: ({ params: user }) => of(user),
              })
            ),
            withQuery('user', () => {
              return rxQuery({
                params: data.selectedId,
                stream: ({ params }) =>
                  of({
                    id: params,
                    name: 'Romain',
                  }),
              });
            })
          ),
        {
          isPluggable: true,
        }
      );

    TestBed.runInInjectionContext(async () => {
      const selectedId = signal('1');
      const userServerStateStore = injectUserServerState({
        selectedId,
      });
      await wait(10);
      await TestBed.inject(ApplicationRef).whenStable();

      expectTypeOf(
        userServerStateStore.userQuery.value()
      ).toEqualTypeOf<User>();

      expect(userServerStateStore.userQuery.value()).toEqual({
        id: '1',
        name: 'Romain',
      });

      selectedId.set('2');

      expect(userServerStateStore.userQuery.value()).toEqual({
        id: '2',
        name: 'Romain',
      });
    });
  });
});

function wait(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
