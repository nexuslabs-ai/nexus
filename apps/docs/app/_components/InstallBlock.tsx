import { loadDependencies } from '../_lib/dependencies';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

/**
 * What to install and which files to copy for a component: the Nexus files it
 * imports first, then its own.
 */
export async function InstallBlock({ slug }: { slug: string }) {
  const { install, copy, files } = await loadDependencies(slug);
  const toCopy = [...copy, ...files];

  return (
    <>
      {install.length > 0 && (
        <CodeSample lang="bash">{`npm install ${install.join(' ')}`}</CodeSample>
      )}
      {toCopy.length > 0 && (
        <CodeBlock>
          <code>{toCopy.join('\n')}</code>
        </CodeBlock>
      )}
    </>
  );
}
