import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { generateTailwindArtifacts } from './generate-tailwind-package.js';
import {
  DEFAULT_CONFIG,
  pathToCssVarPrefixed,
  STYLE_TOKEN_FILES,
} from './utils.js';

const REPO_DIR = fileURLToPath(new URL('../../../', import.meta.url));
const TOKENS_DIR = path.join(REPO_DIR, 'packages/core/tokens');

function digest(content) {
  return createHash('sha256').update(content).digest('hex');
}

/** Read the emitted package, not a second serialization of token values. */
export function indexCssArtifacts(files) {
  const emissions = [];
  for (const [file, css] of Object.entries(files)) {
    postcss.parse(css, { from: file }).walkDecls((declaration) => {
      const contexts = [];
      let utility = null;
      let theme = false;
      for (
        let parent = declaration.parent;
        parent?.type !== 'root';
        parent = parent.parent
      ) {
        if (parent.type === 'rule') contexts.unshift(parent.selector);
        if (parent.type === 'atrule') {
          contexts.unshift(`@${parent.name} ${parent.params}`.trim());
          if (parent.name === 'utility') utility = `nx:${parent.params}`;
          if (parent.name === 'theme') theme = true;
        }
      }
      emissions.push({
        id: `${file}:${declaration.source.start.line}:${declaration.prop}`,
        file,
        line: declaration.source.start.line,
        context: contexts.join(' → '),
        property: declaration.prop,
        value: declaration.value,
        important: declaration.important,
        kind: utility ? 'utility' : theme ? 'theme' : 'rule',
        utility,
        variables: [...declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)].map(
          (match) => match[1]
        ),
      });
    });
  }
  return emissions;
}

function sourceProperty(record) {
  const name = pathToCssVarPrefixed(record.path);
  if (record.namespace === 'primitives')
    return `--${pathToCssVarPrefixed(record.path, record.family, true)}`;
  if (record.namespace === 'semantic')
    return `--${record.family === 'spacing' ? 'nx-' : ''}${name}`;
  if (record.file === STYLE_TOKEN_FILES.shadow && record.type === 'shadow')
    return `--${pathToCssVarPrefixed(record.path, 'shadow')}`;
  return null;
}

function matchesSourceContext(record, emission, config, usedModes) {
  if (record.namespace === 'styles') return true;
  if (record.namespace === 'semantic' && record.family !== 'spacing') {
    return record.type === 'dimension' || record.family === 'z-index';
  }
  const attribute = record.family === 'spacing' ? 'density' : record.family;
  const selectorMode = emission.context.match(
    new RegExp(`data-${attribute}=['"]([^'"]+)['"]`)
  );
  if (selectorMode) {
    const dark = emission.context.includes('.dark');
    return (
      record.mode === selectorMode[1] &&
      (!record.variant || record.variant === (dark ? 'dark' : 'light'))
    );
  }
  if (emission.kind === 'theme' && record.family === 'spacing')
    return record.mode === 'default';
  const selectedMode =
    record.family === 'spacing'
      ? config.spacingDefault
      : usedModes[record.family];
  return (
    (!record.mode || record.mode === selectedMode) &&
    (!record.variant ||
      record.variant ===
        (emission.context.includes('.dark') ? 'dark' : 'light'))
  );
}

function sourceEmissions(record, emissions, config, usedModes) {
  if (!record.discovered) return [];
  if (
    record.file === STYLE_TOKEN_FILES.typography &&
    record.type === 'typography'
  ) {
    return emissions.filter(
      (emission) =>
        emission.utility ===
        `nx:${pathToCssVarPrefixed(record.path, 'typography')}`
    );
  }
  const property = sourceProperty(record);
  if (!property) return [];
  return emissions.filter((emission) => {
    const isOwnProperty =
      emission.property === property ||
      (record.family === 'spacing' &&
        emission.kind === 'theme' &&
        emission.property === property.replace('--nx-', '--'));
    return (
      isOwnProperty && matchesSourceContext(record, emission, config, usedModes)
    );
  });
}

function unEmittedReason(record) {
  if (!record.discovered)
    return 'This source is outside the production generator’s discovery rules.';
  if (record.namespace === 'semantic' && record.type === 'color')
    return 'Semantic colors are owned by the runtime registry; this authored leaf is not used by the Tailwind generator.';
  if (record.namespace === 'primitives' && record.mode)
    return 'This build selects a different mode, or the dark value equals the light value and needs no separate override.';
  return 'The production generator has no emission for this leaf in the current build configuration.';
}

function themeExamples(property) {
  const namespaces = [
    ['--color-', ['bg-', 'text-', 'border-']],
    ['--spacing-', ['p-', 'gap-', 'w-']],
    ['--radius-', ['rounded-']],
    ['--shadow-', ['shadow-']],
    ['--ease-', ['ease-']],
    ['--z-index-', ['z-']],
  ];
  for (const [prefix, utilities] of namespaces) {
    if (property.startsWith(prefix))
      return utilities.map(
        (name) => `nx:${name}${property.slice(prefix.length)}`
      );
  }
  if (property.startsWith('--breakpoint-'))
    return [`nx:${property.slice('--breakpoint-'.length)}:…`];
  return [];
}

function capabilities(own, emissions) {
  const variables = new Set(own.map((emission) => emission.property));
  const dependentTheme = emissions.filter(
    (emission) =>
      emission.kind === 'theme' &&
      emission.variables.some((variable) => variables.has(variable))
  );
  const utilities = emissions.filter(
    (emission) =>
      emission.utility &&
      emission.variables.some((variable) => variables.has(variable))
  );
  return {
    utilityDefinitions: [
      ...new Set(
        [...own, ...utilities]
          .map((emission) => emission.utility)
          .filter(Boolean)
      ),
    ],
    themeExamples: [
      ...new Set(
        [...own, ...dependentTheme]
          .filter((emission) => emission.kind === 'theme')
          .flatMap((emission) => themeExamples(emission.property))
      ),
    ],
    consumerEmissions: [...dependentTheme, ...utilities].map(
      (emission) => emission.id
    ),
  };
}

function sourceMetadata(repoDir, file, revision, repositoryUrl) {
  const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
  let committed = false;
  if (revision) {
    try {
      committed =
        execFileSync('git', ['show', `${revision}:${file}`], {
          cwd: repoDir,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }) === content;
    } catch {
      /* Local-only source has no revision link. */
    }
  }
  return {
    path: file,
    hash: digest(content),
    committed,
    url:
      committed && repositoryUrl
        ? `${repositoryUrl}/blob/${revision}/${file}`
        : null,
  };
}

function gitMetadata(repoDir) {
  try {
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoDir,
      encoding: 'utf8',
    }).trim();
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: repoDir,
      encoding: 'utf8',
    }).trim();
    const repositoryUrl = remote
      .replace(/^git@([^:]+):/, 'https://$1/')
      .replace(/^git\+/, '')
      .replace(/\.git$/, '');
    return {
      revision,
      repositoryUrl: /^https:\/\//.test(repositoryUrl) ? repositoryUrl : null,
    };
  } catch {
    return { revision: null, repositoryUrl: null };
  }
}

function implementationSources(repoDir, directory) {
  const root = path.join(repoDir, directory);
  return fs
    .readdirSync(root, { recursive: true })
    .filter(
      (file) =>
        /\.(ts|js|mjs|json)$/.test(file) && !/\.(test|fixture)\./.test(file)
    )
    .sort()
    .filter((file) => !file.includes('__tests__/'))
    .map((file) => `${directory}/${file}`);
}

/** Build-only API. Nothing from this module is exported by the runtime package. */
export async function generateTokenCatalog({
  engine,
  tokensDir = TOKENS_DIR,
  repoDir = REPO_DIR,
  config = DEFAULT_CONFIG,
} = {}) {
  if (!engine?.inspectTheme)
    throw new Error('Token catalog requires the Unit 3 inspectTheme engine.');
  const buildConfig = { ...DEFAULT_CONFIG, ...config };
  const artifacts = await generateTailwindArtifacts(buildConfig, {
    tokensDir,
    engine,
  });
  const inspection = engine.inspectTheme(
    engine.createNexusThemeContract({
      ...engine.DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: artifacts.baseTone,
      brandColor:
        buildConfig.brandColor ?? engine.DEFAULT_NEXUS_APPEARANCE.brandColor,
    })
  );
  const emissions = indexCssArtifacts(artifacts.files);
  const git = gitMetadata(repoDir);
  const sourceFiles = [
    ...new Set(
      artifacts.sources.map((record) =>
        path.relative(repoDir, path.join(tokensDir, record.file))
      )
    ),
  ];
  const sources = [
    ...sourceFiles,
    ...implementationSources(repoDir, 'packages/core/src'),
    ...implementationSources(repoDir, 'packages/core/scripts'),
  ].map((file) =>
    sourceMetadata(repoDir, file, git.revision, git.repositoryUrl)
  );
  const records = artifacts.sources.map((record) => {
    const own = sourceEmissions(
      record,
      emissions,
      buildConfig,
      artifacts.usedModes
    );
    return {
      ...record,
      source: path.relative(repoDir, path.join(tokensDir, record.file)),
      emissions: own.map((emission) => emission.id),
      ...capabilities(own, emissions),
      notEmittedReason: own.length ? null : unEmittedReason(record),
      notes:
        record.type === 'typography'
          ? [
              'Typography emits a set of declarations in one @utility, rather than a scalar custom property.',
              ...(JSON.stringify(record.rawValue).includes('"auto"')
                ? ['The production formatter maps authored auto to CSS normal.']
                : []),
              ...(record.path[0] === 'heading' || record.path[0] === 'body'
                ? ['The generator adds text-wrap as a progressive enhancement.']
                : []),
            ]
          : record.type === 'shadow'
            ? [
                'The shadow formatter composes the referenced layers in order.',
                ...(record.path[0] === 'inner'
                  ? ['The inner shadow adds the inset keyword.']
                  : []),
              ]
            : [],
    };
  });
  for (const meta of engine.SEMANTIC_TOKEN_REGISTRY) {
    const property = `--nx-color-${meta.name}`;
    const logicalId = `runtime:color:${meta.name}`;
    for (const mode of ['light', 'dark']) {
      const own = emissions.filter((emission) =>
        mode === 'dark'
          ? emission.property === property && emission.context === '.dark'
          : emission.property === `--color-${meta.name}` &&
            (emission.kind === 'theme' || emission.context === ':root')
      );
      records.push({
        id: `${logicalId}@${mode}`,
        logicalId,
        namespace: 'runtime',
        family: meta.category,
        path: [meta.name],
        type: 'color',
        mode,
        variant: null,
        description: meta.description ?? null,
        rawValue: null,
        resolvedValue: inspection.theme[mode][property],
        references: [],
        file: null,
        source: 'packages/core/src/lib/token-registry.ts',
        discovered: true,
        emissions: own.map((emission) => emission.id),
        ...capabilities(own, emissions),
        notEmittedReason: null,
        notes: [
          'Derived by inspectTheme from the build configuration; there is no authored $value.',
          'The light @theme inline value and :root alias include a static fallback; the appearance provider can override the runtime property.',
        ],
      });
    }
  }
  const catalog = {
    schemaVersion: 1,
    build: {
      ...git,
      input: inspection.normalizedInput,
      hasLocalChanges: sources.some((source) => !source.committed),
      config: {
        ...buildConfig,
        ...artifacts.usedModes,
        brandColor:
          buildConfig.brandColor ?? engine.DEFAULT_NEXUS_APPEARANCE.brandColor,
      },
      contentHash: digest(
        JSON.stringify({
          sources,
          files: artifacts.files,
          input: inspection.input,
        })
      ),
      boundary:
        'Generated @nexus_ds/tailwind package; utilities are available capabilities, not proof of inclusion in the application stylesheet.',
    },
    counts: {
      authoredLeaves: artifacts.sources.length,
      authoredFiles: sourceFiles.length,
      runtimeTokens: engine.SEMANTIC_TOKEN_REGISTRY.length,
      logicalTokens: new Set(records.map((record) => record.logicalId)).size,
    },
    sources,
    records,
    emissions,
    artifacts: Object.entries(artifacts.files).map(([file, css]) => ({
      file,
      hash: digest(css),
    })),
  };
  return { catalog, inspection, css: artifacts.files };
}
