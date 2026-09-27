import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

export async function InstallBlock({ slugs }: { slugs: readonly string[] }) {
  const blocks = await Promise.all(slugs.map(loadDependencies));
  const packages = unique(
    blocks.flatMap(({ install }) =>
      install.map(({ name, range }) => `${name}@${range}`)
    )
  );
  const toCopy = unique(
    blocks.flatMap(({ copy, files }) => [...copy, ...files])
  );
  const styles = unique(blocks.flatMap((block) => block.styles));

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

function unique(items: string[]) {
  return [...new Set(items)];
}
