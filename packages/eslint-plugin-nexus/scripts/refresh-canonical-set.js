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

function main() {
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
  const sorted = [...union].sort((a, b) => a - b);

  const existing = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    : null;

  const out = {
    $comment: existing?.$comment ?? defaultComment(),
    unit: 'px',
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
  return 'Union of every px value shipped across packages/core/tokens/semantic/spacing-{vega,lyra,maia,mira,nova,luma,sera}.json. Regenerate via `yarn workspace @nexus/eslint-plugin refresh:canonical-set`.';
}

main();
