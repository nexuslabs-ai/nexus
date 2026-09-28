import { FAMILY_PAIRS } from '../lib/apca-pairs';

const FOREGROUND_DESCRIPTIONS = Object.fromEntries(
  FAMILY_PAIRS.flatMap((family) => [
    [
      `${family}-foreground`,
      `Foreground on ${family}-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.`,
    ],
    [
      `${family}-subtle-foreground`,
      `Foreground on ${family}-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.`,
    ],
  ])
);

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
  ...FOREGROUND_DESCRIPTIONS,
};
