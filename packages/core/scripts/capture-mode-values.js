import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKEN_MODE_FAMILIES } from './lib/token-mode-manifest.js';
import { leafPathsOf } from './validate-spacing-modes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(
  __dirname,
  '__tests__',
  '__fixtures__',
  'pre-rename-mode-values.json'
);

export function leafValues(data) {
  const values = {};
  for (const leafPath of leafPathsOf(data)) {
    values[leafPath] = leafPath
      .split('.')
      .reduce((node, key) => node[key], data).$value;
  }
  return values;
}

export function captureModeValues() {
  const result = {};
  for (const { family, dir, modePattern } of TOKEN_MODE_FAMILIES) {
    const files = fs.readdirSync(dir).sort();
    for (const file of files) {
      const match = file.match(modePattern);
      if (!match) continue;

      const codename = match[1];
      const variant = match[2] ? `-${match[2]}` : '';
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      result[`${family}.${codename}${variant}`] = leafValues(data);
    }
  }
  return result;
}

// Main-guard the write: importing this module (e.g. to reuse `leafValues`)
// must never overwrite the committed oracle — after the cutover it would
// recapture the renamed files and silently invalidate the preservation proof.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = captureModeValues();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
  console.log(
    `Captured ${Object.keys(result).length} mode value-sets -> ${OUT}`
  );
}
