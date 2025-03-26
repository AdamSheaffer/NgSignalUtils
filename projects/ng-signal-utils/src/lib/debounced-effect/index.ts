import { DestroyRef, effect, inject } from '@angular/core';
import debounce from 'lodash.debounce';

/**
 * Creates a debounced effect that limits the frequency of callback execution.
 *
 * @param effectFn - The effect function to be debounced
 * @param wait - The number of milliseconds to wait before invoking the function
 * @param options - Configuration options for the effect
 * @returns An effect reference
 *
 * @example
 * // Debounce a search effect with 300ms wait
 * debouncedEffect(() => {
 *   performSearch(searchQuery());
 * }, 300);
 *
 * @example
 * // Immediate effect on first call
 * debouncedEffect(() => {
 *   performSearch(searchQuery());
 * }, 300, { immediate: true });
 */
export function debouncedEffect(
  effectFn: () => any,
  wait: number,
  options: {
    /**
     * Automatically manage effect lifecycle
     * @default true
     */
    autoDestroy?: boolean;
    /**
     * Whether to trigger the function on the leading edge (first call)
     * instead of the trailing edge
     * @default true
     */
    immediate?: boolean;
  } = {}
) {
  const { autoDestroy = true, immediate = false } = options;

  const debouncedFunction = debounce(() => effectFn(), wait, {
    leading: immediate,
    trailing: !immediate,
  });

  const effectInstance = effect(() => {
    debouncedFunction();
  });

  if (autoDestroy) {
    const destroyRef = inject(DestroyRef, { optional: true });
    destroyRef?.onDestroy(() => {
      effectInstance.destroy();
    });
  }

  return effectInstance;
}
