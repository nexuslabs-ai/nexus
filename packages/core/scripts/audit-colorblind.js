import { simulate } from '@bjornlu/colorblind';
import { differenceEuclidean } from 'culori';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASE_PALETTES } from './lib/palettes.js';
import { hexToSrgbInts } from './lib/perceptual-grid.js';
import { readTokenFile, titleCase } from './utils.js';

// Distance metric is OKLab Euclidean ΔE — not APCA Lc (which #88 originally
// specified). APCA floors contrast at 0 for dark-dark pairs by design (text
// on a dark background is unreadable regardless of actual luminance ratio),
// which produces false positives by the hundred for shade-discrimination
// questions. OKLab ΔE answers the right question — "are these two fills
// distinguishable?" — uniformly across the luminance range.
const oklabDelta = differenceEuclidean('oklab');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(__dirname, '..', 'tokens');
export const PRIMITIVES_FILE = path.join(
  TOKENS_DIR,
  'primitives',
  'color.json'
);

export const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
];

// Grouped because the SVG sections them visually and the cross-status pair
// confusability test only fires for STATUS_PALETTES.
export { BASE_PALETTES };
export const STATUS_PALETTES = ['red', 'green', 'amber', 'blue'];
export const CHART_PALETTES = ['teal', 'lime', 'orange', 'rose', 'indigo'];
export const ALL_PALETTES = [
  ...BASE_PALETTES,
  ...STATUS_PALETTES,
  ...CHART_PALETTES,
];

// 'normal' is the unfiltered baseline; the three deficiencies follow
// @bjornlu/colorblind's strings.
export const VISION_TYPES = [
  'normal',
  'deuteranopia',
  'protanopia',
  'tritanopia',
];

// OKLab ΔE ≈ 0.02 is the commonly cited just-noticeable-difference for
// perceptually-uniform color spaces. Below that, two shades in the simulated
// space are effectively indistinguishable.
export const ADJACENT_CONFUSABLE_DELTA_E = 0.02;

function unorderedPairs(items) {
  const pairs = [];
  for (let i = 0; i < items.length - 1; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}

// Cross-status pair test fires at shade 600 — the brand `-background` tier
// referenced by error/success/warning/information in both themes. Derived as
// the 4-choose-2 of STATUS_PALETTES so adding a status palette can't silently
// miss a pair.
export const STATUS_PAIRS_600 = unorderedPairs(STATUS_PALETTES);
const STATUS_PAIR_SHADE = '600';

export function buildPalettesSrgb(primitives) {
  const result = {};
  for (const palette of ALL_PALETTES) {
    const block = primitives[palette];
    if (!block) {
      throw new Error(
        `audit-colorblind: palette "${palette}" missing from primitives`
      );
    }
    const shades = {};
    for (const shade of SHADES) {
      const entry = block[shade];
      if (!entry || typeof entry.$value !== 'string') {
        throw new Error(
          `audit-colorblind: ${palette}.${shade} missing or non-string in primitives`
        );
      }
      shades[shade] = hexToSrgbInts(entry.$value, shade);
    }
    result[palette] = shades;
  }
  return result;
}

export function simulateRgb(rgbInts, visionType) {
  if (visionType === 'normal') return rgbInts;
  const sim = simulate(
    { r: rgbInts[0], g: rgbInts[1], b: rgbInts[2] },
    visionType
  );
  return [sim.r, sim.g, sim.b];
}

export function simulatePalette(shades, visionType) {
  const result = {};
  for (const shade of SHADES) {
    result[shade] = simulateRgb(shades[shade], visionType);
  }
  return result;
}

function rgbIntsToCulori(rgbInts) {
  return {
    mode: 'rgb',
    r: rgbInts[0] / 255,
    g: rgbInts[1] / 255,
    b: rgbInts[2] / 255,
  };
}

export function computeDeltaE(rgbIntsA, rgbIntsB) {
  return oklabDelta(rgbIntsToCulori(rgbIntsA), rgbIntsToCulori(rgbIntsB));
}

export function findConfusableAdjacent(
  simulatedShades,
  palette,
  visionType,
  threshold = ADJACENT_CONFUSABLE_DELTA_E
) {
  const findings = [];
  for (let i = 0; i < SHADES.length - 1; i += 1) {
    const a = SHADES[i];
    const b = SHADES[i + 1];
    const deltaE = computeDeltaE(simulatedShades[a], simulatedShades[b]);
    if (deltaE < threshold) {
      findings.push({
        palette,
        visionType,
        shadeA: a,
        shadeB: b,
        deltaE,
        label: `${palette}.${a} ↔ ${palette}.${b}`,
      });
    }
  }
  return findings;
}

export function findStatusPairConfusable(
  simulatedPalettes,
  visionType,
  threshold = ADJACENT_CONFUSABLE_DELTA_E
) {
  const findings = [];
  for (const [a, b] of STATUS_PAIRS_600) {
    const deltaE = computeDeltaE(
      simulatedPalettes[a][STATUS_PAIR_SHADE],
      simulatedPalettes[b][STATUS_PAIR_SHADE]
    );
    if (deltaE < threshold) {
      findings.push({
        visionType,
        paletteA: a,
        paletteB: b,
        shade: STATUS_PAIR_SHADE,
        deltaE,
        label: `${a}.${STATUS_PAIR_SHADE} ↔ ${b}.${STATUS_PAIR_SHADE}`,
      });
    }
  }
  return findings;
}

function formatFindingLine(finding) {
  return `  ✗ ${finding.label.padEnd(38)} ΔE ${finding.deltaE.toFixed(4)}   (< ${ADJACENT_CONFUSABLE_DELTA_E})`;
}

function buildSummary(adjacentFindings, statusFindings) {
  const lines = [];
  const adjacentByVision = new Map();
  for (const f of adjacentFindings) {
    if (!adjacentByVision.has(f.visionType))
      adjacentByVision.set(f.visionType, []);
    adjacentByVision.get(f.visionType).push(f);
  }
  const statusByVision = new Map();
  for (const f of statusFindings) {
    if (!statusByVision.has(f.visionType)) statusByVision.set(f.visionType, []);
    statusByVision.get(f.visionType).push(f);
  }

  for (const visionType of VISION_TYPES) {
    if (visionType === 'normal') continue;
    lines.push(
      `─── ${titleCase(visionType)} — adjacent-shade collapse (OKLab ΔE < ${ADJACENT_CONFUSABLE_DELTA_E}) ───`
    );
    const adj = adjacentByVision.get(visionType) ?? [];
    if (adj.length === 0) {
      lines.push('  ✓ no adjacent-shade collapse');
    } else {
      for (const f of adj) lines.push(formatFindingLine(f));
    }
    lines.push('');
    lines.push(
      `─── ${titleCase(visionType)} — status pair confusability at shade ${STATUS_PAIR_SHADE} (OKLab ΔE < ${ADJACENT_CONFUSABLE_DELTA_E}) ───`
    );
    const sts = statusByVision.get(visionType) ?? [];
    if (sts.length === 0) {
      lines.push('  ✓ no status-pair confusability');
    } else {
      for (const f of sts) lines.push(formatFindingLine(f));
    }
    lines.push('');
  }

  const total = adjacentFindings.length + statusFindings.length;
  lines.push(
    `Checked ${ALL_PALETTES.length} palettes × ${SHADES.length} shades × ${VISION_TYPES.length - 1} deficiencies — ${total} finding(s).`
  );
  return lines.join('\n') + '\n';
}

export function buildSimulatedByVision(primitives) {
  const palettesSrgb = buildPalettesSrgb(primitives);
  const simulatedByVision = {};
  for (const visionType of VISION_TYPES) {
    simulatedByVision[visionType] = {};
    for (const palette of ALL_PALETTES) {
      simulatedByVision[visionType][palette] = simulatePalette(
        palettesSrgb[palette],
        visionType
      );
    }
  }
  return simulatedByVision;
}

function main() {
  const simulatedByVision = buildSimulatedByVision(
    readTokenFile(PRIMITIVES_FILE)
  );

  const adjacentFindings = [];
  for (const visionType of VISION_TYPES) {
    if (visionType === 'normal') continue;
    for (const palette of ALL_PALETTES) {
      adjacentFindings.push(
        ...findConfusableAdjacent(
          simulatedByVision[visionType][palette],
          palette,
          visionType
        )
      );
    }
  }

  const statusFindings = [];
  for (const visionType of VISION_TYPES) {
    if (visionType === 'normal') continue;
    statusFindings.push(
      ...findStatusPairConfusable(simulatedByVision[visionType], visionType)
    );
  }

  process.stdout.write(buildSummary(adjacentFindings, statusFindings));
  process.exit(adjacentFindings.length + statusFindings.length === 0 ? 0 : 1);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
