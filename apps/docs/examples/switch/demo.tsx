'use client';

import { Label } from '@/components/label/label';
import { Switch } from '@/components/switch/switch';

export default function SwitchDemo() {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Switch id="switch-demo-airplane" />
      <Label htmlFor="switch-demo-airplane">Airplane mode</Label>
    </div>
  );
}
