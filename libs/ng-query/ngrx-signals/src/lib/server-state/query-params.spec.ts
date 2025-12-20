import { TestBed } from '@angular/core/testing';
import { queryParams } from './query-params';
import { provideRouter } from '@angular/router';
import { source } from './source';
import { afterRecomputation } from './after-recomputation';

describe('queryParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create a query params', () => {
    TestBed.runInInjectionContext(() => {
      const myQueryParams = queryParams({
        state: {
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
        },
      });

      expect(myQueryParams).toBeDefined();
    });
  });

  it('should create a query params and expose state and basic methods (set, update, patch)', () => {
    TestBed.runInInjectionContext(() => {
      const myQueryParams = queryParams({
        state: {
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
        },
      });
      expectTypeOf(myQueryParams()).toEqualTypeOf<{
        page: number;
        pageSize: number;
      }>();

      expect(myQueryParams()).toEqual({
        page: 1,
        pageSize: 10,
      });

      expect(myQueryParams.page()).toBe(1);
      expect(myQueryParams.pageSize()).toBe(10);

      myQueryParams.set({
        page: 2,
        pageSize: 20,
      });
      expect(myQueryParams.page()).toBe(2);
      expect(myQueryParams.pageSize()).toBe(20);

      myQueryParams.update((current) => ({
        ...current,
        page: current.page + 1,
      }));
      expect(myQueryParams.page()).toBe(3);

      myQueryParams.patch({
        pageSize: 50,
      });
      expect(myQueryParams.pageSize()).toBe(50);
    });
  });

  it('should create a query params and methods', () => {
    TestBed.runInInjectionContext(() => {
      const myQueryParams = queryParams(
        {
          state: {
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
          },
        },
        ({ state, set }) => ({
          goTo: (newPage: number) => {
            expectTypeOf(state()).toEqualTypeOf<{
              page: number;
              pageSize: number;
            }>();
            set({
              ...state(),
              page: newPage,
            });
          },
        })
      );
    });
  });

  it('should expose basic methods in insertions', () => {
    TestBed.runInInjectionContext(() => {
      const myQueryParams = queryParams(
        {
          state: {
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
          },
        },
        ({ state, set, update, patch, reset, config }) => {
          expect(update).toBeDefined();
          expect(patch).toBeDefined();
          expect(reset).toBeDefined();
          expect(config).toBeDefined();
          return {
            _setPage: (newPage: number) => {
              expectTypeOf(state()).toEqualTypeOf<{
                page: number;
                pageSize: number;
              }>();
              set({
                ...state(),
                page: newPage,
              });
            },
            _updatePage: (inc: number) => {
              update((current) => ({
                ...current,
                page: current.page + inc,
              }));
            },
            _patchPageSize: (newPageSize: number) => {
              patch({
                pageSize: newPageSize,
              });
            },
            _reset: () => {
              reset();
            },
          };
        }
      );
      myQueryParams._setPage(2);
      expect(myQueryParams.page()).toBe(2);
      myQueryParams._updatePage(3);
      expect(myQueryParams.page()).toBe(5);
      myQueryParams._patchPageSize(100);
      expect(myQueryParams.pageSize()).toBe(100);
      myQueryParams._reset();
      expect(myQueryParams()).toEqual({
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('should accept options and not loosing insertions inference', () => {
    TestBed.runInInjectionContext(() => {
      const myQueryParams = queryParams(
        {
          state: {
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
          },
          queryParamsHandling: 'merge',
          onSameUrlNavigation: 'reload',
          replaceUrl: true,
          skipLocationChange: false,
        },
        ({ state, set, update, patch, reset, config }) => {
          expect(update).toBeDefined();
          expect(patch).toBeDefined();
          expect(reset).toBeDefined();
          expect(config).toBeDefined();
          return {
            _set: (newPage: number) => {
              expectTypeOf(state()).toEqualTypeOf<{
                page: number;
                pageSize: number;
              }>();
              set({
                ...state(),
                page: newPage,
              });
            },
            _update: (inc: number) => {
              update((current) => ({
                ...current,
                page: current.page + inc,
              }));
            },
            _patch: (newPageSize: number) => {
              patch({
                pageSize: newPageSize,
              });
            },
            _reset: () => {
              reset();
            },
          };
        }
      );
    });
  });

  it('should not expose methods bind to a source', () => {
    TestBed.runInInjectionContext(() => {
      const mySource = source<number>();
      const myQueryParams = queryParams(
        {
          state: {
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
          },
        },
        ({ state, set, update, patch, reset, config }) => {
          return {
            _setPage: afterRecomputation(mySource, (newPage: number) => {
              expectTypeOf(state()).toEqualTypeOf<{
                page: number;
                pageSize: number;
              }>();
              set({
                ...state(),
                page: newPage,
              });
            }),
          };
        }
      );
      //@ts-expect-error _setPage is bind to a source, so it should not be exposed
      myQueryParams._setPage(2);

    });
  });
});
