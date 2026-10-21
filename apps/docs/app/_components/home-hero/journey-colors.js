import { useMemo } from 'react';

import {
  adjustContrast,
  createNexusThemeContract,
  deriveTheme,
} from '@nexus_ds/core';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

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

export function useJourneyColors() {
  const { state, resolvedMode } = useNexusAppearance();
  return useMemo(
    () =>
      seeds.map((brandColor) => {
        const theme = deriveTheme(
          createNexusThemeContract({ ...state, brandColor })
        );
        const tokens = theme[resolvedMode];
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
    [state, resolvedMode]
  );
}

export function toolColors() {
  return {
    '--paper': 'var(--nx-color-muted)',
    '--ink': 'var(--nx-color-foreground)',
  };
}
