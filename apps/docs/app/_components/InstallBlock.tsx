import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

const NOTHING_INSTALLED = { install: [], copy: [], files: [], styles: [] };

/** `besides` names a block the reader already has; its entries are left out. */
export async function InstallBlock({
  slug,
  besides,
}: {
  slug: string;
  besides?: string;
}) {
  const [{ install, copy, files, styles }, installed] = await Promise.all([
    loadDependencies(slug),
    besides ? loadDependencies(besides) : NOTHING_INSTALLED,
  ]);
  const installedPackages = new Set(installed.install.map(({ name }) => name));
  const installedFiles = new Set([...installed.copy, ...installed.files]);
  const installedStyles = new Set(installed.styles);

  const packages = install
    .filter(({ name }) => !installedPackages.has(name))
    .map(({ name, range }) => `${name}@${range}`);
  const toCopy = [...copy, ...files].filter(
    (file) => !installedFiles.has(file)
  );
  const toImport = styles.filter((file) => !installedStyles.has(file));

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
