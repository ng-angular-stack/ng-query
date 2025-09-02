import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { delay, of } from 'rxjs';
import { preservedRxResource } from './preserved-rx-resource';

describe('Preserved RxResource', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should preserve the resource state across different queries', async () => {
    await TestBed.runInInjectionContext(async () => {
      const initialParams = signal({ data: 'initial' });
      const resource = preservedRxResource({
        params: initialParams,
        stream: ({ params }) => {
          return of(params.data).pipe(delay(10000));
        },
      });

      await vi.runAllTimersAsync();

      expect(resource.status()).toEqual('resolved');
      expect(resource.value()).toEqual('initial');

      // Simulate a query that modifies the resource
      initialParams.set({ data: 'modified' });
      expect(resource.status()).toEqual('loading');

      // Assert that the resource state is preserved
      expect(resource.value()).toEqual('initial');

      await vi.runAllTimersAsync();

      // Assert that the original modified state is still preserved
      expect(resource.status()).toEqual('resolved');
      expect(resource.value()).toEqual('modified');
    });
  });
});

function wait(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
