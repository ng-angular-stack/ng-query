import { TestBed } from '@angular/core/testing';
import { queryById } from '../../../src';
import { insertFactory } from './index';

describe('insertionFactory', () => {
  it('should create an insertion that will be plug in the query insertion pipeline', () => {
    const testInsertion = insertFactory(
      ({ hasNextPage }: { hasNextPage: boolean }) => ({
        hasNextPage,
      })
    );

    TestBed.runInInjectionContext(() => {
      const result = queryById(
        {
          params: () => ({
            id: '1',
          }),
          identifier: (params) => params.id,
          loader: async ({ params }) => {
            return {
              id: params.id,
              name: 'Test Name',
            };
          },
        },
        (data) => ({ nextPage: 2 }),
        testInsertion(({ insertions: { nextPage } }) => ({
          hasNextPage: nextPage !== undefined,
        }))
      );

      expect(
        result({} as any, {} as any).queryByIdRef.insertionsOutputs.hasNextPage
      ).toBe(true);
      expectTypeOf(
        result({} as any, {} as any).queryByIdRef.insertionsOutputs.hasNextPage
      ).toEqualTypeOf<boolean>();
    });
  });
});
