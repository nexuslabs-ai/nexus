'use client';

import { Checkbox } from '@/components/checkbox/checkbox';

export default function CheckboxChecked() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-checked-off" />
        <label
          htmlFor="checkbox-checked-off"
          className="nx:typography-label-default nx:text-foreground nx:select-none"
        >
          Unchecked
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-checked-on" defaultChecked />
        <label
          htmlFor="checkbox-checked-on"
          className="nx:typography-label-default nx:text-foreground nx:select-none"
        >
          Checked
        </label>
      </div>
    </div>
  );
}
