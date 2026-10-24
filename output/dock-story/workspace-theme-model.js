import { DEFAULT_NXDS_APPEARANCE, sanitizeNxdsAppearance } from '@nxds/core';

// A manual translation for this study, not a built-in MUI theme importer.
export function appearanceFromMui(theme) {
  return sanitizeNxdsAppearance({
    ...DEFAULT_NXDS_APPEARANCE,
    mode: theme.palette.mode,
    brandColor: theme.palette.primary.main,
    surfaceTone: 'neutral',
    corners: 'subtle',
    elevation: 'flat',
    prefs: {
      ...DEFAULT_NXDS_APPEARANCE.prefs,
      uiFont: theme.typography.fontFamily,
      uiFontSize: theme.typography.fontSize,
    },
  });
}

// Explicit consumer-owned overrides: only the Nexus specimen receives them.
export function muiAdapterVariables(theme) {
  return {
    '--nx-color-primary-background': theme.palette.primary.main,
    '--nx-color-primary-background-hover': theme.palette.primary.dark,
    '--nx-color-primary-background-active': theme.palette.primary.dark,
    '--nx-color-primary-foreground': theme.palette.primary.contrastText,
    '--nx-color-primary-disabled': theme.palette.action.disabledBackground,
    '--nx-color-container': theme.palette.background.paper,
    '--nx-color-container-hover': theme.palette.background.paper,
    '--nx-color-container-foreground': theme.palette.text.primary,
    '--nx-color-foreground': theme.palette.text.primary,
    '--nx-color-muted-foreground': theme.palette.text.secondary,
    '--nx-color-border-default': theme.palette.divider,
    '--nx-color-error-border': theme.palette.error.main,
    '--nx-color-error-subtle-foreground': theme.palette.error.main,
    '--nx-color-disabled-foreground': theme.palette.action.disabled,
    '--nx-color-disabled': 'transparent',
    '--match-radius': `${theme.shape.borderRadius}px`,
    '--match-font': theme.typography.fontFamily,
    '--match-input-border':
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.23)'
        : 'rgba(0,0,0,0.23)',
    '--match-input-focus': theme.palette.primary.main,
    '--match-button-weight': theme.typography.button.fontWeight,
    '--match-button-spacing': theme.typography.button.letterSpacing,
    '--match-button-case': theme.typography.button.textTransform,
    '--match-button-shadow': theme.shadows[2],
    '--match-button-hover-shadow': theme.shadows[4],
  };
}
