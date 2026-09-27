'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchChecked() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-wifi" />
        <label
          htmlFor="switch-checked-wifi"
          className="nx:typography-label-default"
        >
          Wi-Fi
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-bluetooth" defaultChecked />
        <label
          htmlFor="switch-checked-bluetooth"
          className="nx:typography-label-default"
        >
          Bluetooth
        </label>
      </div>
    </div>
  );
}
