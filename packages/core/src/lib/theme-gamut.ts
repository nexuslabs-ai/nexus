import { clampChroma, type Oklch } from 'culori';

import type { ThemeTrace } from './theme-inspection';

export function clampThemeChroma(
  input: Oklch,
  gamut: 'p3' | 'rgb',
  trace?: ThemeTrace
): Oklch {
  const output = clampChroma(input, 'oklch', gamut);
  trace?.record({ kind: 'gamut', input, output, gamut });
  return output;
}
