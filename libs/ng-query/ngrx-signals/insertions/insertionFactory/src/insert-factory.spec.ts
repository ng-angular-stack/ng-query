import { query } from '../../../src';
import { insertFactory } from './index';
describe('insertionFactory', () => {
  it('should create an insertion that will be plug in the query insertion pipeline', () => {
    const testInsertion = insertFactory(
      ({ hasNextPage }: { hasNextPage: boolean }) => ({
        hasNextPage,
      })
    );

    const result = query(
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
  });
});
