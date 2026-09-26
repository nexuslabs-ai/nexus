import borderwidthFine from '../../tokens/primitives/borderwidth/borderwidth-fine.json';
import borderwidthNormal from '../../tokens/primitives/borderwidth/borderwidth-normal.json';
import borderwidthStrong from '../../tokens/primitives/borderwidth/borderwidth-strong.json';
import color from '../../tokens/primitives/color.json';
import motionSnappy from '../../tokens/primitives/motion/motion-snappy.json';
import radiusExtraRound from '../../tokens/primitives/radius/radius-extra-round.json';
import radiusRound from '../../tokens/primitives/radius/radius-round.json';
import radiusSmooth from '../../tokens/primitives/radius/radius-smooth.json';
import radiusSquare from '../../tokens/primitives/radius/radius-square.json';
import radiusSubtle from '../../tokens/primitives/radius/radius-subtle.json';
import shadowFlatDark from '../../tokens/primitives/shadow/shadow-flat-dark.json';
import shadowFlatLight from '../../tokens/primitives/shadow/shadow-flat-light.json';
import shadowQuietDark from '../../tokens/primitives/shadow/shadow-quiet-dark.json';
import shadowQuietLight from '../../tokens/primitives/shadow/shadow-quiet-light.json';
import shadowSoftDark from '../../tokens/primitives/shadow/shadow-soft-dark.json';
import shadowSoftLight from '../../tokens/primitives/shadow/shadow-soft-light.json';
import shadowStandardDark from '../../tokens/primitives/shadow/shadow-standard-dark.json';
import shadowStandardLight from '../../tokens/primitives/shadow/shadow-standard-light.json';
import shadowStrongDark from '../../tokens/primitives/shadow/shadow-strong-dark.json';
import shadowStrongLight from '../../tokens/primitives/shadow/shadow-strong-light.json';
import typographyDefault from '../../tokens/primitives/typography/typography-default.json';
import breakpoints from '../../tokens/semantic/breakpoints.json';
import spacingComfortable from '../../tokens/semantic/spacing-comfortable.json';
import spacingCompact from '../../tokens/semantic/spacing-compact.json';
import spacingDefault from '../../tokens/semantic/spacing-default.json';
import spacingRelaxed from '../../tokens/semantic/spacing-relaxed.json';
import spacingSpacious from '../../tokens/semantic/spacing-spacious.json';
import spacingTight from '../../tokens/semantic/spacing-tight.json';
import zIndex from '../../tokens/semantic/z-index.json';
import shadowStyles from '../../tokens/styles/shadows.json';
import typographyStyles from '../../tokens/styles/typography.json';

/** A parsed DTCG token document. */
export type TokenDocument = { readonly [key: string]: unknown };

/** Every authored token document, keyed by its path under `packages/core/tokens/`. */
export const TOKEN_FILES = {
  'primitives/borderwidth/borderwidth-fine.json': borderwidthFine,
  'primitives/borderwidth/borderwidth-normal.json': borderwidthNormal,
  'primitives/borderwidth/borderwidth-strong.json': borderwidthStrong,
  'primitives/color.json': color,
  'primitives/motion/motion-snappy.json': motionSnappy,
  'primitives/radius/radius-extra-round.json': radiusExtraRound,
  'primitives/radius/radius-round.json': radiusRound,
  'primitives/radius/radius-smooth.json': radiusSmooth,
  'primitives/radius/radius-square.json': radiusSquare,
  'primitives/radius/radius-subtle.json': radiusSubtle,
  'primitives/shadow/shadow-flat-dark.json': shadowFlatDark,
  'primitives/shadow/shadow-flat-light.json': shadowFlatLight,
  'primitives/shadow/shadow-quiet-dark.json': shadowQuietDark,
  'primitives/shadow/shadow-quiet-light.json': shadowQuietLight,
  'primitives/shadow/shadow-soft-dark.json': shadowSoftDark,
  'primitives/shadow/shadow-soft-light.json': shadowSoftLight,
  'primitives/shadow/shadow-standard-dark.json': shadowStandardDark,
  'primitives/shadow/shadow-standard-light.json': shadowStandardLight,
  'primitives/shadow/shadow-strong-dark.json': shadowStrongDark,
  'primitives/shadow/shadow-strong-light.json': shadowStrongLight,
  'primitives/typography/typography-default.json': typographyDefault,
  'semantic/breakpoints.json': breakpoints,
  'semantic/spacing-comfortable.json': spacingComfortable,
  'semantic/spacing-compact.json': spacingCompact,
  'semantic/spacing-default.json': spacingDefault,
  'semantic/spacing-relaxed.json': spacingRelaxed,
  'semantic/spacing-spacious.json': spacingSpacious,
  'semantic/spacing-tight.json': spacingTight,
  'semantic/z-index.json': zIndex,
  'styles/shadows.json': shadowStyles,
  'styles/typography.json': typographyStyles,
} as const satisfies Record<string, TokenDocument>;

export type TokenFile = keyof typeof TOKEN_FILES;
