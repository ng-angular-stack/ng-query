import { Signal } from '@angular/core';
import { queryById } from '../query-by-id';
import { pagination } from './pagination';
import { QueryByIdRef } from '../with-query-by-id';

describe('extension pagination', () => {
  it('should return the data of the currentPage', () => {
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
      pagination
    );
    const finalResult = result({}, {} as any);
    expectTypeOf(finalResult.queryByIdRef).toEqualTypeOf<
      QueryByIdRef<
        string,
        NoInfer<{
          id: string;
          name: string;
        }>,
        NoInfer<{
          id: string;
        }>,
        {
          pagination: {
            currentPage: Signal<
              | NoInfer<{
                  id: string;
                  name: string;
                }>
              | undefined
            >;
            isPlaceHolderData: Signal<boolean>;
          };
        }
      >
    >();
    expect(
      finalResult.queryByIdRef.extensionsOutputs.pagination.currentPage
    ).toBeDefined();
  });
});
