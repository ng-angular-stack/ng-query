import {
  signal,
  Injector,
  runInInjectionContext,
  ApplicationRef,
} from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { rxMutationById } from './rx-mutation-by-id';
import { InternalType } from '../../../ngrx-signals/src/lib/types/util.type';
import { Equal, Expect } from '../../../../../test-type';

describe('rxResourceById', () => {
  it('should create a rxResource by id', async () => {
    TestBed.configureTestingModule({
      providers: [Injector, ApplicationRef],
    });
    const injector = TestBed.inject(Injector);

    await runInInjectionContext(injector, async () => {
      const sourceParams = signal<{ id: string } | undefined>(undefined);
      const mutationConfig = rxMutationById({
        identifier: (request) => request.id,
        params: sourceParams,
        stream: ({ params }) => {
          // Simulate a stream
          return of(params);
        },
      })({} as any, {} as any);
      expect(mutationConfig).toBeDefined();
      expect(mutationConfig.mutationByIdRef.resourceById()).toEqual({});
      expect(mutationConfig.mutationByIdRef.resourceParamsSrc).toBeDefined();

      type ExpectTypeTObeGroupedMutation = Expect<
        Equal<
          typeof mutationConfig.__types,
          InternalType<
            | {
                id: string;
              }
            | undefined,
            | {
                id: string;
              }
            | undefined,
            unknown,
            false,
            string
          >
        >
      >;
    });
  });

  it('should create a rxResource by id that accept params$ that is an observable', async () => {
    await TestBed.runInInjectionContext(async () => {
      const sourceParams = new BehaviorSubject<{ id: string }>({ id: '1' });
      const mutationConfig = rxMutationById({
        identifier: (request) => request.id,
        params$: sourceParams,
        stream: ({ params }) => {
          // Simulate a stream
          return of(params);
        },
      })({} as any, {} as any);
      expect(mutationConfig).toBeDefined();
      expect(mutationConfig.mutationByIdRef.resourceById()).toEqual({});
      expect(mutationConfig.mutationByIdRef.resourceParamsSrc).toBeDefined();
      expect(mutationConfig.mutationByIdRef.resourceParamsSrc()).toEqual({
        id: '1',
      });

      type ExpectTypeTObeGroupedMutation = Expect<
        Equal<
          typeof mutationConfig.__types,
          InternalType<
            NoInfer<{
              id: string;
            }>,
            NoInfer<{
              id: string;
            }>,
            unknown,
            false,
            string
          >
        >
      >;
    });
  });
});
