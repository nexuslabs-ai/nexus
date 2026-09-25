import { APCA_PAIRS } from './apca-pairs';
import { contrastForPair } from './contrast';
import type { DerivedTheme } from './derive-theme';
import { type Mode, type Tier, TIER_THRESHOLDS } from './palette';

const MODES = ['light', 'dark'] as const satisfies readonly Mode[];

const cssVar = (name: string) => `--nx-color-${name}`;

/** One registered foreground/background pair, measured in one mode. */
export interface ThemeContrastCheck {
  mode: Mode;
  /** Foreground CSS variable, e.g. `--nx-color-foreground`. */
  fg: string;
  /** Background CSS variable, e.g. `--nx-color-background`. */
  bg: string;
  /** CSS variable or hex color underneath a translucent background. */
  backdrop?: string;
  tier: Tier;
  /** Absolute APCA Lc after alpha composition. */
  lc: number;
  /** The tier's minimum Lc. */
  floor: number;
  /** Whether `lc` clears `floor`. */
  pass: boolean;
}

/** Measure every registered APCA pair of a derived theme in both modes. */
export function measureThemeContrast(
  theme: DerivedTheme
): ThemeContrastCheck[] {
  return MODES.flatMap((mode) =>
    APCA_PAIRS.map((pair) => {
      const lc = contrastForPair(theme[mode], pair);
      const floor = TIER_THRESHOLDS[pair.tier];
      const check: ThemeContrastCheck = {
        mode,
        fg: cssVar(pair.fg),
        bg: cssVar(pair.bg),
        tier: pair.tier,
        lc,
        floor,
        pass: lc >= floor,
      };
      if (pair.backdrop) {
        check.backdrop = pair.backdrop.startsWith('#')
          ? pair.backdrop
          : cssVar(pair.backdrop);
      }
      return check;
    })
  );
}
