'use client';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';

export default function CheckboxDisabled() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-disabled-unchecked" disabled />
        <Label htmlFor="checkbox-disabled-unchecked">Unchecked</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
        <Label htmlFor="checkbox-disabled-checked">Checked</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox
          id="checkbox-disabled-indeterminate"
          disabled
          checked="indeterminate"
        />
        <Label htmlFor="checkbox-disabled-indeterminate">Indeterminate</Label>
      </div>
    </div>
  );
}
