/**
 * Chromatic Modes Configuration
 *
 * Each mode defines a combination of globals that affect rendering.
 * Chromatic will capture a separate snapshot for each mode.
 *
 * The `theme` value is read by the decorator via context.globals.theme
 * to apply the correct theme class.
 */

export const allModes = {
  'light desktop': {
    theme: 'light',
    viewport: 'desktop',
  },
  'dark desktop': {
    theme: 'dark',
    viewport: 'desktop',
  },
  'light mobile': {
    theme: 'light',
    viewport: 'mobile',
  },
  'dark mobile': {
    theme: 'dark',
    viewport: 'mobile',
  },
} as const;

// Subset for components that don't need responsive testing
export const themeOnlyModes = {
  light: {
    theme: 'light',
    viewport: 'desktop',
  },
  dark: {
    theme: 'dark',
    viewport: 'desktop',
  },
} as const;

// Subset for responsive-only testing (single theme)
export const viewportOnlyModes = {
  desktop: {
    theme: 'light',
    viewport: 'desktop',
  },
  mobile: {
    theme: 'light',
    viewport: 'mobile',
  },
} as const;
