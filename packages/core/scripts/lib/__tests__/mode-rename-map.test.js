import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { MODE_RENAME, RETIRED_CODENAMES } from '../mode-rename-map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(__dirname, '..', '..', '..', 'tokens');

const PRIMITIVE_FAMILIES = {
  shadow: /^shadow-([a-z]+)-(?:light|dark)\.json$/,
  radius: /^radius-([a-z]+(?:-[a-z]+)*)\.json$/,
  borderwidth: /^borderwidth-([a-z]+)\.json$/,
  typography: /^typography-([a-z]+)\.json$/,
};

const UNCHANGED = {
  radius: new Set(['subtle', 'smooth']),
};

function collectModes(dir, pattern) {
  return [
    ...new Set(
      fs
        .readdirSync(dir)
        .map((file) => file.match(pattern))
        .filter(Boolean)
        .map((match) => match[1])
    ),
  ].sort();
}

function expectModeCovered(family, mode) {
  if (UNCHANGED[family]?.has(mode)) return;

  const map = MODE_RENAME[family];
  const friendlyModes = new Set(Object.values(map));
  expect(
    mode in map || friendlyModes.has(mode),
    `${family}-${mode} is not a known codename or friendly target`
  ).toBe(true);
}

describe('mode-rename-map', () => {
  it('is a bijection within each family', () => {
    for (const [family, map] of Object.entries(MODE_RENAME)) {
      const friendly = Object.values(map);
      expect(new Set(friendly).size, `${family} friendly names collide`).toBe(
        friendly.length
      );
    }
  });

  it('derives RETIRED_CODENAMES as the sorted union of every codename', () => {
    const expected = [
      ...new Set(Object.values(MODE_RENAME).flatMap((map) => Object.keys(map))),
    ].sort();
    expect(RETIRED_CODENAMES).toEqual(expected);
  });

  it('covers every current spacing token file', () => {
    const codenames = collectModes(
      path.join(TOKENS, 'semantic'),
      /^spacing-([a-z]+)\.json$/
    );

    for (const codename of codenames) {
      expectModeCovered('spacing', codename);
    }
  });

  it.each(Object.entries(PRIMITIVE_FAMILIES))(
    'covers every current %s token file',
    (family, pattern) => {
      const dir = path.join(TOKENS, 'primitives', family);
      const codenames = collectModes(dir, pattern);

      for (const codename of codenames) {
        expectModeCovered(family, codename);
      }
    }
  );

  it('leaves already-friendly radius modes unchanged', () => {
    expect(MODE_RENAME.radius.subtle).toBeUndefined();
    expect(MODE_RENAME.radius.smooth).toBeUndefined();
  });
});
