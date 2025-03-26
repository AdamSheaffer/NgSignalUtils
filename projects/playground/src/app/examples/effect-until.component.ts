import { Component, signal } from '@angular/core';
import { effectUntil } from 'ng-signal-utils';

@Component({
  selector: 'app-effect-until',
  imports: [],
  template: `<div>
    <h1>
      <pre>effectUntil</pre>
    </h1>
    <div>Counter: {{ counter() }}</div>
    <button (click)="incrementCounter()">Increment</button>
    <div>
      <em>
        Counter value will console.log until it reaches 5. Open console to view.
      </em>
    </div>
  </div> `,
})
export class EffectUntilComponent {
  counter = signal(0);

  constructor() {
    effectUntil(
      () => console.log(this.counter()),
      () => this.counter() > 5
    );
  }

  incrementCounter() {
    this.counter.update((c) => c + 1);
  }
}
