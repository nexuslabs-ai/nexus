import borderwidthFine from '../../tokens/primitives/borderwidth/borderwidth-fine.json' with { type: 'json' };
import borderwidthNormal from '../../tokens/primitives/borderwidth/borderwidth-normal.json' with { type: 'json' };
import borderwidthStrong from '../../tokens/primitives/borderwidth/borderwidth-strong.json' with { type: 'json' };
import color from '../../tokens/primitives/color.json' with { type: 'json' };
import motionSnappy from '../../tokens/primitives/motion/motion-snappy.json' with { type: 'json' };
import radiusExtraRound from '../../tokens/primitives/radius/radius-extra-round.json' with { type: 'json' };
import radiusRound from '../../tokens/primitives/radius/radius-round.json' with { type: 'json' };
import radiusSmooth from '../../tokens/primitives/radius/radius-smooth.json' with { type: 'json' };
import radiusSquare from '../../tokens/primitives/radius/radius-square.json' with { type: 'json' };
import radiusSubtle from '../../tokens/primitives/radius/radius-subtle.json' with { type: 'json' };
import shadowFlatDark from '../../tokens/primitives/shadow/shadow-flat-dark.json' with { type: 'json' };
import shadowFlatLight from '../../tokens/primitives/shadow/shadow-flat-light.json' with { type: 'json' };
import shadowQuietDark from '../../tokens/primitives/shadow/shadow-quiet-dark.json' with { type: 'json' };
import shadowQuietLight from '../../tokens/primitives/shadow/shadow-quiet-light.json' with { type: 'json' };
import shadowSoftDark from '../../tokens/primitives/shadow/shadow-soft-dark.json' with { type: 'json' };
import shadowSoftLight from '../../tokens/primitives/shadow/shadow-soft-light.json' with { type: 'json' };
import shadowStandardDark from '../../tokens/primitives/shadow/shadow-standard-dark.json' with { type: 'json' };
import shadowStandardLight from '../../tokens/primitives/shadow/shadow-standard-light.json' with { type: 'json' };
import shadowStrongDark from '../../tokens/primitives/shadow/shadow-strong-dark.json' with { type: 'json' };
import shadowStrongLight from '../../tokens/primitives/shadow/shadow-strong-light.json' with { type: 'json' };
import typographyDefault from '../../tokens/primitives/typography/typography-default.json' with { type: 'json' };
import breakpoints from '../../tokens/semantic/breakpoints.json' with { type: 'json' };
import spacingComfortable from '../../tokens/semantic/spacing-comfortable.json' with { type: 'json' };
import spacingCompact from '../../tokens/semantic/spacing-compact.json' with { type: 'json' };
import spacingDefault from '../../tokens/semantic/spacing-default.json' with { type: 'json' };
import spacingRelaxed from '../../tokens/semantic/spacing-relaxed.json' with { type: 'json' };
import spacingSpacious from '../../tokens/semantic/spacing-spacious.json' with { type: 'json' };
import spacingTight from '../../tokens/semantic/spacing-tight.json' with { type: 'json' };
import zIndex from '../../tokens/semantic/z-index.json' with { type: 'json' };
import shadowStyles from '../../tokens/styles/shadows.json' with { type: 'json' };
import typographyStyles from '../../tokens/styles/typography.json' with { type: 'json' };

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
