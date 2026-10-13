import { loadInstallPlan } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';
import { ComponentLinks } from './ComponentInstallation';

export async function InstallBlock({
  slugs,
  besides = [],
  alsoPackages = [],
  caption,
}: {
  slugs: readonly string[];
  besides?: readonly string[];
  /** `name@range` packages to install beyond what `slugs` install. */
  alsoPackages?: readonly string[];
  caption?: string;
}) {
  const { components, packages, files, styles } = await loadInstallPlan(
    slugs,
    besides,
    alsoPackages
  );
  if (
    components.length + packages.length + files.length + styles.length ===
    0
  ) {
    return null;
  }

  return (
    <>
      {caption && (
        <p className="nx:typography-body-default nx:text-muted-foreground">
          {caption}
        </p>
      )}
      {components.length > 0 && (
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Install these components first: <ComponentLinks slugs={components} />.
        </p>
      )}
      {packages.length > 0 && (
        <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
      )}
      {files.length > 0 && (
        <CodeBlock>
          <code>{files.join('\n')}</code>
        </CodeBlock>
      )}
      {styles.length > 0 && (
        <CodeSample lang="css">
          {[
            '/* app/globals.css */',
            ...styles.map((file) => `@import '../${file}';`),
          ].join('\n')}
        </CodeSample>
      )}
    </>
  );
}
