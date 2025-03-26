import { computed, signal, type WritableSignal } from '@angular/core';

export interface SignalHistoryOptions {
  /**
   * Maximum number of history entries to maintain.
   */
  maxHistory?: number;
}

/**
 * Creates a history tracking mechanism for an Angular signal changes.
 *
 * This utility allows you to track changes to a signal, providing
 * undo/redo functionality and maintaining a history of previous values.
 * Similar to `signal-history` but changes to the source signal are not tracked
 * automatically and instead rely on the `commit` method being called
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
export function managedSignalHistory<T>(
  source: WritableSignal<T>,
  options: SignalHistoryOptions = {}
) {
  const { maxHistory = Number.MAX_SAFE_INTEGER } = options;
  const history = signal<T[]>([]);
  const activeHistoryIndex = signal(0);
  const activeItem = computed(() => history()[activeHistoryIndex()]);

  const hasPreviousValue = computed(() => activeHistoryIndex() > 0);
  const hasNextValue = computed(
    () => activeHistoryIndex() < history().length - 1
  );

  /**
   * Adds the current state of the source signal to the history
   */
  function commit() {
    const currentHistory = history().slice(0, activeHistoryIndex() + 1);

    if (source() === currentHistory[currentHistory.length - 1]) return;

    history.update((h) => {
      const updatedHistory = [...currentHistory, source()];
      return updatedHistory.slice(-maxHistory);
    });

    activeHistoryIndex.set(Math.min(history().length - 1, maxHistory - 1));
  }

  /**
   * Reverts to the previous value in the history
   * Does nothing if no previous value exists
   */
  function undo() {
    if (!hasPreviousValue()) return;

    activeHistoryIndex.update((i) => i - 1);
    if (source() !== activeItem()) {
      source.set(activeItem());
    }
  }

  /**
   * Moves forward to the next value in the history
   * Does nothing if no next value exists
   */
  function redo() {
    if (!hasNextValue()) return;

    activeHistoryIndex.update((i) => i + 1);
    if (source() !== activeItem()) {
      source.set(activeItem());
    }
  }

  /**
   * Clears the history, resetting to the current source value
   */
  function clear() {
    history.set([source()]);
    activeHistoryIndex.set(0);
  }

  return {
    values: history,
    commit,
    undo,
    redo,
    clear,
    activeHistoryIndex,
  };
}
