'use client';

import { ReactHookFormExample } from '@/patterns/forms/react-hook-form';
import { SettingsForm } from '@/patterns/forms/settings-form';
import type { SettingsValues } from '@/patterns/forms/settings-layout';
import { TanStackFormExample } from '@/patterns/forms/tanstack-form';

export {
  DisabledSettings,
  ReadOnlyDetails,
} from '@/patterns/forms/settings-display';

const PROFILE: SettingsValues = {
  name: 'Priya Shah',
  email: 'priya@example.com',
  updates: false,
};

function demoSave() {
  return new Promise<void>((resolve) => setTimeout(resolve, 800));
}

export function LocalStateExample() {
  return (
    <SettingsForm
      title="Profile settings"
      initialValues={PROFILE}
      onSave={demoSave}
    />
  );
}

export function HookFormExample() {
  return (
    <ReactHookFormExample
      title="Profile settings with React Hook Form"
      initialValues={PROFILE}
      onSave={demoSave}
    />
  );
}

export function TanStackExample() {
  return (
    <TanStackFormExample
      title="Profile settings with TanStack Form"
      initialValues={PROFILE}
      onSave={demoSave}
    />
  );
}
