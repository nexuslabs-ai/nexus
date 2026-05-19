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

// APCA tiers: 75 body text, 60 UI labels, 45 muted/incidental.
// See https://git.apcacontrast.com/documentation/APCAeasyIntro.html
const BASE_PAIRS = [
  ['foreground', 'background', 75],
  ['muted-foreground', 'muted', 45],
];

const BRAND_PAIRS = [
  ['primary.foreground', 'primary.background', 60],
  ['secondary.foreground', 'secondary.background', 60],
  ['error.foreground', 'error.background', 60],
  ['success.foreground', 'success.background', 60],
  ['warning.foreground', 'warning.background', 60],
  ['information.foreground', 'information.background', 60],
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
  if (typeof value !== 'string') return null;

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

  for (const [textKey, bgKey, minLc] of pairs) {
    const textValue = findTokenValue(fileData, textKey);
    const bgValue = findTokenValue(fileData, bgKey);
    if (textValue === undefined || bgValue === undefined) continue;

    const textInts = resolveToSrgbInts(textValue, primitiveMap);
    const bgInts = resolveToSrgbInts(bgValue, primitiveMap);
    const lc = computeLc(textInts, bgInts);
    const passed = Math.abs(lc) >= minLc;

    results.push({ passed });
    lines.push(formatLine(passed, `${textKey} ↔ ${bgKey}`, lc, minLc));
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
