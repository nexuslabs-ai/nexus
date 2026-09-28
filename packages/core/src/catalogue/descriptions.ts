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
};
