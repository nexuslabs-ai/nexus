export type ApcaTier = 'body' | 'ui' | 'incidental';

export interface ApcaPair {
  /** Bare semantic token name, without the --nx-color- prefix. */
  fg: string;
  /** Bare semantic token name, without the --nx-color- prefix. */
  bg: string;
  tier: ApcaTier;
}

const FAMILY_PAIRS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
] as const;

const FOCUS_SURFACES = [
  'background',
  'container',
  'popover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
] as const;

const pair = (fg: string, bg: string, tier: ApcaTier): ApcaPair => ({
  fg,
  bg,
  tier,
});

export const APCA_PAIRS = [
  pair('foreground', 'background', 'body'),
  pair('foreground', 'background-hover', 'ui'),
  pair('foreground', 'muted', 'ui'),
  pair('muted-foreground', 'muted', 'incidental'),
  pair('muted-foreground-subtle', 'muted', 'incidental'),
  pair('foreground', 'muted-extralight', 'ui'),
  pair('muted-foreground', 'muted-extralight', 'incidental'),
  pair('disabled-foreground', 'disabled', 'incidental'),
  pair('container-foreground', 'container', 'body'),
  pair('popover-foreground', 'popover', 'body'),
  pair('popover-foreground', 'popover-hover', 'ui'),
  pair('foreground', 'control-background', 'ui'),
  pair('foreground', 'control-background-hover', 'ui'),
  pair('nav-foreground', 'nav-background', 'ui'),
  pair('nav-muted-foreground', 'nav-background', 'incidental'),
  pair('nav-foreground', 'nav-item-hover', 'ui'),
  pair('nav-foreground', 'nav-item-active', 'ui'),
  pair('error-subtle-foreground', 'background', 'ui'),
  pair('error-subtle-foreground', 'container', 'ui'),
  ...FAMILY_PAIRS.flatMap((family) => [
    pair(`${family}-foreground`, `${family}-background`, 'ui'),
    pair(`${family}-subtle-foreground`, `${family}-subtle`, 'ui'),
  ]),
  ...Array.from({ length: 5 }, (_, index) =>
    pair(`chart-categorical-${index + 1}`, 'container', 'ui')
  ),
  ...FOCUS_SURFACES.flatMap((surface) => [
    pair('focus-default', surface, 'incidental'),
    pair('focus-error', surface, 'incidental'),
  ]),
] as const satisfies readonly ApcaPair[];
