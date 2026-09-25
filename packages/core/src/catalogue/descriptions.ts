/** Prose for derived colours, keyed by registry name. Authored leaves use `$description`. */
export const RUNTIME_COLOR_DESCRIPTIONS: Readonly<
  Partial<Record<string, string>>
> = {
  'muted-extralight':
    'Quietest muted surface — sits between background and muted for barely-there fills (empty states, subtle panels).',
  'muted-foreground':
    "It's a gray that softens contrast so primary content stands forward.",
  'muted-foreground-subtle':
    'Tertiary text tier below muted-foreground - helper text, captions, divider labels.',
  'primary-foreground':
    'Foreground on primary-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'primary-subtle-foreground':
    'Foreground on primary-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
  'secondary-foreground':
    'Foreground on secondary-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'secondary-subtle-foreground':
    'Foreground on secondary-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
  'error-foreground':
    'Foreground on error-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'error-subtle-foreground':
    'Foreground on error-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
  'information-foreground':
    'Foreground on information-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'information-subtle-foreground':
    'Foreground on information-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
  'success-foreground':
    'Foreground on success-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'success-subtle-foreground':
    'Foreground on success-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
  'warning-foreground':
    'Foreground on warning-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.',
  'warning-subtle-foreground':
    'Foreground on warning-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.',
};
