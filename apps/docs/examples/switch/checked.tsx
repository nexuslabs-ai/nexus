'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchChecked() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-off" />
        <label
          htmlFor="switch-checked-off"
          className="nx:typography-label-default"
        >
          Off
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-on" defaultChecked />
        <label
          htmlFor="switch-checked-on"
          className="nx:typography-label-default"
        >
          On
        </label>
      </div>
    </div>
  );
}
