import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'signalHistory',
    pathMatch: 'full',
  },
  {
    path: 'signalHistory',
    loadComponent: () =>
      import('./examples/signal-history.component').then(
        (m) => m.SignalHistoryComponent
      ),
  },
  {
    path: 'effectUntil',
    loadComponent: () =>
      import('./examples/effect-until.component').then(
        (m) => m.EffectUntilComponent
      ),
  },
];
