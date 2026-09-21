import { NexusAppearanceSettings } from '@nexus_ds/react';

import { PageHeading } from '../../components/page-heading';

export function AppearanceRoute() {
  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6">
      <PageHeading title="Console appearance" />
      <p className="nx:text-muted-foreground">
        Choose how the Console looks. These are your saved interface
        preferences.
      </p>
      <NexusAppearanceSettings />
    </div>
  );
}
