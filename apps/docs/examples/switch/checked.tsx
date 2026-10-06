'use client';

import { Label } from '@/components/label/label';
import { Switch } from '@/components/switch/switch';

export default function SwitchChecked() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-wifi" />
        <Label htmlFor="switch-checked-wifi">Wi-Fi</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-checked-bluetooth" defaultChecked />
        <Label htmlFor="switch-checked-bluetooth">Bluetooth</Label>
      </div>
    </div>
  );
}
