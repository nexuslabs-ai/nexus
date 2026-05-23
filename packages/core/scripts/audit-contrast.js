import { APCAcontrast, sRGBtoY } from 'apca-w3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hexToSrgbInts, isPaletteShadeKey } from './lib/perceptual-grid.js';
import { extractTokens, readTokenFile } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(__dirname, '..', 'tokens');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');
const PRIMITIVES_FILE = path.join(TOKENS_DIR, 'primitives', 'color.json');
const FOCUS_PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives', 'focus');

const BASE_PALETTES = ['slate', 'neutral', 'zinc', 'gray', 'stone'];
const BRANDS = ['blue', 'gray', 'neutral', 'slate', 'stone'];
const THEMES = ['light', 'dark'];

// APCA tiers: body 75 (fluent reading), ui 60 (button/badge labels),
// incidental 45 (muted text, dividers, disabled state).
// See https://git.apcacontrast.com/documentation/APCAeasyIntro.html
const BASE_PAIRS = [
  { fg: 'foreground', bg: 'background', minLc: 75, tier: 'body' },
  { fg: 'muted-foreground', bg: 'muted', minLc: 45, tier: 'incidental' },
  {
    fg: 'muted-light-foreground',
    bg: 'muted-light',
    minLc: 45,
    tier: 'incidental',
  },
  {
    fg: 'disabled-foreground',
    bg: 'disabled',
    minLc: 45,
    tier: 'incidental',
  },
  { fg: 'error.foreground', bg: 'error.background', minLc: 60, tier: 'ui' },
  {
    fg: 'error.subtle-foreground',
    bg: 'error.subtle',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'success.foreground',
    bg: 'success.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'success.subtle-foreground',
    bg: 'success.subtle',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'warning.foreground',
    bg: 'warning.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'warning.subtle-foreground',
    bg: 'warning.subtle',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'information.foreground',
    bg: 'information.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'information.subtle-foreground',
    bg: 'information.subtle',
    minLc: 60,
    tier: 'ui',
  },
];

const BRAND_PAIRS = [
  {
    fg: 'primary.foreground',
    bg: 'primary.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'primary.subtle-foreground',
    bg: 'primary.subtle',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'secondary.foreground',
    bg: 'secondary.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'secondary.subtle-foreground',
    bg: 'secondary.subtle',
    minLc: 60,
    tier: 'ui',
  },
];

// Categorical chart series must be readable as filled marks on every surface
// they render on — both the page canvas (`background`) and raised containers
// (`container`, since charts often live inside cards). UI tier (Lc 60) treats
// chart marks like labels rather than fluent reading text.
const CHART_SURFACES = ['background', 'container'];

// Focus indicators target WCAG 2.2 SC 1.4.11 (3:1 non-text contrast),
// which APCA encodes as the incidental tier (Lc 45). Pair against every
// base palette surface focusable controls actually render on per theme;
// the focus color is theme-aware and loaded from primitives/focus/.
// `muted` and `disabled` are intentionally excluded — they are non-focusable
// fills (de-emphasised text backgrounds and disabled-state backdrops).
const FOCUS_SURFACES = ['background', 'container', 'popover'];
const FOCUS_COLORS = ['color.default', 'color.error'];
const FOCUS_PAIRS = FOCUS_COLORS.flatMap((fg) =>
  FOCUS_SURFACES.map((bg) => ({ fg, bg, minLc: 45, tier: 'incidental' }))
);

const REF_RE = /^\{([^}]+)\}$/;

function buildPrimitiveHexMap() {
  const file = readTokenFile(PRIMITIVES_FILE);
  const tokens = extractTokens(file);
  const map = new Map();
  for (const token of tokens) {
    map.set(token.path.join('.'), {
      path: token.path,
      value: token.value,
    });
  }
  return map;
}

function resolveToSrgbInts(value, primitiveMap) {
  if (typeof value !== 'string') {
    throw new Error(
      `audit-contrast: expected string color value, got ${typeof value}`
    );
  }

  const refMatch = value.match(REF_RE);
  if (refMatch) {
    const refPath = refMatch[1];
    const primitive = primitiveMap.get(refPath);
    if (!primitive) {
      throw new Error(`audit-contrast: unresolved reference "${value}"`);
    }
    const shade = primitive.path[primitive.path.length - 1];
    return hexToSrgbInts(
      primitive.value,
      isPaletteShadeKey(shade) ? shade : undefined
    );
  }

  if (value.startsWith('#')) {
    return hexToSrgbInts(value);
  }

  throw new Error(`audit-contrast: unrecognized color value "${value}"`);
}

function findTokenValue(fileData, tokenPath) {
  const segments = tokenPath.split('.');
  let cursor = fileData;
  for (const segment of segments) {
    if (cursor && typeof cursor === 'object' && segment in cursor) {
      cursor = cursor[segment];
    } else {
      return undefined;
    }
  }
  return cursor && typeof cursor === 'object' && '$value' in cursor
    ? cursor.$value
    : undefined;
}

function computeLc(textInts, bgInts) {
  const lc = APCAcontrast(sRGBtoY(textInts), sRGBtoY(bgInts));
  return typeof lc === 'number' ? lc : Number(lc);
}

function formatLine(passed, label, lc, minLc, tier) {
  const mark = passed ? '✓' : '✗';
  const lcStr = lc.toFixed(1).padStart(6);
  const tail = passed
    ? `   (≥ ${minLc}, ${tier})`
    : `   FAIL (< ${minLc}, ${tier})`;
  return `  ${mark} ${label.padEnd(48)} Lc ${lcStr}${tail}`;
}

function auditPairs(fgData, bgData, fileName, pairs, primitiveMap) {
  const lines = [];
  const results = [];

  for (const pair of pairs) {
    const { fg, bg, minLc, tier } = pair;
    const fgValue = findTokenValue(fgData, fg);
    const bgValue = findTokenValue(bgData, bg);
    if (fgValue === undefined || bgValue === undefined) {
      const missing = [
        fgValue === undefined ? fg : null,
        bgValue === undefined ? bg : null,
      ]
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `audit-contrast: ${fileName} is missing declared pair token(s): ${missing}`
      );
    }

    const fgInts = resolveToSrgbInts(fgValue, primitiveMap);
    const bgInts = resolveToSrgbInts(bgValue, primitiveMap);
    const lc = computeLc(fgInts, bgInts);
    const passed = Math.abs(lc) >= minLc;

    results.push({ passed });
    lines.push(formatLine(passed, `${fg} ↔ ${bg}`, lc, minLc, tier));
  }

  return { fileName, lines, results };
}

function auditCrossFileLoop({
  themes,
  palettes,
  pairs,
  fgFile,
  fgLabel,
  primitiveMap,
}) {
  const sections = [];
  for (const theme of themes) {
    const fgFilePath = fgFile(theme);
    if (!fs.existsSync(fgFilePath)) continue;
    const fgData = readTokenFile(fgFilePath);
    const fgDisplayLabel = fgLabel(theme);
    for (const palette of palettes) {
      const bgFilePath = path.join(
        SEMANTIC_DIR,
        `base-${palette}-${theme}.json`
      );
      if (!fs.existsSync(bgFilePath)) continue;
      const bgData = readTokenFile(bgFilePath);
      sections.push(
        auditPairs(
          fgData,
          bgData,
          `base-${palette}-${theme}.json ↔ ${fgDisplayLabel}`,
          pairs,
          primitiveMap
        )
      );
    }
  }
  return sections;
}

function main() {
  const primitiveMap = buildPrimitiveHexMap();
  const sections = [];

  for (const palette of BASE_PALETTES) {
    for (const theme of THEMES) {
      const filePath = path.join(SEMANTIC_DIR, `base-${palette}-${theme}.json`);
      if (!fs.existsSync(filePath)) continue;
      const fileData = readTokenFile(filePath);
      sections.push(
        auditPairs(
          fileData,
          fileData,
          path.basename(filePath),
          BASE_PAIRS,
          primitiveMap
        )
      );
    }
  }

  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      const filePath = path.join(SEMANTIC_DIR, `brands-${brand}-${theme}.json`);
      if (!fs.existsSync(filePath)) continue;
      const fileData = readTokenFile(filePath);
      sections.push(
        auditPairs(
          fileData,
          fileData,
          path.basename(filePath),
          BRAND_PAIRS,
          primitiveMap
        )
      );
    }
  }

  sections.push(
    ...auditCrossFileLoop({
      themes: THEMES,
      palettes: BASE_PALETTES,
      pairs: FOCUS_PAIRS,
      fgFile: (theme) =>
        path.join(FOCUS_PRIMITIVES_DIR, `focus-default-${theme}.json`),
      fgLabel: (theme) => `focus-default-${theme}.json`,
      primitiveMap,
    })
  );

  const chartLightFile = path.join(
    SEMANTIC_DIR,
    'chart-categorical-default-light.json'
  );
  if (fs.existsSync(chartLightFile)) {
    const categoricalKeys = Object.keys(
      readTokenFile(chartLightFile).chart.categorical
    );
    const chartPairs = categoricalKeys
      .map((key) => `chart.categorical.${key}`)
      .flatMap((fg) =>
        CHART_SURFACES.map((bg) => ({ fg, bg, minLc: 60, tier: 'ui' }))
      );

    sections.push(
      ...auditCrossFileLoop({
        themes: THEMES,
        palettes: BASE_PALETTES,
        pairs: chartPairs,
        fgFile: (theme) =>
          path.join(SEMANTIC_DIR, `chart-categorical-default-${theme}.json`),
        fgLabel: (theme) => `chart-categorical-default-${theme}.json`,
        primitiveMap,
      })
    );
  }

  let totalPairs = 0;
  let passCount = 0;
  let failCount = 0;
  const output = [];
  for (const section of sections) {
    output.push(`─── ${section.fileName} ───`);
    output.push(...section.lines);
    output.push('');
    for (const result of section.results) {
      totalPairs += 1;
      if (result.passed) passCount += 1;
      else failCount += 1;
    }
  }
  output.push(
    `Checked ${totalPairs} pairs — ${passCount} passed, ${failCount} failed.`
  );

  process.stdout.write(output.join('\n') + '\n');
  process.exit(failCount === 0 ? 0 : 1);
}

main();
