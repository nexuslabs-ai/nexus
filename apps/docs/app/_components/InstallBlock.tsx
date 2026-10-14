import { loadInstallPlan } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';
import { ComponentLinks } from './ComponentInstallation';

const BODY_CLASS = 'nx:typography-body-default nx:text-muted-foreground';

/** Everything installing `slugs` takes: components to install first, then packages, files and styles. */
export async function InstallBlock({ slugs }: { slugs: readonly string[] }) {
  const { components, packages, files, styles } = await loadInstallPlan(slugs);

  return (
    <>
      {components.length > 0 && (
        <p className={BODY_CLASS}>
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
        This example also needs
        {slugs.length > 0 ? (
          <>
            : <ComponentLinks slugs={slugs} />.
          </>
        ) : (
          ':'
        )}
      </p>
      {packages.length > 0 && (
        <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
      )}
    </>
  );
}
