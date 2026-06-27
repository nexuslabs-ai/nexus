// Single source of truth for the Phase E0 token-mode rename (#546).
// Family-scoped by design: the same codename can map to different friendly names
// per family, so consumers must never apply these as global replacements.
export const MODE_RENAME = {
  spacing: {
    nova: 'compact',
    mira: 'default',
    luma: 'comfortable',
    sera: 'spacious',
    lyra: 'tight',
    vega: 'regular',
    maia: 'relaxed',
  },
  shadow: {
    maia: 'quiet',
    mira: 'standard',
    nova: 'strong',
    vega: 'flat',
    lyra: 'soft',
  },
  radius: {
    sharp: 'square',
    mellow: 'round',
    blunt: 'extra-round',
  },
  borderwidth: {
    maia: 'fine',
    vega: 'normal',
    nova: 'strong',
    lyra: 'medium',
    mira: 'bold',
  },
  typography: {
    vega: 'default',
  },
};

export const RETIRED_CODENAMES = [
  ...new Set(Object.values(MODE_RENAME).flatMap((map) => Object.keys(map))),
].sort();
