import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

/** Everything `slugs` needs, less what the blocks in `besides` already list. */
export async function InstallBlock({
  slugs,
  besides = [],
}: {
  slugs: readonly string[];
  besides?: readonly string[];
}) {
  const [needed, installed] = await Promise.all([
    Promise.all(slugs.map(loadDependencies)),
    Promise.all(besides.map(loadDependencies)),
  ]);
  const installedPackages = new Set(
    installed.flatMap(({ install }) => install.map(({ name }) => name))
  );
  const installedFiles = new Set(
    installed.flatMap(({ copy, files }) => [...copy, ...files])
  );
  const installedStyles = new Set(installed.flatMap(({ styles }) => styles));

  const ranges = new Map(
    needed
      .flatMap(({ install }) => install)
      .filter(({ name }) => !installedPackages.has(name))
      .map(({ name, range }) => [name, range])
  );
  const packages = [...ranges].map(([name, range]) => `${name}@${range}`);
  const toCopy = [
    ...new Set(needed.flatMap(({ copy, files }) => [...copy, ...files])),
  ].filter((file) => !installedFiles.has(file));
  const toImport = [...new Set(needed.flatMap(({ styles }) => styles))].filter(
    (file) => !installedStyles.has(file)
  );

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
      {toImport.length > 0 && (
        <CodeSample lang="css">
          {[
            '/* app/globals.css */',
            ...toImport.map((file) => `@import '../${file}';`),
          ].join('\n')}
        </CodeSample>
      )}
    </>
  );
}
