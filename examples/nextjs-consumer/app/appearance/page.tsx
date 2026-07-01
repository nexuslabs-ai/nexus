'use client';

import { NexusAppearanceSettings } from '@acme/react';

export default function AppearancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
        <p className="text-sm text-slate-500">
          The design system&apos;s appearance editor, shipped in <code>@acme/react</code>.
          Changes here re-derive the <code>--nx-*</code> tokens live through the
          provider — the whole UI retunes without a rebuild.
        </p>
      </div>
      <NexusAppearanceSettings />
    </div>
  );
}
