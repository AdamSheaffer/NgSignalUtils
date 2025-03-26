import { computed, DestroyRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';
import { debouncedSignal as sutOriginal } from './';

describe('debouncedSignal', () => {
  let debouncedSignal: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DestroyRef],
    });
    const testInjector = TestBed.inject(Injector);

    debouncedSignal = withInjectionContext(testInjector, sutOriginal);

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should debounce updates from source signal to output signal', () => {
    const query = signal('init');
    const debouncedQuery = debouncedSignal(query, 300);

    TestBed.flushEffects();
    expect(debouncedQuery()).toBe('init');

    query.set('a');
    TestBed.flushEffects();
    query.set('ab');
    TestBed.flushEffects();

    jasmine.clock().tick(100);
    expect(debouncedQuery()).toBe('init');

    jasmine.clock().tick(201);
    expect(debouncedQuery()).toBe('ab');
  });

  it('should work with a computed source signal', () => {
    const query = signal('init');
    const computedQuery = computed(() => query().toUpperCase());
    const debouncedQuery = debouncedSignal(computedQuery, 300);

    TestBed.flushEffects();
    expect(debouncedQuery()).toBe('INIT');

    query.set('a');
    TestBed.flushEffects();
    query.set('ab');
    TestBed.flushEffects();

    jasmine.clock().tick(100);
    expect(debouncedQuery()).toBe('INIT');

    jasmine.clock().tick(201);
    expect(debouncedQuery()).toBe('AB');
  });
});
