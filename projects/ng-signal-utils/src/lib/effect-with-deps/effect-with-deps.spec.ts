import { computed, DestroyRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { effectWithDeps as sutOriginal } from '.';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';

describe('effectWithDeps', () => {
  let effectWithDeps: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DestroyRef],
    });
    const testInjector = TestBed.inject(Injector);

    effectWithDeps = withInjectionContext(testInjector, sutOriginal);
  });

  it('should ignore untracked dependencies', () => {
    const username = signal('Alice');
    const counter = signal(0);

    const obj = {
      logCounterChange() {
        return `${username()} updated the counter to ${counter()}`;
      },
    };

    const effectCallback = spyOn(obj, 'logCounterChange').and.callThrough();

    effectWithDeps([counter], () => effectCallback());
    TestBed.flushEffects();

    // Initial effect callback invocation
    expect(effectCallback.calls.count()).toBe(1);
    expect(effectCallback.calls.mostRecent().returnValue).toBe(
      'Alice updated the counter to 0'
    );

    username.set('Bob');
    TestBed.flushEffects();
    username.set('Casey');
    TestBed.flushEffects();

    expect(effectCallback.calls.count()).toBe(1);
  });

  it('should invoke callback on change of tracked dependencies', () => {
    const username = signal('Alice');
    const counter = signal(0);

    const effectCallback = jasmine
      .createSpy('logCounter', () => {
        return `${username()} updated the counter to ${counter()}`;
      })
      .and.callThrough();

    effectWithDeps([counter], () => effectCallback());
    TestBed.flushEffects();

    // Initial effect callback invocation
    expect(effectCallback.calls.count()).toBe(1);
    expect(effectCallback.calls.mostRecent().returnValue).toBe(
      'Alice updated the counter to 0'
    );

    counter.set(1);
    TestBed.flushEffects();
    counter.set(2);
    TestBed.flushEffects();

    expect(effectCallback.calls.count()).toBe(3);
    expect(effectCallback.calls.mostRecent().returnValue).toBe(
      'Alice updated the counter to 2'
    );
  });

  it('should invoke callback on change of tracked computed signals', () => {
    const status = signal<'success' | 'error'>('success');
    const messageColor = computed(() =>
      status() === 'error' ? 'red' : 'green'
    );

    const effectCallback = jasmine
      .createSpy('logCounter', () => {
        return `messageColor: ${messageColor()}`;
      })
      .and.callThrough();

    effectWithDeps([messageColor], () => effectCallback());
    TestBed.flushEffects();

    // Initial effect callback invocation
    expect(effectCallback.calls.count()).toBe(1);
    expect(effectCallback.calls.mostRecent().returnValue).toBe(
      'messageColor: green'
    );

    status.set('error');
    TestBed.flushEffects();

    expect(effectCallback.calls.count()).toBe(2);
    expect(effectCallback.calls.mostRecent().returnValue).toBe(
      'messageColor: red'
    );
  });
});
