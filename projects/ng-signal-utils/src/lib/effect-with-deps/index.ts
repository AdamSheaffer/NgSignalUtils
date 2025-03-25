import {
  DestroyRef,
  effect,
  inject,
  untracked,
  type Signal,
} from '@angular/core';

/**
 * Creates an effect that tracks dependencies and optionally manages its lifecycle.
 *
 * @template T The type of signals being tracked
 * @param deps An array of signals to be tracked by the effect
 * @param effectFn The function to be executed within the effect
 * @param options Configuration options for the effect
 *
 * @returns An effect reference that can be manually destroyed
 *
 * @description
 * This utility function provides enhanced effect creation with several key features:
 * - Explicitly reads dependencies to ensure proper tracking
 * - Executes the effect function in an untracked context
 * - Optionally manages effect lifecycle through automatic destruction
 *
 * @example
 * // Basic usage with signals
 * const count = signal(0);
 * const name = signal('John');
 *
 * effectWithDeps([count], () => {
 *   console.log(`${name()} set the count to ${count()}`);
 * });
 *
 * @example
 * // Disable automatic destruction
 * effectWithDeps([count], () => {
 *   // Effect logic
 * }, { autoDestroy: false });
 */
export function effectWithDeps<T extends Signal<any>>(
  deps: T[],
  effectFn: () => void,
  options: {
    /**
     * Automatically manage effect lifecycle
     * @default true
     */
    autoDestroy?: boolean;
  } = {}
) {
  const { autoDestroy = true } = options;

  const effectInstance = effect(() => {
    deps.forEach((dep) => dep());
    untracked(() => effectFn());
  });

  if (autoDestroy) {
    const destroyRef = inject(DestroyRef, { optional: true });
    destroyRef?.onDestroy(() => {
      effectInstance.destroy();
    });
  }

  return effectInstance;
}
