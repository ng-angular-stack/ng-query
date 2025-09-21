import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { uxLoader } from './ux-loader';
import { TestBed } from '@angular/core/testing';
// todo instead of loading boolean // resourceStatus ?
describe('uxLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('does not show spinner when faster than delay', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(true);
      const uxLoading = uxLoader(loading, { delay: 300 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(299);
      loading.set(false);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(500);
      expect(uxLoading()).toBe(false);
    });
  });

  it('does not show spinner when loading is always false', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(false);
      const uxLoading = uxLoader(loading, { delay: 300, minDuration: 200 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(199);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(100);
      expect(uxLoading()).toBe(false);
    });
  });

  it('shows spinner when slower than delay', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(true);
      const uxLoading = uxLoader(loading, { delay: 200, minDuration: 500 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      loading.set(false);
      await vi.advanceTimersByTimeAsync(499);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(100);
      expect(uxLoading()).toBe(false);
    });
  });

  it('shows spinner until loading finish after delay + minDuration', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(true);
      const uxLoading = uxLoader(loading, { delay: 200, minDuration: 500 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(499);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(50);
      loading.set(false);
      await vi.advanceTimersToNextTimerAsync();
      expect(uxLoading()).toBe(false);
    });
  });

  it('shows spinner until loading finish after delay + minDuration, then repeat (the same loading)', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(true);
      const uxLoading = uxLoader(loading, { delay: 200, minDuration: 500 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(499);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(50);
      loading.set(false);
      await vi.advanceTimersToNextTimerAsync();
      expect(uxLoading()).toBe(false);

      loading.set(true);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(499);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(200);
      expect(uxLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(50);
      loading.set(false);
      await vi.advanceTimersToNextTimerAsync();
      expect(uxLoading()).toBe(false);
    });
  });

  it('show spinner after 10s, when the loding start for 500ms', async () => {
    await TestBed.runInInjectionContext(async () => {
      const loading = signal(false);
      const uxLoading = uxLoader(loading, { delay: 300, minDuration: 200 });
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(uxLoading()).toBe(false);
      loading.set(true);
      await vi.advanceTimersByTimeAsync(299);
      expect(uxLoading()).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(uxLoading()).toBe(true);
      loading.set(false);
      await vi.advanceTimersByTimeAsync(300);
      expect(uxLoading()).toBe(false);
    });
  });
});
