'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchDisabled() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-location" disabled />
        <label
          htmlFor="switch-disabled-location"
          className="nx:typography-label-default nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Location services
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-updates" disabled defaultChecked />
        <label
          htmlFor="switch-disabled-updates"
          className="nx:typography-label-default nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Automatic updates
        </label>
      </div>
    </div>
  );
}
