'use client';
import {
  NexusAppearanceConfigPreview,
  NexusAppearanceSettings,
  NexusThemeQuickControl,
} from '@nexus_ds/react';
import { NexusAppearanceProvider } from '@nexus_ds/react/appearance';

import { usePreviewAppearance } from '../preview/appearance-context';
export default function AppearanceDemo() {
  const { state, onChange } = usePreviewAppearance();
  return (
    <NexusAppearanceProvider
      state={state}
      onStateChange={onChange}
      storageKey={false}
      cookieWriteKey={false}
    >
      <div className="nx:space-y-6">
        <NexusThemeQuickControl />
        <NexusAppearanceSettings />
        <NexusAppearanceConfigPreview
          state={state}
          resolvedMode={state.mode === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </NexusAppearanceProvider>
  );
}
