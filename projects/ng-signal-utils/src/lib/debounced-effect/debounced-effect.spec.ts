import { DestroyRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';
import { debouncedEffect as sutOriginal } from './';

describe('debouncedEffect', () => {
  let debouncedEffect: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DestroyRef],
    });
    const testInjector = TestBed.inject(Injector);

    debouncedEffect = withInjectionContext(testInjector, sutOriginal);

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should debounce effect calls', () => {
    const query = signal('');
    const searchSpy = jasmine
      .createSpy('searchSpy')
      .and.callFake(() => `Running search with ${query()}`);

    debouncedEffect(() => searchSpy() && console.log(query()), 300);
    TestBed.flushEffects();

    query.set('a');
    TestBed.flushEffects();
    query.set('ab');
    TestBed.flushEffects();

    jasmine.clock().tick(100);

    query.set('abc');
    TestBed.flushEffects();
    query.set('abcd');
    TestBed.flushEffects();

    expect(searchSpy).not.toHaveBeenCalled();

    jasmine.clock().tick(300);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy.calls.mostRecent().returnValue).toBe(
      `Running search with abcd`
    );
  });

  it('should call effect function immediately when immediate flag is true', () => {
    const query = signal('initial q');
    const searchSpy = jasmine
      .createSpy('searchSpy')
      .and.callFake(() => `Running search with ${query()}`);

    debouncedEffect(() => searchSpy(), 300, { immediate: true });
    TestBed.flushEffects();

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy.calls.mostRecent().returnValue).toBe(
      `Running search with initial q`
    );
  });
});
