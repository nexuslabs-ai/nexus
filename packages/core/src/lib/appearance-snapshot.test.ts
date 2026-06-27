import { describe, expect, it } from 'vitest';

import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import {
  createNexusAppearanceSnapshot,
  resolveFirstPaint,
  sanitizeNexusAppearanceSnapshot,
  SNAPSHOT_VERSION,
} from './appearance-snapshot';
import { deriveTheme, themeToCss } from './derive-theme';

function themeCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return themeToCss(deriveTheme(createNexusThemeContract(state)));
}

function prefsCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return appearancePrefsToCss(state.prefs);
}

describe('NexusAppearanceSnapshot', () => {
  it('stores pre-derived CSS verbatim', () => {
    const theme = themeCss();
    const prefs = prefsCss();
    const snapshot = createNexusAppearanceSnapshot(
      DEFAULT_NEXUS_APPEARANCE,
      theme,
      prefs
    );

    expect(snapshot).toEqual({
      version: SNAPSHOT_VERSION,
      state: DEFAULT_NEXUS_APPEARANCE,
      themeCss: theme,
      prefsCss: prefs,
    });
  });

  it('recovers state on version mismatch and refreshes the stale CSS cache', () => {
    const dark = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      brandColor: '#ff0000',
    };
    const snapshot = sanitizeNexusAppearanceSnapshot({
      version: 999,
      state: dark,
      themeCss: 'STALE',
      prefsCss: 'STALE',
    });

    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.state).toEqual(dark);
    expect(snapshot.themeCss).toBe(themeCss(dark));
    expect(snapshot.prefsCss).toBe(prefsCss(dark));
  });

  it('resets to the default snapshot on unreadable payloads', () => {
    const snapshot = sanitizeNexusAppearanceSnapshot('garbage');

    expect(snapshot.state).toEqual(DEFAULT_NEXUS_APPEARANCE);
    expect(snapshot.themeCss).toBe(themeCss());
    expect(snapshot.prefsCss).toBe(prefsCss());
  });

  it('does not treat a raw Phase B state object as a snapshot payload', () => {
    const snapshot = sanitizeNexusAppearanceSnapshot({
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark',
    });

    expect(snapshot.state).toEqual(DEFAULT_NEXUS_APPEARANCE);
  });
});

describe('resolveFirstPaint', () => {
  const snapshotFor = (state = DEFAULT_NEXUS_APPEARANCE) =>
    createNexusAppearanceSnapshot(state, 'THEME', 'PREFS');

  it('resolves pinned dark mode concretely', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }),
      false
    );

    expect(result.className).toBe('dark');
    expect(result.colorScheme).toBe('dark');
    expect(result.metaColorScheme).toBe('dark');
    expect(result.dataAttrs).toEqual({
      'data-style': 'mira',
      'data-radius': 'sharp',
      'data-shadow': 'maia',
      'data-borderwidth': 'vega',
    });
  });

  it('resolves system mode from the OS preference and keeps meta dual-scheme', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' }),
      true
    );

    expect(result.className).toBe('dark');
    expect(result.colorScheme).toBe('dark');
    expect(result.metaColorScheme).toBe('light dark');
  });

  it('passes snapshot CSS through without derivation', () => {
    const result = resolveFirstPaint(snapshotFor(), false);

    expect(result.themeCss).toBe('THEME');
    expect(result.prefsCss).toBe('PREFS');
  });
});
