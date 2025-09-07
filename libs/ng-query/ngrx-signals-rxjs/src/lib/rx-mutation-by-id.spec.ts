import {
  signal,
  Injector,
  runInInjectionContext,
  ApplicationRef,
  inject,
} from '@angular/core';
import { BehaviorSubject, delay, of } from 'rxjs';
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

  it('should accept seven inserts, all outputs appear in the store', () => {
    const Store = signalStore(
      {
        providedIn: 'root',
      },
      withMutationById('user', () =>
        rxMutationById(
          {
            params: () => '5',
            stream: ({ params }) => {
              return of({
                id: params,
                name: 'John Doe',
                email: 'test@a.com',
              });
            },
            identifier: (params) => params,
          },
          // insert 1
          () => ({ ext1: 1 }),
          // insert 2
          ({ insertions: inserts }) => ({ ext2: inserts.ext1 + 1 }),
          // insert 3
          ({ insertions: inserts }) => ({ ext3: inserts.ext2 + 1 }),
          // insert 4
          ({ insertions: inserts }) => ({ ext4: inserts.ext3 + 1 }),
          // insert 5
          ({ insertions: inserts }) => ({ ext5: inserts.ext4 + 1 }),
          // insert 6
          ({ insertions: inserts }) => ({ ext6: inserts.ext5 + 1 }),
          // insert 7
          ({ insertions: inserts }) => ({ ext7: inserts.ext6 + 1 })
        )
      )
    );
    TestBed.runInInjectionContext(() => {
      const store = inject(Store);
      expectTypeOf(store.userMutationById.ext1).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext2).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext3).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext4).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext5).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext6).toEqualTypeOf<number>();
      expectTypeOf(store.userMutationById.ext7).toEqualTypeOf<number>();
      expect(store.userMutationById.ext1).toBeDefined();
      expect(store.userMutationById.ext2).toBeDefined();
      expect(store.userMutationById.ext3).toBeDefined();
      expect(store.userMutationById.ext4).toBeDefined();
      expect(store.userMutationById.ext5).toBeDefined();
      expect(store.userMutationById.ext6).toBeDefined();
      expect(store.userMutationById.ext7).toBeDefined();
    });
  });

  it('it should trigger again the stream of an existing resource, when the params are coming back to an existing resource (the source can change and it should trigger the stream).', async () => {
    vi.useFakeTimers();

    await TestBed.runInInjectionContext(async () => {
      const source = signal({ page: 1, pageSize: 10 });
      const result = rxMutationById({
        params: source,
        identifier: (params) => params.page,
        stream: ({ params }) => {
          return of({
            id: '' + params.page,
            name: 'John Doe',
            email: 'test@a.com',
          }).pipe(delay(2000));
        },
      })({} as any, {} as any);
      expect(result.mutationByIdRef).toBeDefined();

      await vi.runAllTimersAsync();
      source.set({ page: 2, pageSize: 10 });
      await vi.runAllTimersAsync();

      const resource1 = result.mutationByIdRef.resourceById()[1];
      const resource2 = result.mutationByIdRef.resourceById()[2];

      expect(resource1?.status()).toEqual('resolved');
      expect(resource2?.status()).toEqual('resolved');

      source.set({ page: 1, pageSize: 10 });
      await vi.advanceTimersByTimeAsync(500);

      expect(resource1?.status()).toEqual('loading');

      vi.resetAllMocks();
    });
  });
});
