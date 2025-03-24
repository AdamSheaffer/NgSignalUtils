import { effect, signal } from '@angular/core';
/**
 * Creates a writable signal that synchronizes with localStorage.
 * Values are serialized to JSON when storing and parsed when retrieving.
 *
 * @param key The localStorage key to use for persistence
 * @returns A writable signal containing the current value from localStorage
 * @throws May throw an error if the stored value cannot be parsed as JSON
 *
 * @example
 * interface UserPreferences {
 *   theme: string;
 *   notifications: boolean;
 * }
 *
 * export class MyComponent {
 *   prefs = localStorageSignal<UserPreferences>('user-preferences');
 *
 *  setPreferences() {
 *    this.prefs.set({ theme: 'dark', notifications: true });
 *  }
 *
 *   // Setting null removes the item from localStorage
 *   clearPreferences() {
 *     this.prefs.set(null);
 *   }
 * }
 */
export function localStorageSignal<
  TValue extends string | number | boolean | object | null | Array<any>
>(key: string) {
  let parsedValue: TValue | null = null;

  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue !== null) {
      parsedValue = JSON.parse(rawValue) as TValue;
    }
  } catch (error) {
    console.error(`Error parsing localStorage value for key "${key}":`, error);
  }

  const storageSignal = signal<TValue | null>(parsedValue);

  effect(() => {
    const value = storageSignal();
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  return storageSignal;
}
