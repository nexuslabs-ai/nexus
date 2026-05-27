import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(__dirname, '..', 'tokens', 'semantic');

export const BASELINE_MODE = 'vega';

// The seven canonical density modes per .claude/rules/spacing-tokens.md.
// An unknown filename (e.g. spacing-foo.json) or a missing canonical mode
// is a structural error (exit 2), not key drift (exit 1).
export const CANONICAL_MODES = [
  'luma',
  'lyra',
  'maia',
  'mira',
  'nova',
  'sera',
  'vega',
];

const EXIT_OK = 0;
const EXIT_DRIFT = 1;
const EXIT_CONFIG = 2;

class ConfigError extends Error {}

/**
 * Walk a DTCG token tree and return sorted leaf paths as dotted strings.
 *
 * A "leaf" is a node carrying BOTH $value and $type (the DTCG token contract).
 * Sibling keys starting with `$` (metadata like $meta, $description) are
 * skipped. A typo like `value:` (no $) won't slip through — its parent won't
 * be recognised as a leaf, so the walker keeps descending and the typo'd
 * branch contributes nothing.
 *
 * Deliberately not delegated to utils.js#extractTokens: that helper is
 * token-aware and may grow to handle refs / $extensions, which would silently
 * shift what counts as "a key" here. This validator wants the most minimal
 * possible definition of a leaf path.
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
 * Output shape is intentionally per-mode (one row per non-baseline file)
 * with two drift arrays, rather than the discriminated-union { kind, path }
 * shape used by audit-figma-parity. Different problem: figma-parity diffs
 * values at known paths; this validator diffs key sets across mode files.
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
 * @param {string} baseline                  default 'vega'
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

/**
 * Format a per-mode findings list into a human-readable multi-line report.
 * Only non-empty findings (a mode with at least one missing or extra path)
 * are emitted as failure lines; clean modes get a ✓ line.
 */
export function formatFindings(findings, baseline = BASELINE_MODE) {
  const lines = [];
  lines.push(`─── validate-spacing-modes (baseline: ${baseline}) ───`);
  for (const { mode, missing, extra } of findings) {
    if (missing.length === 0 && extra.length === 0) {
      lines.push(`  ✓ spacing-${mode}.json (matches baseline)`);
      continue;
    }
    lines.push(
      `  ✗ spacing-${mode}.json (${missing.length} missing, ${extra.length} extra)`
    );
    for (const p of missing) {
      lines.push(
        `      missing: ${p} (in spacing-${baseline}.json but not in spacing-${mode}.json)`
      );
    }
    for (const p of extra) {
      lines.push(
        `      extra:   ${p} (in spacing-${mode}.json but not in spacing-${baseline}.json)`
      );
    }
  }
  return lines.join('\n');
}

function discoverModes(semanticDir) {
  const entries = fs.readdirSync(semanticDir);
  const found = [];
  for (const name of entries) {
    const match = name.match(/^spacing-([a-z]+)\.json$/);
    if (match) found.push(match[1]);
  }
  return found.sort();
}

function assertCanonicalModeSet(discoveredModes) {
  const discoveredSet = new Set(discoveredModes);
  const canonicalSet = new Set(CANONICAL_MODES);
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
      `spacing-*.json file set does not match canonical modes.\n  ${parts.join('\n  ')}\n  Canonical: ${CANONICAL_MODES.join(', ')}\n  See .claude/rules/spacing-tokens.md`
    );
  }
}

function readModeOrFail(mode) {
  const filePath = path.join(SEMANTIC_DIR, `spacing-${mode}.json`);
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

function main() {
  try {
    const discovered = discoverModes(SEMANTIC_DIR);
    assertCanonicalModeSet(discovered);

    const modeDataMap = new Map();
    for (const mode of discovered) {
      modeDataMap.set(mode, readModeOrFail(mode));
    }

    const findings = validateModes(modeDataMap);
    const hasDrift = findings.some(
      (f) => f.missing.length > 0 || f.extra.length > 0
    );

    if (hasDrift) {
      process.stderr.write(formatFindings(findings) + '\n');
      process.stderr.write(
        `\n✗ Spacing mode files diverge from baseline (${BASELINE_MODE}).\n`
      );
      process.stderr.write(
        `  Fix: add the missing keys or remove the extras so every mode file has the same key set.\n`
      );
      process.stderr.write(
        `  See .claude/rules/spacing-tokens.md → Schema validation.\n`
      );
      process.exit(EXIT_DRIFT);
    }

    process.stdout.write(formatFindings(findings) + '\n');
    process.stdout.write(
      `\n✓ All ${discovered.length} spacing mode files share the same key set.\n`
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
