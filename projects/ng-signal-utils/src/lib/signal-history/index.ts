import { effect, untracked, type WritableSignal } from '@angular/core';
import {
  managedSignalHistory,
  type SignalHistoryOptions,
} from '../managed-signal-history';

/**
 * Creates a history tracking mechanism for an Angular signal changes.
 *
 * This utility allows you to track changes to a signal, providing
 * undo/redo functionality and maintaining a history of previous values.
 *
 * @template T The type of value stored in the signal
 * @param source The original signal to track
 * @param options Configuration options for history tracking
 * @returns An object containing all history values and undo/redo methods
 *
 * @example
 * const count = signal(0);
 * const history = signalHistory(count);
 *
 * count.set(1);  // Add to history
 * count.set(2);  // Add to history
 *
 * history.undo();  // Goes back to 1
 * history.redo();  // Goes back to 2
 */
export function signalHistory<T>(
  source: WritableSignal<T>,
  options: SignalHistoryOptions = {}
) {
  const history = managedSignalHistory(source, options);

  const effectInstance = effect(() => {
    const newValue = source();
    untracked(() => history.commit());
  });

  /**
   * Stops tracking changes to the source signal
   * Useful for cleanup and preventing memory leaks
   */
  function stop() {
    effectInstance.destroy();
  }

  return {
    values: history.values,
    activeHistoryIndex: history.activeHistoryIndex,
    undo: history.undo,
    redo: history.redo,
    clear: history.clear,
    stop,
  };
}
