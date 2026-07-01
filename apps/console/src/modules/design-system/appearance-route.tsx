import { NexusAppearanceSettings } from '@nexus_ds/react';

import { PageHeader } from '../../components/page-header';

/**
 * Design System → Appearance: console-owned controls wired to the root
 * NexusAppearanceProvider so changes here re-theme the entire console.
 */
export function AppearanceRoute() {
  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Appearance"
        description="Tune the console theme, typography, and layout feel in one place."
      />
      <NexusAppearanceSettings />
    </div>
  );
}
