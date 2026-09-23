import { APCA_PAIRS, type ApcaPair } from './apca-pairs';
import { contrastForPair, contrastTarget, normalizeContrast } from './contrast';
import type { DerivedTheme, ThemeDerivationInput } from './derive-theme';
import { type Mode, type Tier, TIER_THRESHOLDS } from './palette';

const MODES = ['light', 'dark'] as const satisfies readonly Mode[];

/** One registered foreground/background pair, measured in one mode. */
export interface ThemeContrastCheck {
  mode: Mode;
  /** Bare semantic token name, without the --nx-color- prefix. */
  fg: string;
  /** Bare semantic token name, without the --nx-color- prefix. */
  bg: string;
  /** Opaque token or hex color underneath a translucent background. */
  backdrop?: string;
  tier: Tier;
  /** Absolute APCA Lc after alpha composition. */
  lc: number;
  /** The tier's minimum Lc. */
  floor: number;
  /** The Lc the contrast setting asks for; the solver may stop short of it when unreachable. */
  target: number;
  /** Whether `lc` clears `floor`. */
  pass: boolean;
}

/** Measure every registered APCA pair of a derived theme in both modes. */
export function measureThemeContrast(
  theme: DerivedTheme,
  contrast: ThemeDerivationInput['contrast']
): ThemeContrastCheck[] {
  return MODES.flatMap((mode) =>
    APCA_PAIRS.map((pair: ApcaPair): ThemeContrastCheck => {
      const lc = contrastForPair(theme[mode], pair);
      const floor = TIER_THRESHOLDS[pair.tier];
      return {
        mode,
        fg: pair.fg,
        bg: pair.bg,
        backdrop: pair.backdrop,
        tier: pair.tier,
        lc,
        floor,
        target:
          contrastTarget(pair.tier, normalizeContrast(contrast[mode])) +
          (pair.offset ?? 0),
        pass: lc >= floor,
      };
    })
  );
}
