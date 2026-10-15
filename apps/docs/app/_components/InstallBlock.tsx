import { loadInstallPlan } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import {
  ComponentLinks,
  PackagesSample,
  StylesSample,
} from './ComponentInstallation';

const BODY_CLASS = 'nx:typography-body-default nx:text-muted-foreground';

/** Everything installing `slug` takes: components to install first, then packages, files and styles. */
export async function InstallBlock({ slug }: { slug: string }) {
  const { components, packages, files, styles } = await loadInstallPlan(slug);

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
          <code>{files.join('\n')}</code>
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
