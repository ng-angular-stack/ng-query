import { craft } from './craft';
import { queryParam } from './query-param';
import { TestBed } from '@angular/core/testing';
import { craftQueryParams } from './craft-query-params';

describe('craftQueryParams', () => {
  it('should create craft query params with correct types and methods', () => {
    const { injectMyStoreCraft } = craft(
      {
        name: 'MyStore',
        providedIn: 'root',
      },
      craftQueryParams(() => ({
        pagination: queryParam(
          {
            state: {
              page: {
                defaultValue: 1, // todo rename fallbackValue
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
          ({ set, reset }) => ({ set, reset })
        ),
      }))
    );
    TestBed.runInInjectionContext(() => {
      const store = injectMyStoreCraft();

      expectTypeOf(store.pagination()).toEqualTypeOf<{
        page: number;
        pageSize: number;
      }>();
    });
  });
});
