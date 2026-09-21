import fs from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_CONFIG,
  discoverPrimitives,
  discoverSemantics,
  extractTokens,
  readTokenFile,
  resolveTokenReferences,
  STYLE_TOKEN_FILES,
} from './utils.js';

function jsonFiles(dir, prefix = '') {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const name = path.posix.join(prefix, entry.name);
      if (entry.isDirectory())
        return jsonFiles(path.join(dir, entry.name), name);
      return entry.name.endsWith('.json') ? [name] : [];
    })
    .sort();
}

/** Inventory all leaves, including files outside the generator's discovery rules. */
export function collectTokenSources(tokensDir) {
  const discovered = new Map();
  for (const [family, info] of Object.entries(
    discoverPrimitives(path.join(tokensDir, 'primitives'))
  )) {
    if (!info.modes) {
      discovered.set(`primitives/${family}.json`, {
        namespace: 'primitives',
        family,
        mode: null,
        variant: null,
      });
      continue;
    }
    for (const fileMode of info.modes) {
      const themed = fileMode.match(/^(.+)-(light|dark)$/);
      discovered.set(`primitives/${family}/${family}-${fileMode}.json`, {
        namespace: 'primitives',
        family,
        mode: themed?.[1] ?? fileMode,
        variant: themed?.[2] ?? null,
      });
    }
  }
  const semantic = discoverSemantics(path.join(tokensDir, 'semantic'));
  for (const file of semantic.standalone) {
    discovered.set(`semantic/${file}`, {
      namespace: 'semantic',
      family: file.slice(0, -5),
      mode: null,
      variant: null,
    });
  }
  for (const [family, modes] of Object.entries(semantic.perModeFiles)) {
    for (const [mode, file] of Object.entries(modes)) {
      discovered.set(`semantic/${file}`, {
        namespace: 'semantic',
        family,
        mode,
        variant: null,
      });
    }
  }
  const records = [];
  for (const file of jsonFiles(tokensDir)) {
    const segments = file.split('/');
    const info = discovered.get(file) ?? {
      namespace: segments[0],
      family: path.basename(file, '.json'),
      mode: null,
      variant: null,
    };
    let tokens;
    try {
      tokens = extractTokens(readTokenFile(path.join(tokensDir, file)));
    } catch (error) {
      throw new Error(`Invalid token source ${file}: ${error.message}`, {
        cause: error,
      });
    }
    for (const token of tokens) {
      const logicalId = `${info.namespace}:${info.family}:${token.path.join('.')}`;
      records.push({
        ...info,
        logicalId,
        id: `${logicalId}@${info.mode ?? 'base'}:${info.variant ?? 'all'}`,
        file,
        path: token.path,
        type: token.type,
        rawValue: token.value,
        description: token.description ?? null,
        discovered:
          discovered.has(file) ||
          Object.values(STYLE_TOKEN_FILES).includes(file),
      });
    }
  }
  const ids = new Set();
  for (const record of records) {
    if (ids.has(record.id))
      throw new Error(
        `Duplicate token identity: ${record.id} (${record.file})`
      );
    ids.add(record.id);
  }
  return records;
}

/** Resolve in the leaf's own mode, with other families taken from build defaults. */
export function resolveTokenSources(records, config = DEFAULT_CONFIG) {
  const defaults = { ...DEFAULT_CONFIG, ...config };
  for (const record of records) {
    if (
      record.namespace === 'primitives' &&
      record.mode &&
      !defaults[record.family]
    ) {
      defaults[record.family] = record.mode;
    }
  }
  const maps = new Map();
  function referenceMap(record) {
    const contextKey = `${record.namespace}:${record.family}:${record.mode}:${record.variant}`;
    if (maps.has(contextKey)) return maps.get(contextKey);
    const map = new Map();
    for (const candidate of records) {
      const sameFamily =
        candidate.namespace === record.namespace &&
        candidate.family === record.family;
      const chosenMode = sameFamily
        ? record.mode
        : candidate.namespace === 'semantic' && candidate.family === 'spacing'
          ? defaults.spacingDefault
          : defaults[candidate.family];
      const chosenVariant = sameFamily
        ? record.variant
        : (record.variant ?? 'light');
      if (candidate.mode && candidate.mode !== chosenMode) continue;
      if (candidate.variant && candidate.variant !== chosenVariant) continue;
      const bare = candidate.path.join('.');
      map.set(`${candidate.namespace}.${candidate.family}.${bare}`, candidate);
      if (candidate.namespace === 'primitives') {
        map.set(bare, candidate);
        map.set(`${candidate.family}.${bare}`, candidate);
      }
    }
    // Non-primitive aliases require an unambiguous qualified family path.
    for (const candidate of records) {
      const qualified = `${candidate.namespace}.${candidate.family}.${candidate.path.join('.')}`;
      if (
        map.get(qualified) !== candidate ||
        candidate.namespace === 'primitives'
      )
        continue;
      const alias = `${candidate.family}.${candidate.path.join('.')}`;
      if (!map.has(alias)) map.set(alias, candidate);
    }
    maps.set(contextKey, map);
    return map;
  }
  return records.map((record) => {
    const map = referenceMap(record);
    const resolved = resolveTokenReferences(
      record.rawValue,
      (reference) => map.get(reference),
      record.id
    );
    return {
      ...record,
      resolvedValue: resolved.value,
      references: resolved.references,
    };
  });
}
