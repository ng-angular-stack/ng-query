import { TestBed } from '@angular/core/testing';
import { craft } from './craft';
import { craftQueryParams } from './craft-query-params';
import { craftSetAllQueriesParamsStandalone } from './craft-set-all-queries-params-standalone';

describe('craftSetAllQueriesParamsStandalone', () => {
  it('should create query params configuration', () => {
    const { injectTestStoreCraft, setAllTestStoreQueryParams } = craft(
      {
        providedIn: 'root',
        name: 'TestStore',
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
      })),
      craftQueryParams('filter', () => ({
        active: {
          defaultValue: false,
          parse: (value: string) => value === 'true',
          serialize: (value: unknown) => String(value),
        },
      })),
      craftSetAllQueriesParamsStandalone()
    );

    TestBed.runInInjectionContext(() => {
      const store = injectTestStoreCraft();

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
      setAllTestStoreQueryParams({
        pagination: {
          page: 3,
          pageSize: 30,
        },
        filter: {
          active: true,
        },
      });
      expect(store.pagination()).toEqual({
        page: 3,
        pageSize: 30,
      });
      expect(store.filter()).toEqual({
        active: true,
      });
    });
  });
});
