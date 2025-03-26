import { DestroyRef, effect, inject } from '@angular/core';

/**
 * Creates a managed effect that is automatically destroyed when a condition is met.
 *
 * @param effectFn - The effect function to be executed until the predicate becomes true
 * @param predicate - A function that determines when the effect should stop
 * @param options - Configuration options for the effect
 *
 * @returns An effect reference that can be manually destroyed
 *
 * @example
 * // Run an effect until a condition is met
 * effectUntil(
 *   () => {
 *     // Perform some side effect
 *     updateSomeData();
 *   },
 *   () => isDataFullyLoaded
 * );
 *
 * @example
 * // Disable auto-destroy if needed
 * effectUntil(
 *   () => trackSomeMetrics(),
 *   () => shouldStopTracking,
 *   { autoDestroy: false }
 * );
 */
export function effectUntil(
  effectFn: () => void,
  predicate: () => boolean,
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
    if (predicate()) {
      effectInstance.destroy();
    } else {
      effectFn();
    }
  });

  if (autoDestroy) {
    const destroyRef = inject(DestroyRef, { optional: true });
    destroyRef?.onDestroy(() => {
      effectInstance.destroy();
    });
  }

  return effectInstance;
}
