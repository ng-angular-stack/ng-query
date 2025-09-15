import { signal } from '@angular/core';
import { rxResourceById } from './rx-resource-by-id';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('rxResourceById', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should create a resource by id', async () => {
    await TestBed.runInInjectionContext(async () => {
      const sourceParams = signal<{ id: string } | undefined>(undefined);
      const rxResourceByIdRef = rxResourceById({
        identifier: (request) => request.id,
        params: sourceParams,
        stream: ({ params }) => {
          // Simulate a stream
          return of(params);
        },
      });
      expect(rxResourceByIdRef).toBeDefined();
      expect(rxResourceByIdRef()).toEqual({});

      sourceParams.set({ id: '123' });
      await vi.runAllTimersAsync();
      const resourceRef123 = rxResourceByIdRef()['123'];
      expect(resourceRef123).toBeDefined();
      expect(resourceRef123?.value()).toEqual({ id: '123' });

      sourceParams.set({ id: '123Bis' });
      await vi.runAllTimersAsync();

      const resourceRef123Bis = rxResourceByIdRef()['123Bis'];
      expect(resourceRef123Bis).toBeDefined();
      expect(resourceRef123Bis?.value()).toEqual({ id: '123Bis' });
    });
  });

  it('should expose add/reset/restResource function', async () => {
    await TestBed.runInInjectionContext(async () => {
      const sourceParams = signal<{ id: string } | undefined>(undefined);
      const rxResourceByIdRef = rxResourceById({
        identifier: (request) => request.id,
        params: sourceParams,
        stream: ({ params }) => {
          // Simulate a stream
          return of(params);
        },
      });
      expect(rxResourceByIdRef).toBeDefined();
      expect(rxResourceByIdRef()).toEqual({});

      rxResourceByIdRef.add(
        { id: '123' },
        {
          defaultValue: { id: '123' },
        }
      );
      const resourceRef123 = rxResourceByIdRef()['123'];

      await vi.runAllTimersAsync();
      expect(resourceRef123).toBeDefined();
      expect(resourceRef123?.value()).toEqual({ id: '123' });

      rxResourceByIdRef.add(
        { id: '1234' },
        {
          defaultValue: { id: '1234' },
        }
      );
      rxResourceByIdRef.add(
        { id: '12345' },
        {
          defaultValue: { id: '12345' },
        }
      );
      await vi.runAllTimersAsync();

      const resourceRef1234 = rxResourceByIdRef()['1234'];
      expect(resourceRef1234).toBeDefined();
      expect(resourceRef1234?.value()).toEqual({ id: '1234' });

      const resourceRef12345 = rxResourceByIdRef()['12345'];
      expect(resourceRef12345).toBeDefined();
      expect(resourceRef12345?.value()).toEqual({ id: '12345' });

      rxResourceByIdRef.resetResource('123');
      expect(rxResourceByIdRef()['123']).toBeUndefined();
      expect(rxResourceByIdRef()['1234']).toBeDefined();
      expect(rxResourceByIdRef()['12345']).toBeDefined();

      rxResourceByIdRef.reset();
      expect(rxResourceByIdRef()['1234']).toBeUndefined();
      expect(rxResourceByIdRef()['12345']).toBeUndefined();
    });
  });
});
