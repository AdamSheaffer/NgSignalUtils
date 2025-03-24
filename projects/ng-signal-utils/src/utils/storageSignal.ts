import { effect, signal } from '@angular/core';

export function storageSignal<
  TValue extends string | number | boolean | object | null | Array<any>
>(storage: Storage, key: string) {
  let parsedValue: TValue | null = null;

  try {
    const rawValue = storage.getItem(key);
    if (rawValue !== null) {
      parsedValue = JSON.parse(rawValue) as TValue;
    }
  } catch (error) {
    console.error(`Error parsing storage value for key "${key}":`, error);
  }

  const storageSignal = signal<TValue | null>(parsedValue);

  effect(() => {
    const value = storageSignal();
    if (value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  });

  return storageSignal;
}
