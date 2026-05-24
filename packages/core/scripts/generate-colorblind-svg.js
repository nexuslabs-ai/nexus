import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ALL_PALETTES,
  buildSimulatedByVision,
  PRIMITIVES_FILE,
  SHADES,
  VISION_TYPES,
} from './audit-colorblind.js';
import { readTokenFile, titleCase } from './utils.js';

// Renders and writes the committed color-blind swatch grid. Kept separate from
// audit-colorblind.js so the audit stays a pure stdout+exit-code gate (every
// sibling audit is) while this generator owns the SVG surface end-to-end — the
// rendering and the file write — freshness-gated in CI like the other generated
// token outputs. Output is deterministic integer sRGB, so a regen +
// `git status --porcelain` check catches drift.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
export const SVG_OUT = path.join(DOCS_DIR, 'color-math-colorblind.svg');

const CELL = 22;
const GAP = 2;
const LABEL_WIDTH = 70;
const HEADER_HEIGHT = 22;
const SECTION_GAP = 24;
const SECTION_TITLE_HEIGHT = 26;
const PADDING = 16;

function rgbToHex(rgbInts) {
  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(rgbInts[0])}${hex(rgbInts[1])}${hex(rgbInts[2])}`;
}

function svgEscape(value) {
  return String(value).replace(
    /[<>&"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]
  );
}

export function renderSvg(simulatedByVision) {
  const colsWidth = SHADES.length * CELL + (SHADES.length - 1) * GAP;
  const rowsHeight =
    ALL_PALETTES.length * CELL + (ALL_PALETTES.length - 1) * GAP;
  const sectionWidth = PADDING + LABEL_WIDTH + colsWidth + PADDING;
  const sectionHeight = SECTION_TITLE_HEIGHT + HEADER_HEIGHT + rowsHeight;
  const totalHeight =
    PADDING +
    VISION_TYPES.length * sectionHeight +
    (VISION_TYPES.length - 1) * SECTION_GAP +
    PADDING;

  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sectionWidth} ${totalHeight}" width="${sectionWidth}" height="${totalHeight}" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif">`
  );
  parts.push(
    '<style>text{font-size:11px;fill:#0f172a}.section-title{font-size:13px;font-weight:600}.shade-label{font-size:10px;fill:#475569}.palette-label{font-size:11px;text-anchor:end}</style>'
  );
  parts.push(
    `<rect width="${sectionWidth}" height="${totalHeight}" fill="#ffffff"/>`
  );

  let yCursor = PADDING;
  for (const visionType of VISION_TYPES) {
    const sectionLabel =
      visionType === 'normal' ? 'Normal vision' : titleCase(visionType);
    parts.push(
      `<text class="section-title" x="${PADDING}" y="${yCursor + 16}">${svgEscape(sectionLabel)}</text>`
    );

    const headerY = yCursor + SECTION_TITLE_HEIGHT;
    const gridX = PADDING + LABEL_WIDTH;

    for (let i = 0; i < SHADES.length; i += 1) {
      const x = gridX + i * (CELL + GAP) + CELL / 2;
      parts.push(
        `<text class="shade-label" x="${x}" y="${headerY + 14}" text-anchor="middle">${SHADES[i]}</text>`
      );
    }

    for (let r = 0; r < ALL_PALETTES.length; r += 1) {
      const palette = ALL_PALETTES[r];
      const rowY = headerY + HEADER_HEIGHT + r * (CELL + GAP);
      parts.push(
        `<text class="palette-label" x="${PADDING + LABEL_WIDTH - 6}" y="${rowY + CELL / 2 + 4}">${svgEscape(palette)}</text>`
      );
      const palShades = simulatedByVision[visionType][palette];
      for (let i = 0; i < SHADES.length; i += 1) {
        const x = gridX + i * (CELL + GAP);
        const hex = rgbToHex(palShades[SHADES[i]]);
        parts.push(
          `<rect x="${x}" y="${rowY}" width="${CELL}" height="${CELL}" fill="${hex}" stroke="#e2e8f0" stroke-width="0.5"><title>${palette}.${SHADES[i]} — ${hex}</title></rect>`
        );
      }
    }

    yCursor += sectionHeight + SECTION_GAP;
  }

  parts.push('</svg>');
  parts.push('');
  return parts.join('\n');
}

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
