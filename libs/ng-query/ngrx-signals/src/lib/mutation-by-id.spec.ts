import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';
import { mutationById } from './mutation-by-id';
import { Equal, Expect } from 'test-type';

type User = {
  id: string;
  name: string;
  email: string;
};
// todo handle stream in resourceById

describe('mutationById', () => {
  it('Retrieve returned types of mutationByIdFn', () => {
    TestBed.configureTestingModule({
      providers: [Injector],
    });
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const mutationByIdFn = mutationById({
        params: () => '5',
        loader: ({ params }) => {
          return lastValueFrom(
            of({
              id: params,
              name: 'John Doe',
              email: 'test@a.com',
            })
          );
        },
        identifier: (params) => params,
      });
      type mutationByIdFn__types = ReturnType<typeof mutationByIdFn>['__types'];

      type ExpectMutationByFnTypesToBeRetrieved = Expect<
        Equal<
          mutationByIdFn__types,
          {
            state: NoInfer<{
              id: string;
              name: string;
              email: string;
            }>;
            params: string;
            args: unknown;
            isGroupedResource: false;
            groupIdentifier: string;
          }
        >
      >;
    });
  });
});
