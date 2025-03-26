import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signalHistory } from 'ng-signal-utils';

@Component({
  selector: 'app-signal-history',
  imports: [FormsModule],
  template: `<div>
    <h1>
      <pre>signalHistory</pre>
    </h1>
    <div>
      <input type="text" [(ngModel)]="textValue" />
      <div>value: {{ textValue() }}</div>

      <button (click)="history.undo()">Undo</button>
      <button (click)="history.redo()">Redo</button>
      <button (click)="history.clear()">Clear</button>
      <button (click)="history.stop()">Stop</button>
    </div>

    <div>
      History values
      <ul>
        @for (value of history.values(); let i = $index; track value + $index) {
        <li>
          @if (i === history.activeHistoryIndex()) {
          <strong>{{ value }}</strong>
          } @else {

          {{ value }}
          }
        </li>
        }
      </ul>
    </div>
  </div> `,
})
export class SignalHistoryComponent {
  textValue = signal('');
  history = signalHistory(this.textValue);
}
