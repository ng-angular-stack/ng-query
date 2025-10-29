import { computed, signal } from '@angular/core';
import { toSource } from './to-source';
import { ReadonlySource } from './util/source.type';
import { source } from './source';
import { computedSource } from './computed-source';

describe('computedSource', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should generate a computedSource', () => {
    const mySignal = source<{ text: string }>();
    const mySource = computedSource(
      mySignal,
      (sourceValue) => sourceValue.text
    );
    expectTypeOf(mySource).toEqualTypeOf<ReadonlySource<string>>();

    const myListener = computed(() => {
      const s = mySource();
      return s;
    });

    expect(myListener()).toBe(undefined);

    mySignal.set({ text: 'Hello World' });

    expect(myListener()).toBe('Hello World');

    mySignal.set({ text: 'Hello Ng-Query' });
    expect(myListener()).toBe('Hello Ng-Query');
  });
});
