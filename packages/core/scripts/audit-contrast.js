import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { converter, parse } from 'culori';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASE_PALETTES } from './lib/palettes.js';
import { hexToSrgbInts, isPaletteShadeKey } from './lib/perceptual-grid.js';
import { extractTokens, readTokenFile } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(__dirname, '..', 'tokens');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');
const PRIMITIVES_FILE = path.join(TOKENS_DIR, 'primitives', 'color.json');
const FOCUS_PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives', 'focus');

const THEMES = ['light', 'dark'];
const toRgb = converter('rgb');

// APCA tiers: body 75 (fluent reading), ui 60 (button/badge labels),
// incidental 45 (muted text, dividers, disabled state).
// See https://git.apcacontrast.com/documentation/APCAeasyIntro.html
const BASE_PAIRS = [
  { fg: 'foreground', bg: 'background', minLc: 75, tier: 'body' },
  { fg: 'foreground', bg: 'background-hover', minLc: 60, tier: 'ui' },
  { fg: 'foreground', bg: 'muted', minLc: 60, tier: 'ui' },
  { fg: 'muted-foreground', bg: 'muted', minLc: 45, tier: 'incidental' },
  {
    fg: 'muted-foreground-subtle',
    bg: 'muted',
    minLc: 45,
    tier: 'incidental',
  },
  {
    fg: 'disabled-foreground',
    bg: 'disabled',
    minLc: 45,
    tier: 'incidental',
  },
  // Raised/elevated surfaces and their roving-focus row tint.
  {
    fg: 'popover-foreground',
    bg: 'popover',
    minLc: 75,
    tier: 'body',
  },
  {
    fg: 'popover-foreground',
    bg: 'popover-hover',
    minLc: 60,
    tier: 'ui',
  },
  // Neutral interactive rails and selected states.
  {
    fg: 'foreground',
    bg: 'control-background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'foreground',
    bg: 'control-background-hover',
    minLc: 60,
    tier: 'ui',
  },
  { fg: 'error.foreground', bg: 'error.background', minLc: 60, tier: 'ui' },
  {
    fg: 'error.subtle-foreground',
    bg: 'error.subtle',
    minLc: 60,
    tier: 'ui',
  },
  // Form error label + message render error-coloured text on the neutral form
  // surface (page background or a Card container), not on error.subtle — guard
  // both so the error-text token stays legible there in every base + theme.
  {
    fg: 'error.subtle-foreground',
    bg: 'background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'error.subtle-foreground',
    bg: 'container',
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
  // Nav chrome — UI tier (60) for label text, incidental (45) for the
  // muted helper text. Audits every surface that nav-foreground actually
  // renders on (rest, hover, active) rather than trusting interpolation
  // between rest and the deepest pressed shade.
  {
    fg: 'nav-foreground',
    bg: 'nav-background',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'nav-muted-foreground',
    bg: 'nav-background',
    minLc: 45,
    tier: 'incidental',
  },
  {
    fg: 'nav-foreground',
    bg: 'nav-item-hover',
    minLc: 60,
    tier: 'ui',
  },
  {
    fg: 'nav-foreground',
    bg: 'nav-item-active',
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

// Categorical chart series must be readable as filled marks on the surfaces
// they render on. Under the Model 2 surface hierarchy the page `background`
// is a tinted canvas that sits behind content — charts live inside Card/Panel
// `container` surfaces, not on the raw page — so series are validated on
// `container` only. That is the permanent Model 2 placement contract unless
// charts are deliberately allowed to render directly on the page canvas again.
// UI tier (Lc 60) treats chart marks like labels rather than fluent reading text.
const CHART_SURFACES = ['container'];

// Focus indicators target WCAG 2.2 SC 1.4.11 (3:1 non-text contrast),
// which APCA encodes as the incidental tier (Lc 45). Pair against every
// base palette surface focusable controls actually render on per theme.
// `muted` and `disabled` are intentionally excluded — they are non-focusable
// fills (de-emphasised text backgrounds and disabled-state backdrops).
// Nav surfaces are included because focusable controls inside nav chrome use
// the universal focus ring (no `nav-ring`) — so the offset ring paints
// onto nav-background, nav-item-{hover,active}, or nav-border, all of which
// must clear the gate.
const FOCUS_SURFACES = [
  'background',
  'container',
  'popover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
];
const FOCUS_PRIMARY_PAIRS = FOCUS_SURFACES.map((bg) => ({
  fg: 'primary.subtle-foreground',
  bg,
  minLc: 45,
  tier: 'incidental',
}));
const FOCUS_ERROR_PAIRS = FOCUS_SURFACES.map((bg) => ({
  fg: 'color.error',
  bg,
  minLc: 45,
  tier: 'incidental',
}));

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

// Composite an 8-digit (alpha) hex over an opaque backdrop → opaque sRGB ints.
export function blendAlphaOver(hex8, bgInts) {
  const h = hex8.slice(1);
  const a = parseInt(h.slice(6, 8), 16) / 255;
  const mix = (i) =>
    Math.round(
      parseInt(h.slice(i * 2, i * 2 + 2), 16) * a + bgInts[i] * (1 - a)
    );
  return [mix(0), mix(1), mix(2)];
}

export function resolveToSrgbInts(value, primitiveMap, bgInts) {
  if (typeof value !== 'string') {
    throw new Error(
      `audit-contrast: expected string color value, got ${typeof value}`
    );
  }

  let hex;
  let shade;
  let palette;
  const refMatch = value.match(REF_RE);
  if (refMatch) {
    const primitive = primitiveMap.get(refMatch[1]);
    if (!primitive) {
      throw new Error(`audit-contrast: unresolved reference "${value}"`);
    }
    hex = primitive.value;
    shade = primitive.path[primitive.path.length - 1];
    palette = primitive.path[primitive.path.length - 2];
  } else if (value.startsWith('#')) {
    hex = value;
  } else if (value.startsWith('oklch(')) {
    const rgb = toRgb(parse(value));
    if (!rgb) {
      throw new Error(`audit-contrast: cannot parse OKLCH value "${value}"`);
    }
    const toInt = (channel) =>
      Math.round(Math.max(0, Math.min(1, channel ?? 0)) * 255);
    const alpha = rgb.alpha ?? 1;
    const ints = [toInt(rgb.r), toInt(rgb.g), toInt(rgb.b)];
    if (alpha < 1) {
      if (!bgInts) {
        throw new Error(
          `audit-contrast: alpha colour "${value}" needs a backdrop to composite against`
        );
      }
      return ints.map((channel, index) =>
        Math.round(channel * alpha + bgInts[index] * (1 - alpha))
      );
    }
    return ints;
  } else {
    throw new Error(`audit-contrast: unrecognized color value "${value}"`);
  }

  // Alpha foreground (8-digit hex): composite over the backdrop before scoring.
  if (/^#[0-9a-fA-F]{8}$/.test(hex)) {
    if (!bgInts) {
      throw new Error(
        `audit-contrast: alpha colour "${hex}" needs a backdrop to composite against`
      );
    }
    return blendAlphaOver(hex, bgInts);
  }

  return hexToSrgbInts(
    hex,
    isPaletteShadeKey(shade) ? shade : undefined,
    isPaletteShadeKey(shade) ? palette : undefined
  );
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

export function formatLine(passed, label, lc, minLc, tier) {
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

    // Resolve the backdrop first so an alpha foreground can composite over it.
    const bgInts = resolveToSrgbInts(bgValue, primitiveMap);
    const fgInts = resolveToSrgbInts(fgValue, primitiveMap, bgInts);
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

  for (const theme of THEMES) {
    const filePath = path.join(SEMANTIC_DIR, `theme-default-${theme}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `audit-contrast: expected default semantic file missing: ${path.basename(filePath)}`
      );
    }
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

    for (const palette of BASE_PALETTES) {
      const bgFilePath = path.join(
        SEMANTIC_DIR,
        `base-${palette}-${theme}.json`
      );
      if (!fs.existsSync(bgFilePath)) continue;

      sections.push(
        auditPairs(
          fileData,
          readTokenFile(bgFilePath),
          `${path.basename(bgFilePath)} ↔ ${path.basename(filePath)} focus`,
          FOCUS_PRIMARY_PAIRS,
          primitiveMap
        )
      );
    }
  }

  sections.push(
    ...auditCrossFileLoop({
      themes: THEMES,
      palettes: BASE_PALETTES,
      pairs: FOCUS_ERROR_PAIRS,
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

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
