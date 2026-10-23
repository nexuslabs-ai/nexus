import {
  type Catalog,
  type CatalogItem,
  findItem,
  type Framework,
  loadRelease,
  SETUP,
  variantOf,
} from '../catalog';
import { CLI_COMMAND } from '../cli-command';
import { readConfig } from '../config';
import { CliError } from '../errors';
import { readProject } from '../project';

import type { CommandResult } from './result';

/** The release the app is on, else the latest: what `add` would install. */
function appRelease(cwd: string, registry: string) {
  return loadRelease(registry, readConfig(cwd)?.version ?? 'latest');
}

function summary(item: CatalogItem) {
  return {
    name: item.name,
    kind: item.kind,
    title: item.title,
    description: item.description,
  };
}

/** The first sentence, for one-line listings. */
function firstSentence(text: string) {
  return text.split(/(?<=\.)\s/)[0]?.replaceAll('`', '') ?? text;
}

function summaryLines(items: CatalogItem[]) {
  const width = Math.max(...items.map((item) => item.name.length));
  return items.map(
    (item) => `${item.name.padEnd(width)}  ${firstSentence(item.description)}`
  );
}

export async function list(
  cwd: string,
  registry: string,
  kind: 'component' | 'block' | undefined
): Promise<CommandResult> {
  const items = (await appRelease(cwd, registry)).items.filter(
    (item) => item.name !== SETUP && (kind === undefined || item.kind === kind)
  );
  return { data: items.map(summary), lines: summaryLines(items), ok: true };
}

export async function search(
  cwd: string,
  registry: string,
  query: string
): Promise<CommandResult> {
  const needle = query.toLowerCase();
  const rank = (item: CatalogItem) => {
    if (item.name.includes(needle)) return 0;
    if (item.title.toLowerCase().includes(needle)) return 1;
    if (item.description.toLowerCase().includes(needle)) return 2;
    return undefined;
  };
  const items = (await appRelease(cwd, registry)).items
    .filter((item) => item.name !== SETUP)
    .flatMap((item) => {
      const score = rank(item);
      return score === undefined ? [] : [{ item, score }];
    })
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
  return {
    data: items.map(summary),
    lines:
      items.length > 0 ? summaryLines(items) : [`Nothing matches "${query}".`],
    ok: true,
  };
}

/** The framework in nxds.json, else the catalog's only one. */
function projectFramework(cwd: string, catalog: Catalog): Framework {
  const configured = readConfig(cwd)?.framework;
  if (configured) return configured;
  const [only, ...others] = catalog.frameworks;
  if (only && others.length === 0) return only;
  throw new CliError(
    `This release has several frameworks. Run \`${CLI_COMMAND} init\` first, so nxds knows which one your app uses.`
  );
}

export async function view(
  cwd: string,
  registry: string,
  name: string
): Promise<CommandResult> {
  const catalog = await appRelease(cwd, registry);
  const item = findItem(catalog, name);
  const variant = variantOf(item, projectFramework(cwd, catalog));
  const packages = Object.entries(variant.packages.npm).map(
    ([pkg, range]) => `${pkg}@${range}`
  );
  const needs = variant.items.filter((other) => other !== SETUP);
  return {
    data: {
      ...summary(item),
      docs: item.docs,
      items: variant.items,
      packages,
      files: variant.files.map((file) => file.path),
    },
    lines: [
      `${item.title} (${item.kind})`,
      item.description,
      `Docs: ${item.docs}`,
      ...(needs.length > 0 ? [`Also installs: ${needs.join(', ')}`] : []),
      ...(packages.length > 0 ? [`Packages: ${packages.join(' ')}`] : []),
      'Files:',
      ...variant.files.map((file) => `  ${file.path}`),
    ],
    ok: true,
  };
}

export function info(cwd: string): CommandResult {
  const project = readProject(cwd);
  const config = readConfig(cwd);
  const setupLabel = {
    'next-app': 'Next.js App Router',
    'vite-react': 'Vite + React',
  };
  return {
    data: {
      setup: project.setup,
      packageManager: project.packageManager,
      typescript: project.typescript,
      tailwind: project.dependencies.tailwindcss ?? null,
      initialized: config !== null,
      version: config?.version ?? null,
      dir: config?.dir ?? null,
      css: config?.css ?? null,
      items: config?.items ?? [],
    },
    lines: [
      `App: ${project.setup ? setupLabel[project.setup] : 'not supported by init (see https://nxds.dev/getting-started/install)'}`,
      `Package manager: ${project.packageManager}`,
      `TypeScript: ${project.typescript ? 'yes' : 'no'}`,
      `Tailwind: ${project.dependencies.tailwindcss ?? 'not installed'}`,
      config
        ? `nxds: ${config.version} in ${config.dir}, CSS entry ${config.css}`
        : `nxds: not set up. Run \`${CLI_COMMAND} init\`.`,
      ...(config && config.items.length > 0
        ? [
            `Installed: ${config.items.filter((item) => item !== SETUP).join(', ') || 'setup only'}`,
          ]
        : []),
    ],
    ok: true,
  };
}
