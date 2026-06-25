import { useThemeContext } from '../../app/theme-provider';
import { PageHeader } from '../../components/page-header';

import { AppearanceSettings } from './settings/AppearanceSettings';

/**
 * Design System → Appearance: the full 8-axis theme control, wired to the root
 * ThemeProvider so changes here re-theme the entire console.
 */
export function AppearanceRoute() {
  const { theme, setTheme } = useThemeContext();
  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Appearance"
        description="Tune the console theme, typography, and layout feel in one place."
      />
      <AppearanceSettings theme={theme} setTheme={setTheme} />
    </div>
  );
}
