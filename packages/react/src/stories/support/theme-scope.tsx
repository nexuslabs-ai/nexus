import type * as React from 'react';

import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
} from '@nexus_ds/core';

import { cn } from '../../lib/utils';

interface ThemeScopeProps extends React.ComponentProps<'div'> {
  mode: 'light' | 'dark';
  brandColor?: string;
}

/**
 * Renders its children in one mode and brand without touching the document:
 * the derived colour variables are set on this element, and dark adds `.dark`.
 */
export function ThemeScope({
  mode,
  brandColor = DEFAULT_NEXUS_APPEARANCE.brandColor,
  className,
  style,
  ...props
}: ThemeScopeProps) {
  const colors = deriveTheme(
    createNexusThemeContract({ ...DEFAULT_NEXUS_APPEARANCE, brandColor })
  )[mode];

  return (
    <div
      {...props}
      className={cn(mode === 'dark' && 'dark', className)}
      style={{ ...(colors as React.CSSProperties), ...style }}
    />
  );
}
