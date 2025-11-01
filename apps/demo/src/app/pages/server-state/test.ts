import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  on,
  serverState,
  source,
  usingSources,
  usingState,
} from '@ng-query/ngrx-signals';

const { injectServerState } = serverState(
  usingSources({
    increment: source<string>(),
  }),
  usingState(
    'test',
    () => signal(0),
    ({ context: { increment }, state }) => ({
      increment: on(increment, () => state() + 1),
    })
  )
);

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: ` {{ store.test() }}
    <button (click)="store.setIncrement('gp')">Increment</button>`,
})
export default class TestComponent {
  store = injectServerState();
}
