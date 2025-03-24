import { Injector } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { sessionStorageSignal as sutOriginal } from '.';
import { withInjectionContext } from '../../utils/testing/withInjectionContext';

describe('sessionStorageSignal', () => {
  let sessionStorageSignal: typeof sutOriginal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const testInjector = TestBed.inject(Injector);

    sessionStorageSignal = withInjectionContext(testInjector, sutOriginal);

    sessionStorage.clear();

    spyOn(sessionStorage, 'getItem').and.callThrough();
    spyOn(sessionStorage, 'setItem').and.callThrough();
    spyOn(sessionStorage, 'removeItem').and.callThrough();
  });

  it('should initialize with null when key does not exist in sessionStorage', () => {
    const signal = sessionStorageSignal<string>('non-existent-key');
    expect(signal()).toBeNull();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('non-existent-key');
  });

  it('should initialize with a string value from sessionStorage if it exists', () => {
    sessionStorage.setItem('existing-key', JSON.stringify('test-value'));

    const signal = sessionStorageSignal<string>('existing-key');

    expect(signal()).toBe('test-value');
    expect(sessionStorage.getItem).toHaveBeenCalledWith('existing-key');
  });

  it('should update sessionStorage when signal value changes', fakeAsync(() => {
    const signal = sessionStorageSignal<string>('test-key');
    signal.set('new-value');

    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
    expect(sessionStorage.getItem('test-key')).toBe('"new-value"');
  }));

  it('should remove item from sessionStorage when signal is set to null', fakeAsync(() => {
    sessionStorage.setItem('test-key', JSON.stringify('initial-value'));

    const signal = sessionStorageSignal<string>('test-key');
    signal.set(null);

    tick();

    expect(sessionStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(sessionStorage.getItem('test-key')).toBeNull();
  }));

  it('should handle string values correctly', fakeAsync(() => {
    const signal = sessionStorageSignal<string>('string-key');
    signal.set('test string');
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'string-key',
      '"test string"'
    );

    const newSignal = sessionStorageSignal<string>('string-key');
    expect(newSignal()).toBe('test string');
  }));

  it('should handle number values correctly', fakeAsync(() => {
    const signal = sessionStorageSignal<number>('number-key');
    signal.set(42);
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith('number-key', '42');

    const newSignal = sessionStorageSignal<number>('number-key');
    expect(newSignal()).toBe(42);
  }));

  it('should handle boolean values correctly', fakeAsync(() => {
    const signal = sessionStorageSignal<boolean>('boolean-key');
    signal.set(true);
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith('boolean-key', 'true');

    const newSignal = sessionStorageSignal<boolean>('boolean-key');
    expect(newSignal()).toBe(true);
  }));

  it('should handle object values correctly', fakeAsync(() => {
    const testObj = { name: 'test', value: 123 };
    const signal = sessionStorageSignal('object-key');
    signal.set(testObj);
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'object-key',
      JSON.stringify(testObj)
    );

    const newSignal = sessionStorageSignal('object-key');
    expect(newSignal()).toEqual(testObj);
  }));

  it('should handle array values correctly', fakeAsync(() => {
    const testArray = [1, 2, 3, 'test'];
    const signal = sessionStorageSignal<Array<any>>('array-key');
    signal.set(testArray);
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'array-key',
      JSON.stringify(testArray)
    );

    const newSignal = sessionStorageSignal<Array<any>>('array-key');
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

    const signal = sessionStorageSignal<object>('complex-key');
    signal.set(complexObj);
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify(complexObj)
    );

    const newSignal = sessionStorageSignal<object>('complex-key');
    expect(newSignal()).toEqual(complexObj);
  }));

  it('should handle JSON parse errors gracefully', () => {
    sessionStorage.setItem('invalid-json', '{invalid-json');

    const signal = sessionStorageSignal<object>('invalid-json');

    expect(signal()).toBeNull();
  });

  it('should update existing values in sessionStorage', fakeAsync(() => {
    const signal = sessionStorageSignal<string>('update-key');
    signal.set('initial');
    tick();

    signal.set('updated');
    tick();

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'update-key',
      '"updated"'
    );
    expect(sessionStorage.getItem('update-key')).toBe('"updated"');
  }));

  it('should handle update from a different signal instance', fakeAsync(() => {
    const signal1 = sessionStorageSignal<number>('shared-key');
    signal1.set(100);
    tick();

    const signal2 = sessionStorageSignal<number>('shared-key');
    expect(signal2()).toBe(100);

    signal2.set(200);
    tick();

    expect(sessionStorage.getItem('shared-key')).toBe('200');

    const signal3 = sessionStorageSignal<number>('shared-key');
    expect(signal3()).toBe(200);
  }));
});
