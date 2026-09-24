import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeBlock } from './CodeBlock';
import { CodeSample } from './CodeSample';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

const LIST_NAMES = ['install', 'copy', 'files'] as const;

type Dependencies = Record<(typeof LIST_NAMES)[number], string[]>;

async function listDependencyFiles() {
  try {
    return await readdir(DEPENDENCIES_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
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

  const filePath = path.join(DEPENDENCIES_DIR, fileName);
  const lists: Record<string, unknown> | null = JSON.parse(
    await readFile(filePath, 'utf8')
  );

  if (!lists || !LIST_NAMES.every((name) => isStringList(lists[name]))) {
    throw new Error(
      `InstallBlock: ${filePath} needs string arrays ${LIST_NAMES.join(', ')} — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
    );
  }
  return lists as Dependencies;
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

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
