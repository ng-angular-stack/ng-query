import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { craft } from './craft';
import { craftQueryParams } from './craft-query-params';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { craftSources } from './craft-sources';
import { source } from './source';
import { afterRecomputation } from './after-recomputation';
@Component({
  template: '',
  standalone: true,
})
class TestComponent {
  route = inject(ActivatedRoute);
}

describe('craftQueryParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', component: TestComponent }])],
    });
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create query params configuration', () => {
    const { injectCraft } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftQueryParams('pagination', () => ({
        page: {
          defaultValue: 1,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
        pageSize: {
          defaultValue: 10,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
      }))
    );

    TestBed.runInInjectionContext(() => {
      const store = injectCraft();

      expect(store.page()).toBe(1);
      expect(store.pageSize()).toBe(10);
      expect(store.pagination()).toEqual({
        page: 1,
        pageSize: 10,
      });
      expectTypeOf(store.pagination()).toEqualTypeOf<{
        page: number;
        pageSize: number;
      }>();
      store.setPaginationQueryParams({ page: 2, pageSize: 20 });
      expect(store.pagination()).toEqual({
        page: 2,
        pageSize: 20,
      });
      store.resetPaginationQueryParams();
      expect(store.pagination()).toEqual({
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('should use default values when query params are missing', () => {
    const { injectCraft } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftQueryParams('pagination', () => ({
        page: {
          defaultValue: 1,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
        active: {
          defaultValue: false,
          parse: (value: string) => value === 'true',
          serialize: (value: unknown) => String(value),
        },
      }))
    );

    TestBed.runInInjectionContext(() => {
      const store = injectCraft();

      expect(store.page()).toBe(1);
      expect(store.active()).toBe(false);
    });
  });

  it('should accept custom methods configuration', () => {
    const { injectCraft } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftQueryParams(
        'pagination',
        () => ({
          page: {
            defaultValue: 1,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
        }),
        {
          methods: ({ queryParams }) => ({
            customMethod: (newPage: number) => {
              expectTypeOf(queryParams()).toEqualTypeOf<{ page: number }>();
              expect(queryParams().page).toBe(2);
              return {
                ...queryParams(),
                page: newPage,
              };
            },
          }),
        }
      )
    );

    TestBed.runInInjectionContext(() => {
      const store = injectCraft();

      expect(typeof store['customMethod']).toBe('function');
      expectTypeOf(store.pagination()).toEqualTypeOf<{ page: number }>();
      expect(store.pagination().page).toBe(1);
      expectTypeOf(store.page()).toEqualTypeOf<number>();
      expect(store.page()).toBe(1);
      store.setPaginationQueryParams({ page: 2 });
      expect(store.page()).toBe(2);
      expectTypeOf(store.customMethod).toEqualTypeOf<
        (newPage: number) => { page: number }
      >();
      store.customMethod(3);

      expect(store.page()).toBe(3);
    });
  });

  it('should accept custom methods that rely on source', async () => {
    const { injectCraft } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftSources({
        nextPage: source<{}>(),
      }),
      craftQueryParams(
        'pagination',
        () => ({
          page: {
            defaultValue: 1,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
        }),
        {
          methods: ({ context: { nextPage }, queryParams }) => ({
            nextPage: afterRecomputation(nextPage, (nextPage) => {
              console.log('afterRecomputation nextPage', nextPage);
              expectTypeOf(nextPage).toEqualTypeOf<{}>();
              expectTypeOf(queryParams()).toEqualTypeOf<{ page: number }>();
              expect(queryParams().page).toBe(2);
              return {
                ...queryParams(),
                page: queryParams().page + 1,
              };
            }),
          }),
        }
      )
    );
    await TestBed.runInInjectionContext(async () => {
      const store = injectCraft();

      expectTypeOf(store.pagination()).toEqualTypeOf<{ page: number }>();
      expect(store.pagination().page).toBe(1);
      expectTypeOf(store.page()).toEqualTypeOf<number>();
      expect(store.page()).toBe(1);
      store.setPaginationQueryParams({ page: 2 });
      expect(store.page()).toBe(2);
      //@ts-expect-error nextPage is not exposed
      expectTypeOf(store.nextPage).toEqualTypeOf<unknown>();
      store.setNextPage({});
      console.log('setNextPage');
      await vi.runAllTimersAsync();
      expect(store.page()).toBe(3);
    });
  });
});

const { injectCraft } = craft(
  {
    providedIn: 'root',
    name: '',
  },
  craftQueryParams('pagination', () => ({
    page: {
      defaultValue: 1,
      parse: (value: string) => parseInt(value, 10),
      serialize: (value: unknown) => String(value),
    },
    pageSize: {
      defaultValue: 10,
      parse: (value: string) => parseInt(value, 10),
      serialize: (value: unknown) => String(value),
    },
  }))
);

describe('craftQueryParams integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'test', component: TestComponent }])],
    });
  });
  it('should retrieve query params from the URL', async () => {
    const harness = await RouterTestingHarness.create();
    const instance = await harness.navigateByUrl(
      '/test?page=2&pageSize=5',
      TestComponent
    );

    TestBed.runInInjectionContext(() => {
      const store = injectCraft();

      expect(store.pagination()).toEqual({
        page: 2,
        pageSize: 5,
      });
      console.log('store.pagination()', store.pagination());
    });
  });

  it('should update query params in the URL after a manual change', async () => {
    // Création du harness et navigation initiale
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test', TestComponent);

    await TestBed.runInInjectionContext(async () => {
      const store = injectCraft();
      const location = inject(Location);

      expect(store.pagination()).toEqual({
        page: 1,
        pageSize: 10,
      });

      store.setPaginationQueryParams({ page: 3, pageSize: 15 });

      await harness.fixture.whenStable();

      // Assertions
      expect(location.path()).toContain('page=3');
      expect(location.path()).toContain('pageSize=15');
    });
  });
});

describe('craftQueryParams standalone methods', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'test', component: TestComponent }])],
    });
  });
  it('should navigate to the target URL with specified query params', async () => {
    const harness = await RouterTestingHarness.create('');
    const { injectCraft, setPaginationQueryParams } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftQueryParams('pagination', () => ({
        page: {
          defaultValue: 1,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
        pageSize: {
          defaultValue: 10,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
      }))
    );
    console.log('setPaginationQueryParams', setPaginationQueryParams);
    await TestBed.runInInjectionContext(async () => {
      const router = inject(Router);
      const location = inject(Location);

      await router.navigate(['test'], {
        queryParams: setPaginationQueryParams({ page: 4, pageSize: 20 }),
      });

      expect(location.path()).toEqual('/test?page=4&pageSize=20');
    });
    await TestBed.runInInjectionContext(() => {
      const loation = inject(Location);
      const store = injectCraft();

      expect(store.pagination()).toEqual({
        page: 4,
        pageSize: 20,
      });
    });
  });
  it('should navigateByUrl to the target URL with specified query params', async () => {
    const harness = await RouterTestingHarness.create();
    const { injectCraft, setPaginationQueryParams } = craft(
      {
        providedIn: 'root',
        name: '',
      },
      craftQueryParams('pagination', () => ({
        page: {
          defaultValue: 1,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
        pageSize: {
          defaultValue: 10,
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: unknown) => String(value),
        },
      }))
    );
    await TestBed.runInInjectionContext(async () => {
      const router = inject(Router);

      await router.navigateByUrl(
        `/test?${setPaginationQueryParams({
          page: 4,
          pageSize: 20,
        })}`
      );

      console.log(
        'navigated',
        `${setPaginationQueryParams({
          page: 4,
          pageSize: 20,
        })}`
      );
    });
    await TestBed.runInInjectionContext(() => {
      const store = injectCraft();

      expect(store.pagination()).toEqual({
        page: 4,
        pageSize: 20,
      });

      const location = inject(Location);
      expect(location.path()).toEqual('/test?page=4&pageSize=20');
    });
  });
});

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
