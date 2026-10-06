'use client';

import { Label } from '@/components/label/label';
import { Switch } from '@/components/switch/switch';

export default function SwitchDisabled() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-location" disabled />
        <Label htmlFor="switch-disabled-location">Location services</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-disabled-updates" disabled defaultChecked />
        <Label htmlFor="switch-disabled-updates">Automatic updates</Label>
      </div>
    </div>
  );
}
