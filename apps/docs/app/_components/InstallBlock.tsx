import { loadInstallPlan } from '../_lib/catalog';
import type { Framework } from '../_lib/frameworks';

import { CodeBlock } from './CodeBlock';
import {
  ComponentLinks,
  PackagesSample,
  StylesSample,
} from './ComponentInstallation';

const BODY_CLASS = 'nx:typography-body-default nx:text-muted-foreground';

/** Everything installing `slug` takes: components to install first, then packages, files and styles. */
export function InstallBlock({
  slug,
  framework = 'react',
}: {
  slug: string;
  framework?: Framework;
}) {
  const { components, packages, files, styles } = loadInstallPlan(
    slug,
    framework
  );

  return (
    <>
      {components.length > 0 && (
        <p className={BODY_CLASS}>
          Install these components first: <ComponentLinks slugs={components} />.
        </p>
      )}
      {packages.length > 0 && <PackagesSample packages={packages} />}
      {files.length > 0 && (
        <CodeBlock>
          <code>{files.map((file) => file.path).join('\n')}</code>
        </CodeBlock>
      )}
      {styles.length > 0 && <StylesSample styles={styles} />}
    </>
  );
}

/** The components and packages an example needs beyond its page's component. */
export function ExampleInstall({
  slugs,
  packages,
}: {
  slugs: readonly string[];
  /** `name@range` packages the example imports that `slugs` don't install. */
  packages: readonly string[];
}) {
  if (slugs.length + packages.length === 0) return null;

  return (
    <>
      <p className={BODY_CLASS}>
        This example also needs:
        {slugs.length > 0 && (
          <>
            {' '}
            <ComponentLinks slugs={slugs} />.
          </>
        )}
      </p>
      {packages.length > 0 && <PackagesSample packages={packages} />}
    </>
  );
}
