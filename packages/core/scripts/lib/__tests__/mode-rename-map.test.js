import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  CORNER_OPTIONS,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  PUBLIC_MODE_RENAME,
  STROKE_OPTIONS,
} from '../../../src/lib/appearance-model';
import { MODE_RENAME, RETIRED_CODENAMES } from '../mode-rename-map.js';
import { TOKEN_MODE_FAMILIES } from '../token-mode-manifest.js';

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
    // Pinned literal (not re-derived from MODE_RENAME) so adding, removing, or
    // typo'ing a codename is caught — the point of a freeze PR.
    expect(RETIRED_CODENAMES).toEqual([
      'blunt',
      'luma',
      'lyra',
      'maia',
      'mellow',
      'mira',
      'nova',
      'sera',
      'sharp',
      'vega',
    ]);
  });

  it.each(
    TOKEN_MODE_FAMILIES.map(({ family, dir, modePattern }) => [
      family,
      dir,
      modePattern,
    ])
  )('covers every current %s token file', (family, dir, pattern) => {
    const codenames = collectModes(dir, pattern);

    for (const codename of codenames) {
      expectModeCovered(family, codename);
    }
  });

  it('leaves already-friendly radius modes unchanged', () => {
    expect(MODE_RENAME.radius.subtle).toBeUndefined();
    expect(MODE_RENAME.radius.smooth).toBeUndefined();
  });

  it('keeps codenames disjoint from friendly targets', () => {
    // The audit's `RETIRED_CODENAMES` alternation and `expectModeCovered`'s
    // `||` branch both assume a codename is never also a friendly name. (Not a
    // global friendly-uniqueness check — `default`/`strong` are reused across
    // families on purpose.)
    const friendly = new Set(
      Object.values(MODE_RENAME).flatMap((map) => Object.values(map))
    );
    for (const codename of RETIRED_CODENAMES) {
      expect(
        friendly.has(codename),
        `${codename} is also a friendly target — would break the audit alternation`
      ).toBe(false);
    }
  });

  it('binds the public appearance-model value-lists to the rename map', () => {
    // The model re-encodes the mapping as its own literals (`NexusDensity`
    // etc.); without this, a typo'd or unmapped option value passes typecheck
    // and the context-scoped audit (which cannot see bare strings). Green today
    // (codenames) and after the cutover (friendly names).
    const optionsByFamily = {
      spacing: DENSITY_OPTIONS,
      shadow: ELEVATION_OPTIONS,
      radius: CORNER_OPTIONS,
      borderwidth: STROKE_OPTIONS,
    };
    const defaultByFamily = {
      spacing: DEFAULT_NEXUS_APPEARANCE.density,
      shadow: DEFAULT_NEXUS_APPEARANCE.elevation,
      radius: DEFAULT_NEXUS_APPEARANCE.corners,
      borderwidth: DEFAULT_NEXUS_APPEARANCE.stroke,
    };
    for (const [family, options] of Object.entries(optionsByFamily)) {
      for (const { value } of options) expectModeCovered(family, value);
      expectModeCovered(family, defaultByFamily[family]);
    }
  });

  it('pins PUBLIC_MODE_RENAME to the build-time MODE_RENAME public rows', () => {
    // The runtime normalizer map (appearance-model.ts) re-encodes the public
    // rows of the build map; this catches drift if either is edited.
    const fieldToFamily = {
      density: 'spacing',
      corners: 'radius',
      elevation: 'shadow',
      stroke: 'borderwidth',
    };
    for (const [field, map] of Object.entries(PUBLIC_MODE_RENAME)) {
      const family = fieldToFamily[field];
      for (const [codename, friendly] of Object.entries(map)) {
        expect(MODE_RENAME[family][codename], `${field} ${codename}`).toBe(
          friendly
        );
      }
    }
  });
});
