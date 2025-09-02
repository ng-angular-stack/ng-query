import { computed } from '@angular/core';
import { signalStoreFeature, withProps } from '@ngrx/signals';
import { delay, of } from 'rxjs';
import { User } from '../../resource-by-group/api.service';
import { rxMutation } from '../rx-mutation';
import { rxQuery } from '../rx-query';
import { ServerStateStore } from '../server-state-store';
import { SignalProxy } from '../signal-proxy';
import { withMutation } from '../with-mutation';
import { withQuery } from '../with-query';

export const { isPluggable, injectUserDetailsServerState } = ServerStateStore(
  'userDetails',
  (data: SignalProxy<{ selectedId: string | undefined }>) =>
    signalStoreFeature(
      withMutation('name', () =>
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
            }).pipe(delay(1300)),
        });
      })
    ),
  {
    isPluggable: true,
  }
);
