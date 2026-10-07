'use client';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';

export default function CheckboxChecked() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-checked-off" />
        <Label htmlFor="checkbox-checked-off">Unchecked</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="checkbox-checked-on" defaultChecked />
        <Label htmlFor="checkbox-checked-on">Checked</Label>
      </div>
    </div>
  );
}
