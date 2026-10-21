import {
  type Catalog,
  type CatalogItem,
  findItem,
  type Framework,
  loadCatalog,
  SETUP,
  variantOf,
} from '../catalog';
import { readConfig } from '../config';
import { CliError } from '../errors';
import { readProject } from '../project';

import type { CommandResult } from './result';

const KINDS = ['component', 'block'] as const;
type Kind = (typeof KINDS)[number];

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

export function list(kind: string | undefined): CommandResult {
  if (kind !== undefined && !KINDS.includes(kind as Kind)) {
    throw new CliError(`--kind takes ${KINDS.join(' or ')}.`);
  }
  const items = loadCatalog().items.filter(
    (item) => item.name !== SETUP && (kind === undefined || item.kind === kind)
  );
  return { data: items.map(summary), lines: summaryLines(items), ok: true };
}

export function search(query: string | undefined): CommandResult {
  if (!query)
    throw new CliError('Give a search term, such as `nxds search date`.');
  const needle = query.toLowerCase();
  const rank = (item: CatalogItem) => {
    if (item.name.includes(needle)) return 0;
    if (item.title.toLowerCase().includes(needle)) return 1;
    if (item.description.toLowerCase().includes(needle)) return 2;
    return undefined;
  };
  const items = loadCatalog()
    .items.filter((item) => item.name !== SETUP)
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
    'This release has several frameworks. Run `nxds init` first, so nxds knows which one your app uses.'
  );
}

export function view(cwd: string, name: string | undefined): CommandResult {
  if (!name) throw new CliError('Name an item, such as `nxds view button`.');
  const catalog = loadCatalog();
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
        ? `nxds: set up in ${config.dir}, CSS entry ${config.css}`
        : 'nxds: not set up. Run `nxds init`.',
      ...(config && config.items.length > 0
        ? [
            `Installed: ${config.items.filter((item) => item !== SETUP).join(', ') || 'setup only'}`,
          ]
        : []),
    ],
    ok: true,
  };
}
