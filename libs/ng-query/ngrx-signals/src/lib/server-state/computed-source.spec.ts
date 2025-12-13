import { computed } from '@angular/core';
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
    const mySource = source<{ text: string }>();
    const myComputedSource = computedSource(
      mySource,
      (sourceValue) => sourceValue.text
    );

    expectTypeOf(myComputedSource).toEqualTypeOf<ReadonlySource<string>>();

    const myListener = computed(() => {
      const s = mySource();
      return s;
    });

    expect(myListener()).toBe(undefined);

    myComputedSource.set({ text: 'Hello World' });

    expect(myListener()).toBe('Hello World');

    myComputedSource.set({ text: 'Hello Ng-Query' });
    expect(myListener()).toBe('Hello Ng-Query');
  });
});
