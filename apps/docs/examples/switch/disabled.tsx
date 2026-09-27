'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchDisabled() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-off" disabled />
        <label
          htmlFor="switch-disabled-off"
          className="nx:typography-label-default nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Off
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-on" disabled defaultChecked />
        <label
          htmlFor="switch-disabled-on"
          className="nx:typography-label-default nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          On
        </label>
      </div>
    </div>
  );
}
