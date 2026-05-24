import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  buildSimulatedByVision,
  PRIMITIVES_FILE,
  renderSvg,
  SVG_OUT,
} from './audit-colorblind.js';
import { readTokenFile } from './utils.js';

// Writes the committed color-blind swatch grid. Kept separate from
// audit-colorblind.js so the audit stays a pure stdout+exit-code gate (every
// sibling audit is) and this generator owns the file write — freshness-gated
// in CI like the other generated token outputs. Output is deterministic
// integer sRGB, so a regen + `git status --porcelain` check catches drift.
export function generateColorblindSvg() {
  const simulatedByVision = buildSimulatedByVision(
    readTokenFile(PRIMITIVES_FILE)
  );
  fs.writeFileSync(SVG_OUT, renderSvg(simulatedByVision));
  return SVG_OUT;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  process.stdout.write(`Wrote ${generateColorblindSvg()}\n`);
}
