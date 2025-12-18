import { asyncMethod } from './async-method';
import { insertLocalStoragePersister } from './insert-local-storage-persister';
import { mutation } from './mutation';
import { query } from './query';
import { state } from './state';

describe('insertLocalStoragePersister', () => {
  it('can be used as an insertion in a query', async () => {
    const myQuery = query(
      {
        params: () => 'test',
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myTestQuery',
      })
    );

    const myQuery2 = query(
      {
        params: () => 'test',
        identifier: (params) => params,
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myTestQuery2',
      })
    );
  });

  it('can be used as an insertion in a mutation', async () => {
    const myMutation = mutation(
      {
        method: () => 'test',
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myMutation',
      })
    );
    const myMutation2 = mutation(
      {
        method: () => 'test',
        identifier: (params) => params,
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myMutation2',
      })
    );
  });

  it('can be used as an insertion in a async method', async () => {
    const myAsyncMethod = asyncMethod(
      {
        method: () => 'test',
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myAsyncMethod',
      })
    );
    const myAsyncMethod2 = asyncMethod(
      {
        method: () => 'test',
        identifier: (params) => params,
        loader: async () => {
          return { data: 'testData' };
        },
      },
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myAsyncMethod2',
      })
    );
  });

  it('can be used as an insertion in a state', async () => {
    const myState = state(
      0,
      insertLocalStoragePersister({
        storeName: 'myTestStore',
        key: 'myState',
      })
    );
  });

  it('can not be used as an insertion in a queryParams', async () => {
    // todo
    // const myQueryParams = queryParams(
    //   0,
    //   insertLocalStoragePersister({
    //     storeName: 'myTestStore',
    //     key: 'myState',
    //   })
    // );
  });
});
