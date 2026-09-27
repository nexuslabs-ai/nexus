'use client';

import { Checkbox } from '@/components/checkbox/checkbox';

export default function CheckboxDisabled() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-disabled-unchecked" disabled />
        <label
          htmlFor="checkbox-disabled-unchecked"
          className="nx:typography-label-default nx:text-foreground nx:select-none nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Unchecked
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
        <label
          htmlFor="checkbox-disabled-checked"
          className="nx:typography-label-default nx:text-foreground nx:select-none nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Checked
        </label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox
          id="checkbox-disabled-indeterminate"
          disabled
          checked="indeterminate"
        />
        <label
          htmlFor="checkbox-disabled-indeterminate"
          className="nx:typography-label-default nx:text-foreground nx:select-none nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
        >
          Indeterminate
        </label>
      </div>
    </div>
  );
}
