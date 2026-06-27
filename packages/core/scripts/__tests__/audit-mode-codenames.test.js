import { describe, expect, it } from 'vitest';

import { scanText } from '../audit-mode-codenames.js';
import { MODE_RENAME } from '../lib/mode-rename-map.js';

const spacingCodename = Object.keys(MODE_RENAME.spacing)[0];
const radiusCodename = Object.keys(MODE_RENAME.radius)[0];
const shadowCodename = Object.keys(MODE_RENAME.shadow)[0];
const borderwidthCodename = Object.keys(MODE_RENAME.borderwidth)[0];

describe('audit-mode-codenames scanText', () => {
  it('flags a retired codename in a data-attribute value', () => {
    const hits = scanText('app.tsx', `<div data-style="${spacingCodename}">`);
    expect(hits).toMatchObject([
      {
        file: 'app.tsx',
        line: 1,
        kind: 'data attribute',
        text: `data-style="${spacingCodename}"`,
      },
    ]);
  });

  it('flags a retired codename in a CSS selector', () => {
    const hits = scanText(
      'x.css',
      `[data-radius="${radiusCodename}"] { --r: 0; }`
    );
    expect(hits).toMatchObject([
      {
        file: 'x.css',
        line: 1,
        kind: 'CSS selector',
        text: `[data-radius="${radiusCodename}"]`,
      },
    ]);
  });

  it('flags a retired codename in a /themes/ href', () => {
    const hits = scanText(
      'm.ts',
      `shadow: { mode: '/themes/shadow-${shadowCodename}.css' }`
    );
    expect(hits).toMatchObject([
      {
        file: 'm.ts',
        line: 1,
        kind: 'theme href',
        text: `/themes/shadow-${shadowCodename}.css`,
      },
    ]);
  });

  it('flags multiple load-bearing codenames on the same line', () => {
    const hits = scanText(
      'x.css',
      `[data-style="${spacingCodename}"] [data-borderwidth="${borderwidthCodename}"] {}`
    );
    expect(hits.map((hit) => hit.text)).toEqual([
      `[data-style="${spacingCodename}"]`,
      `[data-borderwidth="${borderwidthCodename}"]`,
    ]);
  });

  it('ignores codenames in prose and comments', () => {
    const hits = scanText(
      'doc.md',
      `The ${spacingCodename} mode was once called ${borderwidthCodename}.`
    );
    expect(hits).toHaveLength(0);
  });

  it('ignores unchanged modes and unrelated words', () => {
    expect(scanText('x.css', '[data-radius="subtle"]')).toHaveLength(0);
    expect(scanText('a.ts', "import sharp from 'sharp';")).toHaveLength(0);
  });
});
