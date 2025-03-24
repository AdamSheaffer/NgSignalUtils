import { Injector } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';
import { localStorageSignal as sutOriginal } from './';

describe('localStorageSignal', () => {
  let localStorageSignal: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const testInjector = TestBed.inject(Injector);

    localStorageSignal = withInjectionContext(testInjector, sutOriginal);

    localStorage.clear();

    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();
  });

  it('should initialize with null when key does not exist in localStorage', () => {
    const signal = localStorageSignal<string>('non-existent-key');
    expect(signal()).toBeNull();
    expect(localStorage.getItem).toHaveBeenCalledWith('non-existent-key');
  });

  it('should initialize with a string value from localStorage if it exists', () => {
    localStorage.setItem('existing-key', JSON.stringify('test-value'));

    const signal = localStorageSignal<string>('existing-key');

    expect(signal()).toBe('test-value');
    expect(localStorage.getItem).toHaveBeenCalledWith('existing-key');
  });

  it('should update localStorage when signal value changes', fakeAsync(() => {
    const signal = localStorageSignal<string>('test-key');
    signal.set('new-value');

    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  }));

  it('should remove item from localStorage when signal is set to null', fakeAsync(() => {
    localStorage.setItem('test-key', JSON.stringify('initial-value'));

    const signal = localStorageSignal<string>('test-key');
    signal.set(null);

    tick();

    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(localStorage.getItem('test-key')).toBeNull();
  }));

  it('should handle string values correctly', fakeAsync(() => {
    const signal = localStorageSignal<string>('string-key');
    signal.set('test string');
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'string-key',
      '"test string"'
    );

    const newSignal = localStorageSignal<string>('string-key');
    expect(newSignal()).toBe('test string');
  }));

  it('should handle number values correctly', fakeAsync(() => {
    const signal = localStorageSignal<number>('number-key');
    signal.set(42);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('number-key', '42');

    const newSignal = localStorageSignal<number>('number-key');
    expect(newSignal()).toBe(42);
  }));

  it('should handle boolean values correctly', fakeAsync(() => {
    const signal = localStorageSignal<boolean>('boolean-key');
    signal.set(true);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('boolean-key', 'true');

    const newSignal = localStorageSignal<boolean>('boolean-key');
    expect(newSignal()).toBe(true);
  }));

  it('should handle object values correctly', fakeAsync(() => {
    const testObj = { name: 'test', value: 123 };
    const signal = localStorageSignal('object-key');
    signal.set(testObj);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'object-key',
      JSON.stringify(testObj)
    );

    const newSignal = localStorageSignal('object-key');
    expect(newSignal()).toEqual(testObj);
  }));

  it('should handle array values correctly', fakeAsync(() => {
    const testArray = [1, 2, 3, 'test'];
    const signal = localStorageSignal<Array<any>>('array-key');
    signal.set(testArray);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'array-key',
      JSON.stringify(testArray)
    );

    const newSignal = localStorageSignal<Array<any>>('array-key');
    expect(newSignal()).toEqual(testArray);
  }));

  it('should handle nested objects correctly', fakeAsync(() => {
    const complexObj = {
      name: 'test',
      details: {
        active: true,
        counts: [1, 2, 3],
        metadata: {
          created: '2023-01-01',
        },
      },
    };

    const signal = localStorageSignal<object>('complex-key');
    signal.set(complexObj);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify(complexObj)
    );

    const newSignal = localStorageSignal<object>('complex-key');
    expect(newSignal()).toEqual(complexObj);
  }));

  it('should handle JSON parse errors gracefully', () => {
    localStorage.setItem('invalid-json', '{invalid-json');

    const signal = localStorageSignal<object>('invalid-json');

    expect(signal()).toBeNull();
  });

  it('should update existing values in localStorage', fakeAsync(() => {
    const signal = localStorageSignal<string>('update-key');
    signal.set('initial');
    tick();

    signal.set('updated');
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'update-key',
      '"updated"'
    );
    expect(localStorage.getItem('update-key')).toBe('"updated"');
  }));

  it('should handle update from a different signal instance', fakeAsync(() => {
    const signal1 = localStorageSignal<number>('shared-key');
    signal1.set(100);
    tick();

    const signal2 = localStorageSignal<number>('shared-key');
    expect(signal2()).toBe(100);

    signal2.set(200);
    tick();

    expect(localStorage.getItem('shared-key')).toBe('200');

    const signal3 = localStorageSignal<number>('shared-key');
    expect(signal3()).toBe(200);
  }));
});
