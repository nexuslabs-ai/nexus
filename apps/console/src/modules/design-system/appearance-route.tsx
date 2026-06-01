import { useThemeContext } from '../../app/theme-provider';

import { ThemeSwitcher } from './ThemeSwitcher';

/**
 * Design System → Appearance: the full 8-axis theme control, wired to the root
 * ThemeProvider so changes here re-theme the entire console.
 */
export function AppearanceRoute() {
  const { theme, setTheme } = useThemeContext();
  return (
    <div className="nx:mx-auto nx:max-w-md nx:p-6">
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
    </div>
  );
}
