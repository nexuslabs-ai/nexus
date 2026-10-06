'use client';

import { Label } from '@/components/label/label';
import { Switch } from '@/components/switch/switch';

export default function SwitchSizes() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-sizes-sm" size="sm" />
        <Label htmlFor="switch-sizes-sm">Small</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-sizes-default" size="default" />
        <Label htmlFor="switch-sizes-default">Default</Label>
      </div>
    </div>
  );
}
