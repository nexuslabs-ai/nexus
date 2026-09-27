import { type Block, loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

function BlockSamples({ packages, copy, styles, assets }: Block) {
  return (
    <>
      {packages.length > 0 && (
        <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
      )}
      {copy.length > 0 && (
        <CodeBlock>
          <code>{copy.join('\n')}</code>
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
      {assets.length > 0 && (
        <CodeBlock>
          <code>{assets.join('\n')}</code>
        </CodeBlock>
      )}
    </>
  );
}

export async function InstallBlock({ slug }: { slug: string }) {
  const { installBlock, examplesBlock } = await loadDependencies(slug);
  const hasExampleExtras =
    examplesBlock.packages.length > 0 ||
    examplesBlock.copy.length > 0 ||
    examplesBlock.assets.length > 0;

  return (
    <>
      <BlockSamples {...installBlock} />
      {hasExampleExtras && (
        <>
          <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-6 nx:mb-2">
            Only for the examples below:
          </p>
          <BlockSamples {...examplesBlock} />
        </>
      )}
    </>
  );
}
