import {
  signal,
  Injector,
  runInInjectionContext,
  ApplicationRef,
} from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { rxMutationById } from './rx-mutation-by-id';
import { Expect, Equal } from 'test-type';
import { signalStore } from '@ngrx/signals';
import { ResourceByIdRef, withMutationById } from '@ng-query/ngrx-signals';

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
          {
            state: NoInfer<
              | {
                  id: string;
                }
              | undefined
            >;
            params: NoInfer<
              | {
                  id: string;
                }
              | undefined
            >;
            args: unknown;
            isGroupedResource: true;
            groupIdentifier: string;
          }
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
          {
            state: NoInfer<{
              id: string;
            }>;
            params: NoInfer<{
              id: string;
            }>;
            args: unknown;
            isGroupedResource: true;
            groupIdentifier: string;
          }
        >
      >;
    });
  });

  it('1- Should expose a mutation resource that accepts a param$ with a record of resource by id', async () => {
    const returnedUser = {
      id: '5',
      name: 'John Doe',
      email: 'test@a.com',
    };
    const Store = signalStore(
      withMutationById('user', () =>
        rxMutationById({
          params$: of('5'),
          stream: ({ params }) => {
            return of(returnedUser);
          },
          identifier: (params) => params,
        })
      )
    );

    TestBed.configureTestingModule({
      providers: [Store, ApplicationRef],
    });
    const store = TestBed.inject(Store);

    expect(store.userMutationById).toBeDefined();

    await TestBed.inject(ApplicationRef).whenStable();
    expect(store.userMutationById()['5']?.value()).toBe(returnedUser);

    type ExpectUserQueryToBeAnObjectWithResourceByIdentifier = Expect<
      Equal<
        typeof store.userMutationById,
        ResourceByIdRef<
          string,
          NoInfer<{
            id: string;
            name: string;
            email: string;
          }>
        >
      >
    >;
  });
});
