import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { MODE_RENAME, RETIRED_CODENAMES } from '../lib/mode-rename-map.js';
import { leafPathsOf } from '../validate-spacing-modes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(__dirname, '..', '..', 'tokens');
const TAILWIND_CSS = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'tailwind',
  'nexus.css'
);
const ORACLE = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '__fixtures__', 'pre-rename-mode-values.json'),
    'utf8'
  )
);

const LOCATION = {
  spacing: (mode) => [path.join(TOKENS, 'semantic'), `spacing-${mode}.json`],
  radius: (mode) => [
    path.join(TOKENS, 'primitives', 'radius'),
    `radius-${mode}.json`,
  ],
  borderwidth: (mode) => [
    path.join(TOKENS, 'primitives', 'borderwidth'),
    `borderwidth-${mode}.json`,
  ],
  typography: (mode) => [
    path.join(TOKENS, 'primitives', 'typography'),
    `typography-${mode}.json`,
  ],
};
const SHADOW_DIR = path.join(TOKENS, 'primitives', 'shadow');
const PUBLIC_SHADOW_MODES = new Set(['quiet', 'standard', 'strong']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function valueAtPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((node, key) => node[key], obj).$value;
}

function leafValues(obj) {
  const out = {};
  for (const pathName of leafPathsOf(obj)) {
    out[pathName] = valueAtPath(obj, pathName);
  }
  return out;
}

function withoutColorLeaves(leaves) {
  return Object.fromEntries(
    Object.entries(leaves).filter(([pathName]) => !pathName.endsWith('.color'))
  );
}

function attributeSelector(attr, value) {
  return new RegExp(`\\[${attr}=(['"])${value}\\1\\]`);
}

describe('token-mode rename preserves migration values', () => {
  it.each(
    Object.entries(MODE_RENAME).flatMap(([family, map]) =>
      Object.entries(map).map(([codename, friendly]) => [
        family,
        codename,
        friendly,
      ])
    )
  )(
    '%s %s -> %s keeps the migration value contract',
    (family, codename, friendly) => {
      if (family === 'shadow') {
        for (const variant of ['light', 'dark']) {
          const data = readJson(
            path.join(SHADOW_DIR, `shadow-${friendly}-${variant}.json`)
          );
          const actual = leafValues(data);
          const expected = ORACLE[`shadow.${codename}-${variant}`];

          expect(Object.keys(actual).sort()).toEqual(
            Object.keys(expected).sort()
          );

          if (variant === 'dark' && PUBLIC_SHADOW_MODES.has(friendly)) {
            // #558 intentionally recalibrates dark shadow colour leaves after
            // the codename migration for public Appearance modes. Geometry still
            // proves the rename did not mutate the shadow recipe shape.
            expect(withoutColorLeaves(actual)).toEqual(
              withoutColorLeaves(expected)
            );
            continue;
          }

          expect(actual).toEqual(expected);
        }
        return;
      }

      const [dir, file] = LOCATION[family](friendly);
      const data = readJson(path.join(dir, file));
      const actual = leafValues(data);
      const expected = ORACLE[`${family}.${codename}`];

      expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());

      if (family === 'borderwidth' && friendly === 'strong') {
        // Phase F intentionally calibrates the public strong default stroke
        // after the codename migration. Chromium computes 1.5px borders as 1px,
        // so the previous value did not make common component borders visibly
        // stronger. The thick token still preserves the original nova value.
        expect(actual).toEqual({
          ...expected,
          default: { value: 2, unit: 'px' },
        });
        return;
      }

      expect(actual).toEqual(expected);
    }
  );

  it('emits friendly data-* selectors and no retired selectors', () => {
    const css = fs.readFileSync(TAILWIND_CSS, 'utf8');

    for (const [attr, value] of [
      ['data-density', 'default'],
      ['data-radius', 'square'],
      ['data-radius', 'extra-round'],
      ['data-shadow', 'quiet'],
      ['data-borderwidth', 'normal'],
    ]) {
      expect(
        attributeSelector(attr, value).test(css),
        `missing ${attr}=${value}`
      ).toBe(true);
    }

    for (const codename of RETIRED_CODENAMES) {
      const pattern = new RegExp(
        `\\[data-(?:density|radius|shadow|borderwidth)=(['"])${codename}\\1\\]`
      );
      expect(pattern.test(css), `retired selector for "${codename}"`).toBe(
        false
      );
    }
  });
});
