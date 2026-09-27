'use client';

import { Switch } from '@/components/switch/switch';

export default function SwitchSizes() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-sizes-sm" size="sm" />
        <label
          htmlFor="switch-sizes-sm"
          className="nx:typography-label-default"
        >
          Small
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Switch id="switch-sizes-default" size="default" />
        <label
          htmlFor="switch-sizes-default"
          className="nx:typography-label-default"
        >
          Default
        </label>
      </div>
    </div>
  );
}
