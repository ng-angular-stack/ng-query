import { TestBed } from '@angular/core/testing';
import { serverState } from './server-state';
import { usingQueryParams } from './using-query-params';
import { craftSetAllQueriesParamsStandalone } from './craft-set-all-queries-params-standalone';

describe('craftSetAllQueriesParamsStandalone', () => {
  it('should create query params configuration', () => {
    // todo testName not found du to HostStoreConfig
    const { injectTestServerState, setAllQueryParams, testName } = serverState(
      {
        providedIn: 'root',
        name: 'Test',
      },
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
      })),
      usingQueryParams('filter', () => ({
        active: {
          defaultValue: false,
          parse: (value: string) => value === 'true',
          serialize: (value: unknown) => String(value),
        },
      })),
      craftSetAllQueriesParamsStandalone()
    );
    setAllQueryParams.set;

    type t = Parameters<typeof setAllQueryParams>;

    TestBed.runInInjectionContext(() => {
      const store = injectTestServerState();

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
});
