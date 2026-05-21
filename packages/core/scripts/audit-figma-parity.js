import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractTokens, readTokenFile } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(__dirname, '..', 'tokens');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const DEFAULT_SNAPSHOT = path.join(TOKENS_DIR, 'figma-snapshot.json');

const CATEGORIES = {
  color: {
    file: path.join(PRIMITIVES_DIR, 'color.json'),
  },
};

const PENDING_CATEGORIES = {
  size: '#61',
  radius: '#61',
  borderwidth: '#61',
  typography: '#62',
  shadow: '#63',
};

const EXIT_OK = 0;
const EXIT_DRIFT = 1;
const EXIT_CONFIG = 2;

export function parseArgs(argv) {
  const args = { category: null, snapshot: DEFAULT_SNAPSHOT };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      args[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[arg.slice(2)] = next;
      i++;
    }
  }
  return args;
}

function normalizeValue(value, type) {
  if (type === 'color' && typeof value === 'string') {
    return value.toLowerCase();
  }
  if (
    type === 'dimension' &&
    typeof value === 'object' &&
    value !== null &&
    'value' in value
  ) {
    const rounded = Math.round(value.value * 10000) / 10000;
    return `${rounded}${value.unit || 'px'}`;
  }
  return value;
}

function buildTokenMap(subtree) {
  const tokens = extractTokens(subtree);
  const map = new Map();
  for (const token of tokens) {
    map.set(token.path.join('.'), {
      value: normalizeValue(token.value, token.type),
      type: token.type,
    });
  }
  return map;
}

/**
 * @param {object} codeSubtree - Parsed JSON for the code side (e.g., color.json contents)
 * @param {object} snapshotSubtree - Parsed JSON for the Figma snapshot side (same shape)
 * @returns {{ path: string, kind: string, code?: object, figma?: object }[]}
 */
export function diffTokenTrees(codeSubtree, snapshotSubtree) {
  const codeMap = buildTokenMap(codeSubtree);
  const figmaMap = buildTokenMap(snapshotSubtree);
  const findings = [];

  for (const [tokenPath, code] of codeMap) {
    const figma = figmaMap.get(tokenPath);
    if (!figma) {
      findings.push({ path: tokenPath, kind: 'missing-in-figma', code });
      continue;
    }
    if (code.type !== figma.type) {
      findings.push({ path: tokenPath, kind: 'type-mismatch', code, figma });
      continue;
    }
    if (code.value !== figma.value) {
      findings.push({ path: tokenPath, kind: 'value-mismatch', code, figma });
    }
  }

  for (const [tokenPath, figma] of figmaMap) {
    if (!codeMap.has(tokenPath)) {
      findings.push({ path: tokenPath, kind: 'missing-in-code', figma });
    }
  }

  return findings.sort((a, b) => a.path.localeCompare(b.path));
}

function formatFinding(finding) {
  const label = finding.path.padEnd(40);
  switch (finding.kind) {
    case 'value-mismatch':
      return `  ✗ ${label} code=${finding.code.value}  figma=${finding.figma.value}  → push ${finding.code.value} to Figma`;
    case 'type-mismatch':
      return `  ✗ ${label} type drift: code=${finding.code.type}  figma=${finding.figma.type}`;
    case 'missing-in-figma':
      return `  ✗ ${label} missing in Figma (code value: ${finding.code.value}) → add to Figma`;
    case 'missing-in-code':
      return `  ✗ ${label} extra in Figma (figma value: ${finding.figma.value}) → remove from Figma`;
    default:
      return `  ✗ ${label} unknown finding kind: ${finding.kind}`;
  }
}

function fail(message) {
  process.stderr.write(`audit-figma-parity: ${message}\n`);
  process.exit(EXIT_CONFIG);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.category) {
    const supported = Object.keys(CATEGORIES).join(', ');
    const pending = Object.entries(PENDING_CATEGORIES)
      .map(([cat, issue]) => `${cat} (${issue})`)
      .join(', ');
    fail(
      `--category <name> is required\n  supported: ${supported}\n  pending:   ${pending}`
    );
  }

  if (args.category in PENDING_CATEGORIES) {
    fail(
      `--category ${args.category} is not yet supported. Tracked in ${PENDING_CATEGORIES[args.category]}.`
    );
  }

  const config = CATEGORIES[args.category];
  if (!config) {
    fail(`unknown category "${args.category}"`);
  }

  if (!fs.existsSync(args.snapshot)) {
    fail(
      `snapshot file not found: ${args.snapshot}\n  Refresh the snapshot via the figma MCP — see .claude/rules/figma.md.`
    );
  }

  const snapshot = readTokenFile(args.snapshot);
  const snapshotSubtree = snapshot[args.category];
  if (!snapshotSubtree) {
    fail(
      `snapshot has no "${args.category}" subtree. Refresh the snapshot or check the category name.`
    );
  }

  const codeData = readTokenFile(config.file);
  const findings = diffTokenTrees(codeData, snapshotSubtree);

  const meta = snapshotSubtree.$meta;
  const lines = [];
  lines.push(`─── audit-figma-parity --category ${args.category} ───`);
  if (meta?.capturedAt) {
    const source = meta.figmaFileName ? ` (${meta.figmaFileName})` : '';
    lines.push(`  Snapshot: ${meta.capturedAt}${source}`);
  }
  if (findings.length === 0) {
    lines.push('  ✓ no drift');
    lines.push('');
    lines.push(`Audited ${args.category} — 0 findings.`);
    process.stdout.write(lines.join('\n') + '\n');
    process.exit(EXIT_OK);
  }

  for (const finding of findings) {
    lines.push(formatFinding(finding));
  }
  lines.push('');
  lines.push(`Audited ${args.category} — ${findings.length} drift finding(s).`);
  lines.push('Canonical rule: code wins. Push code values to Figma manually.');
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(EXIT_DRIFT);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
