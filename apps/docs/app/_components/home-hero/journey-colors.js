import {
  adjustContrast,
  apcaLc,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  sanitizeNexusAppearance,
} from '@nexus_ds/core';

const seeds = [
  '#5261bf',
  '#ff901b',
  '#ff5424',
  '#43c9df',
  '#f8d75c',
  '#626461',
  '#c4adeb',
  '#229367',
  '#b7dc24',
];
const themes = seeds.map((brandColor) =>
  deriveTheme(
    createNexusThemeContract(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        brandColor,
        surfaceTone: 'neutral',
      })
    )
  )
);
// These illustrative tiles retain their pastel palette in both page themes.
// Small labels use the stricter body tier; icons share the same passing ink.
export function journeyColors() {
  return themes.map((theme) => {
    const background = theme.light['--nx-color-primary-subtle'];
    const foreground = adjustContrast(
      theme.light['--nx-color-primary-subtle-foreground'],
      { background, tier: 'body' }
    );
    return { '--paper': background, '--ink': foreground };
  });
}
export function toolColors(mode) {
  const background = themes[0][mode]['--nx-color-muted'];
  return {
    '--paper': background,
    '--ink': mode === 'dark' ? '#ffffff' : '#000000',
  };
}
export function contrastReport() {
  return ['light', 'dark'].flatMap((mode) =>
    [...journeyColors(mode), toolColors(mode)].map((style, index) => ({
      mode,
      tile: index < 9 ? index + 1 : 'tools',
      Lc: apcaLc(style['--ink'], style['--paper']),
      foreground: style['--ink'],
      background: style['--paper'],
    }))
  );
}
export { apcaLc };
