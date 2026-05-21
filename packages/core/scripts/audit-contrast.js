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

const BASE_PALETTES = ['slate', 'neutral', 'zinc', 'gray', 'stone'];
const BRANDS = ['blue', 'gray', 'neutral', 'slate', 'stone'];
const THEMES = ['light', 'dark'];

// APCA tiers: body 75 (fluent reading), ui 60 (button/badge labels),
// incidental 45 (muted text, dividers, disabled state).
// See https://git.apcacontrast.com/documentation/APCAeasyIntro.html
const BASE_PAIRS = [
  { text: 'foreground', bg: 'background', minLc: 75, tier: 'body' },
  { text: 'muted-foreground', bg: 'muted', minLc: 45, tier: 'incidental' },
  {
    text: 'muted-light-foreground',
    bg: 'muted-light',
    minLc: 45,
    tier: 'incidental',
  },
  {
    text: 'disabled-foreground',
    bg: 'disabled',
    minLc: 45,
    tier: 'incidental',
  },
  { text: 'error.foreground', bg: 'error.background', minLc: 60, tier: 'ui' },
  {
    text: 'success.foreground',
    bg: 'success.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    text: 'warning.foreground',
    bg: 'warning.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    text: 'information.foreground',
    bg: 'information.background',
    minLc: 60,
    tier: 'ui',
  },
];

const BRAND_PAIRS = [
  {
    text: 'primary.foreground',
    bg: 'primary.background',
    minLc: 60,
    tier: 'ui',
  },
  {
    text: 'secondary.foreground',
    bg: 'secondary.background',
    minLc: 60,
    tier: 'ui',
  },
];

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

function formatLine(passed, label, lc, minLc) {
  const mark = passed ? '✓' : '✗';
  const lcStr = lc.toFixed(1).padStart(6);
  const tail = passed ? `   (≥ ${minLc})` : `   FAIL (< ${minLc})`;
  return `  ${mark} ${label.padEnd(48)} Lc ${lcStr}${tail}`;
}

function auditFile(filePath, pairs, primitiveMap) {
  const fileData = readTokenFile(filePath);
  const fileName = path.basename(filePath);
  const lines = [];
  const results = [];

  for (const { text, bg, minLc } of pairs) {
    const textValue = findTokenValue(fileData, text);
    const bgValue = findTokenValue(fileData, bg);
    if (textValue === undefined || bgValue === undefined) {
      const missing = [
        textValue === undefined ? text : null,
        bgValue === undefined ? bg : null,
      ]
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `audit-contrast: ${fileName} is missing declared pair token(s): ${missing}`
      );
    }

    const textInts = resolveToSrgbInts(textValue, primitiveMap);
    const bgInts = resolveToSrgbInts(bgValue, primitiveMap);
    const lc = computeLc(textInts, bgInts);
    const passed = Math.abs(lc) >= minLc;

    results.push({ passed });
    lines.push(formatLine(passed, `${text} ↔ ${bg}`, lc, minLc));
  }

  return { fileName, lines, results };
}

function main() {
  const primitiveMap = buildPrimitiveHexMap();
  const sections = [];
  let totalPairs = 0;
  let passCount = 0;
  let failCount = 0;

  for (const palette of BASE_PALETTES) {
    for (const theme of THEMES) {
      const filePath = path.join(SEMANTIC_DIR, `base-${palette}-${theme}.json`);
      if (!fs.existsSync(filePath)) continue;
      const section = auditFile(filePath, BASE_PAIRS, primitiveMap);
      sections.push(section);
      for (const result of section.results) {
        totalPairs += 1;
        if (result.passed) passCount += 1;
        else failCount += 1;
      }
    }
  }

  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      const filePath = path.join(SEMANTIC_DIR, `brands-${brand}-${theme}.json`);
      if (!fs.existsSync(filePath)) continue;
      const section = auditFile(filePath, BRAND_PAIRS, primitiveMap);
      sections.push(section);
      for (const result of section.results) {
        totalPairs += 1;
        if (result.passed) passCount += 1;
        else failCount += 1;
      }
    }
  }

  const output = [];
  for (const section of sections) {
    output.push(`─── ${section.fileName} ───`);
    output.push(...section.lines);
    output.push('');
  }
  output.push(
    `Checked ${totalPairs} pairs — ${passCount} passed, ${failCount} failed.`
  );

  process.stdout.write(output.join('\n') + '\n');
  process.exit(failCount === 0 ? 0 : 1);
}

main();
