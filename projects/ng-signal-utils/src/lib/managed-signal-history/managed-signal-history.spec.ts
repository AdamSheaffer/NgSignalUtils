import { DestroyRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { managedSignalHistory as sutOriginal } from '.';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';

describe('signalHistory', () => {
  let managedSignalHistory: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DestroyRef],
    });
    const testInjector = TestBed.inject(Injector);

    managedSignalHistory = withInjectionContext(testInjector, sutOriginal);
  });

  it("shouldn't add values to history until `commit` is called", () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    TestBed.flushEffects();

    state.set('second edit');
    TestBed.flushEffects();

    expect(history.values()).toEqual(['']);

    history.commit();

    expect(history.values()).toEqual(['', 'second edit']);
  });

  it('should undo the last change', () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();

    state.set('second edit');
    history.commit();
    TestBed.flushEffects();

    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    history.undo();
    expect(state()).toBe('second edit');

    history.undo();
    expect(state()).toBe('first edit');
  });

  it('should keep correct ordering when calling undo at history start and redo at end', () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();

    history.undo();
    history.undo();
    history.undo();
    history.undo();
    history.undo();

    expect(state()).toBe('');

    history.redo();
    expect(state()).toBe('first edit');

    history.redo();
    history.redo();
    history.redo();
    history.redo();

    expect(state()).toBe('first edit');
  });

  it('should redo the last change after an undo', () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();
    state.set('second edit');
    history.commit();
    TestBed.flushEffects();
    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    history.undo();
    history.undo();
    expect(state()).toBe('first edit');

    history.redo();
    expect(state()).toBe('second edit');
    history.redo();
    expect(state()).toBe('third edit');
  });

  it('should track all history values', () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();
    state.set('second edit');
    history.commit();
    TestBed.flushEffects();
    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    expect(history.values()).toEqual([
      '',
      'first edit',
      'second edit',
      'third edit',
    ]);
  });

  it('should slice history values after mid history edits', () => {
    const state = signal('');
    const history = managedSignalHistory(state);

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();
    state.set('second edit');
    history.commit();
    TestBed.flushEffects();
    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    history.undo();

    // After undo, history should still have all values
    expect(history.values()).toEqual([
      '',
      'first edit',
      'second edit',
      'third edit',
    ]);

    // After mid history edit, 'third edit' should be gone
    state.set('fourth edit');
    history.commit();
    TestBed.flushEffects();

    expect(history.values()).toEqual([
      '',
      'first edit',
      'second edit',
      'fourth edit',
    ]);
  });

  it('should release old history values when at capacity', () => {
    const state = signal('');
    const history = managedSignalHistory(state, { maxHistory: 2 });

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();
    state.set('second edit');
    history.commit();
    TestBed.flushEffects();
    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    expect(history.values()).toEqual(['second edit', 'third edit']);
  });

  it('should clear history', () => {
    const state = signal('');
    const history = managedSignalHistory(state, { maxHistory: 2 });

    state.set('first edit');
    history.commit();
    TestBed.flushEffects();
    state.set('second edit');
    history.commit();
    TestBed.flushEffects();
    state.set('third edit');
    history.commit();
    TestBed.flushEffects();

    history.clear();

    expect(history.values()).toEqual(['third edit']);
  });
});
