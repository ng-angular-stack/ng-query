import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export interface Schema {
  useRxjs?: boolean;
}

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(
      new NodePackageInstallTask({
        packageName: '@ng-query/ngrx-signals',
      })
    );

    if (options.useRxjs) {
      context.addTask(
        new NodePackageInstallTask({
          packageName: '@ng-query/ngrx-signals-rxjs',
        })
      );
    }
    return tree;
  };
}
