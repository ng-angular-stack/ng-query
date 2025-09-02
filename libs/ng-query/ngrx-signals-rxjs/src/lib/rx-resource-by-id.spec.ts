import {
  signal,
  Injector,
  runInInjectionContext,
  ApplicationRef,
} from '@angular/core';
import { rxResourceById } from './rx-resource-by-id';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('rxResourceById', () => {
  it('should create a rxResource by id', async (done) => {
    TestBed.configureTestingModule({
      providers: [Injector, ApplicationRef],
    });
    const injector = TestBed.inject(Injector);

    await runInInjectionContext(injector, async () => {
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
      await TestBed.inject(ApplicationRef).whenStable();
      const resourceRef123 = rxResourceByIdRef()['123'];
      expect(resourceRef123).toBeDefined();
      expect(resourceRef123?.value()).toEqual({ id: '123' });

      sourceParams.set({ id: '123Bis' });
      await TestBed.inject(ApplicationRef).whenStable();
      const resourceRef123Bis = rxResourceByIdRef()['123Bis'];
      expect(resourceRef123Bis).toBeDefined();
      expect(resourceRef123Bis?.value()).toEqual({ id: '123Bis' });
    });
  });
});
