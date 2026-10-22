import { useMemo } from 'react';

import {
  adjustContrast,
  createNxdsThemeContract,
  deriveTheme,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

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
  '#e66ca5',
  '#4197ea',
  '#bd8963',
];

export function useJourneyColors(modeOverride) {
  const { state, resolvedMode } = useNxdsAppearance();
  return useMemo(
    () =>
      seeds.map((brandColor) => {
        const theme = deriveTheme(
          createNxdsThemeContract({ ...state, brandColor })
        );
        const tokens = theme[modeOverride ?? resolvedMode];
        const background = tokens['--nx-color-primary-subtle'];
        // Small tile labels and icons share the body-tier contrast requirement.
        const foreground = adjustContrast(
          tokens['--nx-color-primary-subtle-foreground'],
          {
            background,
            tier: 'body',
          }
        );
        return { '--paper': background, '--ink': foreground };
      }),
    [state, resolvedMode, modeOverride]
  );
}

export function toolColors() {
  return {
    '--paper': 'var(--nx-color-muted)',
    '--ink': 'var(--nx-color-foreground)',
  };
}
