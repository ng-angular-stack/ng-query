import { of } from 'rxjs';
import { globalQueries } from '../../global-query/global-queries';
import { rxQuery } from '../../rx-query';
import { SignalProxy } from '../../signal-proxy';
import { inject, Injectable, input } from '@angular/core';

@Injectable({ providedIn: 'root' })
class ApiService {
  getUser(id: string) {
    return of({ id, name: 'User ' + id });
  }
}

const { injectUserQuery, withUserQuery } = globalQueries({
  queries: {
    user: {
      query: (
        source: SignalProxy<{ id: string | undefined }>,
        api = inject(ApiService)
      ) =>
        rxQuery({
          params: () => '1',
          stream: ({ params: id }) => api.getUser(id),
        }),
    },
  },
});

@Component({
  // ...
  template: ` {{ userQuery.hasValue() ? userQuery.value().name : 'Hum...' }} `,
})
export class HeaderComponent {
  selectedUserId = input<string>();
  //          👇 inject global query as regular services
  userQuery = injectUserQuery(() => ({ id: this.selectedUserId }));
}

const UserStore = signalStore(
  { providedIn: 'root' },
  // 👇 inject global query in the signalStore
  withUserQuery()
);

@Component({
  // ...
  template: `
    {{
      userStore.userQuery.hasValue()
        ? userStore.userQuery.value().name
        : 'Hum...'
    }}
  `,
})
export class UserComponent {
  userStore = inject(UserStore);
}
