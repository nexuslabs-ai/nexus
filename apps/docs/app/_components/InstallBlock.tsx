import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

export async function InstallBlock({ slug }: { slug: string }) {
  const { install, examples, copy, files, styles } =
    await loadDependencies(slug);
  const packages = install.map(({ name, range }) => `${name}@${range}`);
  const examplePackages = examples.map(({ name, range }) => `${name}@${range}`);
  const toCopy = [...copy, ...files];

  return (
    <>
      {packages.length > 0 && (
        <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
      )}
      {examplePackages.length > 0 && (
        <CodeSample lang="bash">
          {[
            '# Only for the examples below',
            `npm install ${examplePackages.join(' ')}`,
          ].join('\n')}
        </CodeSample>
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
