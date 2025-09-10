import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addRootImport } from '@schematics/angular/utility';

export interface Schema {
  useRxjs?: boolean;
}

export function ngAdd(options: Schema): Rule {
  // Add an import `MyLibModule` from `my-lib` to the root of the user's project.
  return addRootImport(
    'test',
    ({ code, external }) => code`${external('MyLibModule', 'my-lib')}`
  );
}

// export default function ngAdd(options: Schema): Rule {
//   return (tree: Tree, context: SchematicContext) => {
//     context.addTask(
//       new NodePackageInstallTask({
//         packageName: '@ng-query/ngrx-signals',
//       })
//     );
//     context.addTask(
//       new NodePackageInstallTask({
//         packageName: '@ng-query/insertions',
//       })
//     );
//     if (options.useRxjs) {
//       context.addTask(
//         new NodePackageInstallTask({
//           packageName: '@ng-query/ngrx-signals-rxjs',
//         })
//       );
//       context.addTask(
//         new NodePackageInstallTask({
//           packageName: '@ng-query/rx-insertions',
//         })
//       );
//     }
//     return tree;
//   };
// }
