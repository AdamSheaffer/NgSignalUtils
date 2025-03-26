import { type Signal, signal, untracked } from '@angular/core';
import { debouncedEffect } from '../debounced-effect';

/**
 * Returns a new readonly signal that updates with a delay from a source signal,
 * preventing rapid consecutive updates.
 *
 * @template T The type of value held by the signal
 * @param source The original signal to debounce
 * @param wait The number of milliseconds to delay updates
 *
 * @returns A readonly signal that updates with a delay
 *
 * @example
 * // Debounce a search input signal with 300ms delay
 * const searchTerm = signal('');
 * const debouncedSearch = debouncedSignal(searchTerm, 300);
 *
 * @example
 * // Use in a component to reduce frequent updates
 * @Component({
 *   template: `
 *     <input [value]="searchTerm()" (input)="searchTerm.set($event.target.value)" />
 *     <div>Debounced: {{ debouncedSearch() }}</div>
 *   `
 * })
 * export class SearchComponent {
 *   searchTerm = signal('');
 *   debouncedSearch = debouncedSignal(this.searchTerm, 300);
 * }
 */
export function debouncedSignal<T>(source: Signal<T>, wait: number) {
  const debouncedSignal = signal<T>(source());

  debouncedEffect(
    () => {
      const newValue = source();
      untracked(() => {
        debouncedSignal.set(newValue);
      });
    },
    wait,
    { immediate: false }
  );

  return debouncedSignal.asReadonly();
}
