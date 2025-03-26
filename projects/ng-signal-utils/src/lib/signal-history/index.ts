import {
  computed,
  effect,
  signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

interface SignalHistoryOptions {
  maxHistory?: number;
}

export function signalHistory<T>(
  source: WritableSignal<T>,
  options: SignalHistoryOptions = {}
) {
  const { maxHistory = 100 } = options;
  const history = signal<T[]>([source()]);
  const activeHistoryIndex = signal(0);

  const activeItem = computed(() => history()[activeHistoryIndex()]);

  const hasPreviousValue = computed(() => activeHistoryIndex() > 0);
  const hasNextValue = computed(
    () => activeHistoryIndex() < history().length - 1
  );

  const effectInstance = effect(() => {
    const newValue = source();
    untracked(() => {
      history.update((h) => {
        // Slice to the current index to handle mid-history edits
        const currentHistory = h.slice(0, activeHistoryIndex() + 1);
        const updatedHistory = [...currentHistory, newValue];
        return updatedHistory.slice(-maxHistory);
      });

      activeHistoryIndex.set(Math.min(history().length - 1, maxHistory - 1));
    });
  });

  function undo() {
    if (!hasPreviousValue()) return;

    activeHistoryIndex.update((i) => i - 1);
    source.set(activeItem());
  }

  function redo() {
    if (!hasNextValue()) return;

    activeHistoryIndex.update((i) => i + 1);
    source.set(activeItem());
  }

  function clear() {
    history.set([source()]);
    activeHistoryIndex.set(0);
  }

  function stop() {
    effectInstance.destroy();
  }

  return {
    values: history,
    undo,
    redo,
    clear,
    stop,
  };
}
