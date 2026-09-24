import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

type Dependencies = { install: string[]; copy: string[] };

async function listDependencyFiles() {
  try {
    return await readdir(DEPENDENCIES_DIR);
  } catch (error) {
    throw new Error(
      `InstallBlock: no ${DEPENDENCIES_DIR} — run \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`,
      { cause: error }
    );
  }
}

async function loadDependencies(slug: string): Promise<Dependencies> {
  const fileNames = await listDependencyFiles();
  const fileName = `${slug}.json`;

  if (!fileNames.includes(fileName)) {
    const known = fileNames.map((name) => path.basename(name, '.json'));
    throw new Error(
      `InstallBlock: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  return JSON.parse(
    await readFile(path.join(DEPENDENCIES_DIR, fileName), 'utf8')
  );
}

/** What to install and which Nexus files to copy before pasting a component. */
export async function InstallBlock({ slug }: { slug: string }) {
  const { install, copy } = await loadDependencies(slug);

  return (
    <>
      {install.length > 0 && (
        <CodeSample lang="bash">{`npm install ${install.join(' ')}`}</CodeSample>
      )}
      {copy.length > 0 && (
        <CodeBlock>
          <code>{copy.join('\n')}</code>
        </CodeBlock>
      )}
    </>
  );
}
