'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchDemo() {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Switch id="switch-demo-airplane" />
      <label
        htmlFor="switch-demo-airplane"
        className="nx:typography-label-default"
      >
        Airplane mode
      </label>
    </div>
  );
}
