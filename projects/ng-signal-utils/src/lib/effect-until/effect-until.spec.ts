import { DestroyRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';
import { effectUntil as sutOriginal } from './';

describe('effectUntil', () => {
  let effectUntil: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DestroyRef],
    });

    const testInjector = TestBed.inject(Injector);

    effectUntil = withInjectionContext(testInjector, sutOriginal);
  });

  it('should execute effect function when predicate is false', () => {
    const counter = signal(0);
    const effectFn = jasmine.createSpy('mockEffect').and.callFake(() => {
      console.log(`Counter: ${counter()}`);
    });

    effectUntil(
      () => effectFn(),
      () => false
    );

    TestBed.flushEffects();

    expect(effectFn.calls.count()).toBe(1);

    counter.set(1);
    TestBed.flushEffects();

    counter.set(2);
    TestBed.flushEffects();

    expect(effectFn.calls.count()).toBe(3);
  });

  it('should stop executing effect function when predicate is true', () => {
    const counter = signal(0);
    const effectFn = jasmine.createSpy('mockEffect').and.callFake(() => {
      console.log(`Counter: ${counter()}`);
    });

    effectUntil(
      () => effectFn(),
      () => counter() >= 3
    );

    TestBed.flushEffects();

    expect(effectFn.calls.count()).toBe(1);

    counter.set(1);
    TestBed.flushEffects();

    counter.set(2);
    TestBed.flushEffects();

    expect(effectFn.calls.count()).toBe(3);

    effectFn.calls.reset();
    counter.set(3);
    TestBed.flushEffects();
    counter.set(4);
    TestBed.flushEffects();

    expect(effectFn).not.toHaveBeenCalled();
  });
});
