import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

type Package = { name: string; range: string };

type Block = {
  packages: string[];
  toCopy: string[];
  styles: string[];
};

function packageSpecs(packages: Package[]) {
  return packages.map(({ name, range }) => `${name}@${range}`);
}

function unique(items: string[], exclude: string[]) {
  return [...new Set(items)].filter((item) => !exclude.includes(item)).sort();
}

function BlockSamples({ packages, toCopy, styles }: Block) {
  return (
    <>
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

/**
 * The component's own block, then what its examples add on top: packages they
 * import directly and the blocks of other components they import.
 */
export async function InstallBlock({ slug }: { slug: string }) {
  const { install, examples, exampleComponents, copy, files, styles } =
    await loadDependencies(slug);
  const own: Block = {
    packages: packageSpecs(install),
    toCopy: [...copy, ...files],
    styles,
  };

  const others = await Promise.all(exampleComponents.map(loadDependencies));
  const ownPackageNames = install.map(({ name }) => name);
  const byName = new Map(
    [...others.flatMap((other) => other.install), ...examples].map((pkg) => [
      pkg.name,
      pkg,
    ])
  );
  const examplePackages = [...byName.values()]
    .filter(({ name }) => !ownPackageNames.includes(name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const forExamples: Block = {
    packages: packageSpecs(examplePackages),
    toCopy: unique(
      others.flatMap((other) => [...other.copy, ...other.files]),
      own.toCopy
    ),
    styles: unique(
      others.flatMap((other) => other.styles),
      own.styles
    ),
  };
  const hasExampleExtras =
    forExamples.packages.length > 0 ||
    forExamples.toCopy.length > 0 ||
    forExamples.styles.length > 0;

  return (
    <>
      <BlockSamples {...own} />
      {hasExampleExtras && (
        <>
          <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-6 nx:mb-2">
            Only for the examples below:
          </p>
          <BlockSamples {...forExamples} />
        </>
      )}
    </>
  );
}
