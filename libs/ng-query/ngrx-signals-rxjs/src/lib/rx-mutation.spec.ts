import { of } from 'rxjs';
import { signalStore, SignalStoreFeature } from '@ngrx/signals';
import { TestBed } from '@angular/core/testing';
import { withMutation } from '../../../ngrx-signals/src/lib/with-mutation';
import { rxMutation } from './rx-mutation';
import { ApplicationRef } from '@angular/core';

type User = {
  id: string;
  name: string;
  email: string;
};

describe('rxMutation', () => {
  it('1- should accept signal param as source', () => {
    TestBed.runInInjectionContext(() => {
      const mutationRef = rxMutation({
        params: () => '5',
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual('5');
      expect(mutationResult.__types).toBeDefined();
    });
  });
  it('2- should accept observable param$ as source', () => {
    TestBed.runInInjectionContext(() => {
      const mutationRef = rxMutation({
        params$: of('5'),
        stream: ({ params }) => {
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual('5');
      expect(mutationResult.__types).toBeDefined();
    });
  });
  it('3- should accept a method as source (when calling method, the withMutation will update the resourceParamsSrc) ', async () => {
    await TestBed.runInInjectionContext(async () => {
      let calledTime = 0;
      const mutationRef = rxMutation({
        method: (data: string) => data,
        stream: ({ params }) => {
          calledTime++;
          return of({
            id: params,
            name: 'John Doe',
            email: 'test@a.com',
          });
        },
      });
      expect(mutationRef).toBeDefined();
      const mutationResult = mutationRef({} as any, {} as any);
      expect(mutationResult.mutationRef).toBeDefined();
      expect(mutationResult.mutationRef.resource).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc).toBeDefined();
      expect(mutationResult.mutationRef.method).toBeInstanceOf(Function);
      expect(mutationResult.__types).toBeDefined();
      expect(mutationResult.mutationRef.resourceParamsSrc()).toEqual(undefined);
    });
  });
});

describe('withMutation using rxMutation', () => {
  it('1- Should expose a mutation resource', () => {
    const Store = signalStore(
      withMutation('user', () =>
        rxMutation({
          params: () => '5',
          stream: ({ params }) => {
            return of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            });
          },
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store],
    });
    const store = TestBed.inject(Store);

    expect(store.userMutation).toBeDefined();
  });
});
