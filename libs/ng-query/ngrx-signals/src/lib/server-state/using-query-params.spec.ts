import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { serverState } from './server-state';
import { usingQueryParams } from './using-query-params';

@Component({
  template: '<router-outlet></router-outlet>',
})
class TestComponent {}

describe('usingQueryParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: TestComponent },
        ]),
      ],
      declarations: [TestComponent],
    });
  });

  it('should create query params configuration', () => {
    const { injectServerState } = serverState(
      usingQueryParams('pagination', () => ({
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
      const store = injectServerState();

      expect(store['page']()).toBe(1);
      expect(store['pageSize']()).toBe(10);
      expect(typeof store['setPage']).toBe('function');
      expect(typeof store['setPageSize']).toBe('function');
      expect(typeof store['setQueryParams']).toBe('function');
      expect(typeof store['resetQueryParams']).toBe('function');
    });
  });

  it('should use default values when query params are missing', () => {
    const { injectServerState } = serverState(
      usingQueryParams('pagination', () => ({
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
      const store = injectServerState();

      expect(store['page']()).toBe(1);
      expect(store['active']()).toBe(false);
    });
  });

  it('should accept custom methods configuration', () => {
    const { injectServerState } = serverState(
      usingQueryParams(
        'pagination',
        () => ({
          page: {
            defaultValue: 1,
            parse: (value: string) => parseInt(value, 10),
            serialize: (value: unknown) => String(value),
          },
        }),
        {
          methods: {
            customMethod: (queryParams, newPage: number) => {
              expectTypeOf(queryParams).toEqualTypeOf<{ page: number }>();
              expect(queryParams.page).toBe(1);
              return {
                ...queryParams,
                page: newPage,
              };
            },
          },
        }
      )
    );

    TestBed.runInInjectionContext(() => {
      const store = injectServerState();

      expect(typeof store['customMethod']).toBe('function');
      expectTypeOf(store.pagination()).toEqualTypeOf<{ page: number }>();
      expect(store.pagination().page).toBe(1);
      expectTypeOf(store.page()).toEqualTypeOf<number>();
      expect(store.page()).toBe(1);
      store.setPaginationQueryParams({ page: 2 });
      expect(store.page()).toBe(2);
      store.customMethod(3);
    });
  });
});
