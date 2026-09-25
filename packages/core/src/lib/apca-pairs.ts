import { CHART_PALETTE_REFERENCES } from './semantic-palette-references';

export type ApcaTier = 'body' | 'ui' | 'incidental';

/**
 * How the contrast solver resolves a pair's foreground.
 * - `text`: reading text; light mode keeps a seed that already passes.
 * - `label`: black/white label on a family fill; the solver moves the fill.
 * - `ink`: any other mark; the solver re-solves its lightness, keeping hue.
 */
export type ApcaSolveKind = 'text' | 'label' | 'ink';

export interface ApcaPair {
  /** Bare semantic token name, without the --nx-color- prefix. */
  fg: string;
  /** Bare semantic token name, without the --nx-color- prefix. */
  bg: string;
  tier: ApcaTier;
  kind: ApcaSolveKind;
  /** Opaque token or hex color underneath a translucent background. */
  backdrop?: string;
  /** Extra Lc on top of the tier target, e.g. to stagger chart series. */
  offset?: number;
  /** Solve jointly with another foreground and emit one shared color. */
  solveAs?: string;
}

const FAMILY_PAIRS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
] as const;

const CATEGORICAL_INDICES = CHART_PALETTE_REFERENCES.map(
  (_, index) => index + 1
);
// Each chart series asks for this much more Lc than the previous one, so
// categories differ in lightness as well as hue.
const CHART_STAGGER_LC = 4.5;

const FOCUS_SURFACES = [
  'background',
  'container',
  'popover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
] as const;

const text = (fg: string, bg: string, tier: ApcaTier): ApcaPair => ({
  fg,
  bg,
  tier,
  kind: 'text',
});
const label = (fg: string, bg: string, tier: ApcaTier): ApcaPair => ({
  fg,
  bg,
  tier,
  kind: 'label',
});
const ink = (fg: string, bg: string, tier: ApcaTier): ApcaPair => ({
  fg,
  bg,
  tier,
  kind: 'ink',
});

export const APCA_PAIRS = [
  text('foreground', 'background', 'body'),
  text('foreground', 'background-hover', 'ui'),
  text('foreground', 'muted', 'ui'),
  text('muted-foreground', 'muted', 'ui'),
  text('muted-foreground-subtle', 'muted', 'incidental'),
  text('muted-foreground', 'container', 'ui'),
  text('muted-foreground-subtle', 'container', 'incidental'),
  text('foreground', 'muted-extralight', 'ui'),
  text('muted-foreground', 'muted-extralight', 'ui'),
  text('disabled-foreground', 'disabled', 'incidental'),
  text('container-foreground', 'container', 'body'),
  text('foreground', 'container', 'body'),
  text('popover-foreground', 'popover', 'body'),
  text('popover-foreground', 'popover-hover', 'ui'),
  text('foreground', 'control-background', 'ui'),
  text('foreground', 'control-background-hover', 'ui'),
  text('nav-foreground', 'nav-background', 'ui'),
  text('nav-muted-foreground', 'nav-background', 'incidental'),
  text('nav-foreground', 'nav-item-hover', 'ui'),
  text('nav-foreground', 'nav-item-active', 'ui'),
  ink('error-subtle-foreground', 'background', 'ui'),
  ink('error-subtle-foreground', 'container', 'ui'),
  ...FAMILY_PAIRS.flatMap((family) => [
    label(`${family}-foreground`, `${family}-background`, 'ui'),
    label(`${family}-foreground`, `${family}-background-hover`, 'ui'),
    label(`${family}-foreground`, `${family}-background-active`, 'ui'),
    ink(`${family}-subtle-foreground`, `${family}-subtle`, 'ui'),
    ink(`${family}-subtle-foreground`, `${family}-subtle-hover`, 'ui'),
    ink(`${family}-subtle-foreground`, `${family}-subtle-active`, 'ui'),
  ]),
  ...CATEGORICAL_INDICES.flatMap((index) =>
    ['container', 'background'].map((bg) => ({
      ...ink(`chart-categorical-${index}`, bg, 'ui'),
      offset: (index - 1) * CHART_STAGGER_LC,
    }))
  ),
  // Focus is the primary accent (components.md § Focus States), so it shares
  // one solved color with primary-subtle-foreground.
  ...FOCUS_SURFACES.flatMap((surface) => [
    {
      ...ink('focus-default', surface, 'incidental'),
      solveAs: 'primary-subtle-foreground',
    },
    ink('focus-error', surface, 'incidental'),
  ]),
  ...[
    'background-active',
    'container-hover',
    'container-active',
    'popover',
    'popover-hover',
    'popover-active',
    'nav-background',
  ].flatMap((surface) => [
    text('foreground', surface, 'ui'),
    text('muted-foreground', surface, 'ui'),
    text('muted-foreground-subtle', surface, 'incidental'),
  ]),
  text('muted-foreground', 'background', 'ui'),
  text('muted-foreground-subtle', 'background', 'incidental'),
  text('container-foreground', 'container-hover', 'ui'),
  text('container-foreground', 'container-active', 'ui'),
  text('popover-foreground', 'popover-active', 'ui'),
  ...['background', 'container', 'popover'].flatMap((backdrop) => [
    { ...text('popover-foreground', 'popover-alpha', 'body'), backdrop },
    { ...text('foreground', 'background-hover-alpha', 'ui'), backdrop },
  ]),
  ...['#000000', '#ffffff'].map((backdrop) => ({
    ...text('popover-foreground', 'popover-alpha', 'body'),
    backdrop,
  })),
] as const satisfies readonly ApcaPair[];
