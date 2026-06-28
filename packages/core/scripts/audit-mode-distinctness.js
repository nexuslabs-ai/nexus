import fs from 'node:fs';
import path from 'node:path';

import {
  comparePairs,
  DISTINCTNESS_ALLOWLIST,
  findViolations,
  leafValues,
} from './lib/mode-distinctness.js';
import { KEY_PARITY_MODE_FAMILY_CONFIGS } from './lib/token-mode-manifest.js';
import { discoverFamilyModes } from './validate-spacing-modes.js';

function readMode(config, mode) {
  const filePath = path.join(config.dir, config.fileName(mode));
  return leafValues(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

function findingsForConfig(config) {
  const modes = discoverFamilyModes(config);
  const leavesByMode = Object.fromEntries(
    modes.map((mode) => [mode, readMode(config, mode)])
  );
  return comparePairs(config.name, leavesByMode);
}

const allFindings = KEY_PARITY_MODE_FAMILY_CONFIGS.flatMap(findingsForConfig);

for (const finding of allFindings) {
  const tag =
    finding.differingLeaves === 0
      ? 'DUP '
      : `${String(finding.differingLeaves).padStart(3)} `;
  const diffs = finding.firstDiffs.length
    ? `  [${finding.firstDiffs.join(', ')}]`
    : '';
  console.log(`${tag} ${finding.family}: ${finding.a} vs ${finding.b}${diffs}`);
}

const violations = findViolations(allFindings, DISTINCTNESS_ALLOWLIST);
if (violations.length) {
  console.error(
    `\n✗ ${violations.length} byte-identical sibling mode pair(s) not on the allowlist:`
  );
  for (const violation of violations) {
    console.error(`  - ${violation.family}: ${violation.a} == ${violation.b}`);
  }
  process.exit(1);
}

console.log('\n✓ No unintentional byte-identical sibling token-mode pairs.');
