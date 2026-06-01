import { useThemeContext } from '../../app/theme-provider';

import { SettingsScene } from './settings/SettingsScene';

/**
 * Design System → Scenes: the composed Settings screen (the Phase 1 capstone),
 * driven by the live theme so its Appearance tab stays in sync with the rest of
 * the console.
 */
export function ScenesRoute() {
  const { theme, setTheme } = useThemeContext();
  return <SettingsScene theme={theme} setTheme={setTheme} />;
}
