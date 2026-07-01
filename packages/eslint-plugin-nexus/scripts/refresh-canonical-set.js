#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'core',
  'tokens',
  'semantic'
);
const OUTPUT_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  'canonical-step-set.json'
);

function collectPxValues(node, out) {
  if (!node || typeof node !== 'object') return;
  if (
    node.$type === 'dimension' &&
    node.$value &&
    typeof node.$value === 'object' &&
    node.$value.unit === 'px' &&
    typeof node.$value.value === 'number'
  ) {
    out.add(node.$value.value);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    collectPxValues(value, out);
  }
}

function computeUnion() {
  const files = fs
    .readdirSync(SEMANTIC_DIR)
    .filter((name) => /^spacing-[a-z]+\.json$/.test(name))
    .sort();

  if (files.length === 0) {
    process.stderr.write(
      `Error: no spacing-*.json files found in ${SEMANTIC_DIR}\n`
    );
    process.exit(2);
  }

  const union = new Set();
  for (const name of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(SEMANTIC_DIR, name), 'utf8')
    );
    collectPxValues(data, union);
  }
  return { files, sorted: [...union].sort((a, b) => a - b) };
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function main() {
  const check = process.argv.includes('--check');
  const { files, sorted } = computeUnion();

  const existing = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    : null;

  if (check) {
    if (!existing) {
      process.stderr.write(
        `Error: ${OUTPUT_PATH} is missing. Run \`pnpm --filter @nexus_ds/eslint-plugin refresh:canonical-set\` and commit the result.\n`
      );
      process.exit(1);
    }
    const committed = Array.isArray(existing.values) ? existing.values : [];
    if (arraysEqual(committed, sorted)) {
      process.stdout.write(
        `✓ canonical-step-set.json matches the live union (${sorted.length} values across ${files.length} modes).\n`
      );
      process.exit(0);
    }
    const committedSet = new Set(committed);
    const liveSet = new Set(sorted);
    const missing = sorted.filter((n) => !committedSet.has(n));
    const extra = committed.filter((n) => !liveSet.has(n));
    process.stderr.write(
      `Error: canonical-step-set.json is stale.\n` +
        (missing.length
          ? `  missing from committed: ${missing.join(', ')}\n`
          : '') +
        (extra.length
          ? `  no longer in any mode file: ${extra.join(', ')}\n`
          : '') +
        `Refresh via \`pnpm --filter @nexus_ds/eslint-plugin refresh:canonical-set\` and commit the result.\n`
    );
    process.exit(1);
  }

  const out = {
    $comment: existing?.$comment ?? defaultComment(),
    values: sorted,
  };

  const next = JSON.stringify(out, null, 2) + '\n';
  const prev = existing ? JSON.stringify(existing, null, 2) + '\n' : null;

  if (prev === next) {
    process.stdout.write(
      `✓ canonical-step-set.json is up to date (${sorted.length} values across ${files.length} modes).\n`
    );
    process.exit(0);
  }

  fs.writeFileSync(OUTPUT_PATH, next);
  process.stdout.write(
    `✓ canonical-step-set.json refreshed (${sorted.length} values across ${files.length} modes).\n`
  );
}

function defaultComment() {
  return 'Union of every px value shipped across packages/core/tokens/semantic/spacing-{vega,lyra,maia,mira,nova,luma,sera}.json. Regenerate via `pnpm --filter @nexus_ds/eslint-plugin refresh:canonical-set`. The shipped union may exceed the originally-intended scale; reconciliation tracked separately.';
}

main();
