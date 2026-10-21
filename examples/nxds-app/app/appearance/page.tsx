import { NxdsAppearanceSettings } from '@/components/appearance/appearance-settings/appearance-settings';

export default function AppearancePage() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:space-y-1">
        <h2 className="nx:typography-heading-small">Appearance</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          The nxds appearance editor. Every change re-derives the theme live, with no rebuild.
        </p>
      </div>
      <NxdsAppearanceSettings />
    </div>
  );
}
