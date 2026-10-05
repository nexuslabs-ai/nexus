import { type Dependencies, loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

type ListOf = (dependencies: Dependencies) => string[];

const packagesOf: ListOf = ({ install }) =>
  install.map(({ name, range }) => `${name}@${range}`);
const filesOf: ListOf = ({ copy, files }) => [...copy, ...files];
const stylesOf: ListOf = ({ styles }) => styles;

function missing(
  pick: ListOf,
  needed: Dependencies[],
  installed: Dependencies[]
) {
  const have = new Set(installed.flatMap(pick));
  return [...new Set(needed.flatMap(pick))].filter((item) => !have.has(item));
}

export async function InstallBlock({
  slugs,
  besides = [],
  caption,
}: {
  slugs: readonly string[];
  besides?: readonly string[];
  caption?: string;
}) {
  const [needed, installed] = await Promise.all([
    Promise.all(slugs.map((slug) => loadDependencies(slug))),
    Promise.all(besides.map((slug) => loadDependencies(slug))),
  ]);
  const packages = missing(packagesOf, needed, installed);
  const toCopy = missing(filesOf, needed, installed);
  const styles = missing(stylesOf, needed, installed);
  if (packages.length + toCopy.length + styles.length === 0) {
    return null;
  }

  return (
    <>
      {caption && (
        <p className="nx:typography-body-default nx:text-muted-foreground">
          {caption}
        </p>
      )}
      {packages.length > 0 && (
        <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
      )}
      {toCopy.length > 0 && (
        <CodeBlock>
          <code>{toCopy.join('\n')}</code>
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
