// Validates per-mode key-set parity across ALL runtime token mode families —
// spacing (semantic) plus radius / borderwidth / shadow (primitives), see
// `modeFamilyConfigs` — despite the historical `spacing-modes` filename.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BASELINE_MODE,
  CANONICAL_BORDERWIDTH_MODES,
  CANONICAL_MODES,
  CANONICAL_RADIUS_MODES,
  CANONICAL_SHADOW_MODES,
  KEY_PARITY_MODE_FAMILY_CONFIGS,
  keyParityModeFamilyConfigs,
} from './lib/token-mode-manifest.js';

export {
  BASELINE_MODE,
  CANONICAL_BORDERWIDTH_MODES,
  CANONICAL_MODES,
  CANONICAL_RADIUS_MODES,
  CANONICAL_SHADOW_MODES,
};

const EXIT_OK = 0;
const EXIT_DRIFT = 1;
const EXIT_CONFIG = 2;

export class ConfigError extends Error {}

export const modeFamilyConfigs = keyParityModeFamilyConfigs;

/**
 * Walk a DTCG token tree and return sorted leaf paths as dotted strings.
 *
 * A "leaf" is a node carrying BOTH $value and $type (the DTCG token contract).
 * Sibling keys starting with `$` (metadata like $meta, $description) are
 * skipped. A typo like `value:` (no $) won't slip through — its parent won't
 * be recognised as a leaf, so the walker keeps descending and the typo'd
 * branch contributes nothing.
 */
export function leafPathsOf(modeData) {
  const paths = [];
  function walk(node, parts) {
    if (!node || typeof node !== 'object') return;
    if ('$value' in node && '$type' in node) {
      paths.push(parts.join('.'));
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      walk(value, [...parts, key]);
    }
  }
  walk(modeData, []);
  return paths.sort();
}

/**
 * Per-mode key-set parity check.
 *
 * @returns {{ missing: string[], extra: string[] }}
 *   missing — paths in baseline but absent from mode
 *   extra   — paths in mode but absent from baseline
 */
export function diffKeySets(baselinePaths, modePaths) {
  const baselineSet = new Set(baselinePaths);
  const modeSet = new Set(modePaths);
  return {
    missing: baselinePaths.filter((p) => !modeSet.has(p)).sort(),
    extra: modePaths.filter((p) => !baselineSet.has(p)).sort(),
  };
}

/**
 * @param {Map<string, object>} modeDataMap  mode name → parsed JSON
 * @param {string} baseline                  default 'default'
 * @returns {{ mode: string, missing: string[], extra: string[] }[]}
 *   one entry per non-baseline mode, sorted by mode name
 * @throws when the baseline mode is absent from the map
 */
export function validateModes(modeDataMap, baseline = BASELINE_MODE) {
  const baselineData = modeDataMap.get(baseline);
  if (!baselineData) {
    throw new ConfigError(`baseline mode "${baseline}" not found in input`);
  }
  const baselinePaths = leafPathsOf(baselineData);
  const results = [];
  for (const [mode, data] of modeDataMap) {
    if (mode === baseline) continue;
    const diff = diffKeySets(baselinePaths, leafPathsOf(data));
    results.push({ mode, ...diff });
  }
  return results.sort((a, b) => a.mode.localeCompare(b.mode));
}

export function assertCanonicalModeSet(
  discoveredModes,
  canonicalModes = CANONICAL_MODES,
  familyName = 'spacing'
) {
  const discoveredSet = new Set(discoveredModes);
  const canonicalSet = new Set(canonicalModes);
  const unexpected = [...discoveredSet].filter((m) => !canonicalSet.has(m));
  const missing = [...canonicalSet].filter((m) => !discoveredSet.has(m));
  if (unexpected.length > 0 || missing.length > 0) {
    const parts = [];
    if (unexpected.length > 0) {
      parts.push(`unexpected mode file(s): ${unexpected.sort().join(', ')}`);
    }
    if (missing.length > 0) {
      parts.push(`missing canonical mode(s): ${missing.sort().join(', ')}`);
    }
    throw new ConfigError(
      `${familyName}-*.json file set does not match canonical modes.\n  ${parts.join('\n  ')}\n  Canonical: ${canonicalModes.join(', ')}`
    );
  }
}

export function discoverFamilyModes(config) {
  if (!fs.existsSync(config.dir)) {
    throw new ConfigError(
      `directory not found for ${config.name}: ${config.dir}`
    );
  }
  const entries = fs.readdirSync(config.dir);
  const found = [];
  for (const name of entries) {
    const match = name.match(config.modePattern);
    if (match) found.push(match[1]);
  }
  return found.sort();
}

function readFamilyModeOrFail(config, mode) {
  const filePath = path.join(config.dir, config.fileName(mode));
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new ConfigError(`failed to read ${filePath}: ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new ConfigError(`failed to parse ${filePath}: ${err.message}`);
  }
}

export function validateModeFamily(config) {
  const discovered = discoverFamilyModes(config);
  assertCanonicalModeSet(discovered, config.expectedModes, config.name);

  const modeDataMap = new Map();
  for (const mode of discovered) {
    modeDataMap.set(mode, readFamilyModeOrFail(config, mode));
  }

  return {
    config,
    findings: validateModes(modeDataMap, config.baseline),
  };
}

export function validateModeFamilies(configs = KEY_PARITY_MODE_FAMILY_CONFIGS) {
  return configs.map((config) => validateModeFamily(config));
}

export function formatFamilyFindings({ config, findings }) {
  const lines = [];
  lines.push(
    `─── validate-token-mode-family: ${config.reportName} (baseline: ${config.baseline}) ───`
  );
  for (const { mode, missing, extra } of findings) {
    const fileName = config.fileName(mode);
    if (missing.length === 0 && extra.length === 0) {
      lines.push(`  ✓ ${fileName} (matches baseline)`);
      continue;
    }
    lines.push(
      `  ✗ ${fileName} (${missing.length} missing, ${extra.length} extra)`
    );
    for (const p of missing) {
      lines.push(
        `      missing: ${p} (in ${config.fileName(config.baseline)} but not in ${fileName})`
      );
    }
    for (const p of extra) {
      lines.push(
        `      extra:   ${p} (in ${fileName} but not in ${config.fileName(config.baseline)})`
      );
    }
  }
  return lines.join('\n');
}

export function formatFamilyReports(results) {
  return results.map((result) => formatFamilyFindings(result)).join('\n\n');
}

function main() {
  try {
    const results = validateModeFamilies();
    const hasDrift = results.some((result) =>
      result.findings.some((f) => f.missing.length > 0 || f.extra.length > 0)
    );

    if (hasDrift) {
      process.stderr.write(formatFamilyReports(results) + '\n');
      process.stderr.write(
        `\n✗ Token mode files diverge from their family baselines.\n`
      );
      process.stderr.write(
        `  Fix: add the missing keys or remove the extras so every mode file in each family has the same key set.\n`
      );
      process.exit(EXIT_DRIFT);
    }

    process.stdout.write(formatFamilyReports(results) + '\n');
    process.stdout.write(
      `\n✓ All token mode families share the same key set.\n`
    );
    process.exit(EXIT_OK);
  } catch (err) {
    if (err instanceof ConfigError) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(EXIT_CONFIG);
    }
    throw err;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
