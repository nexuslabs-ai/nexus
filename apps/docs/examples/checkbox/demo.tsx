'use client';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';

export default function CheckboxDemo() {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Checkbox id="checkbox-demo-terms" />
      <Label htmlFor="checkbox-demo-terms">Accept terms and conditions</Label>
    </div>
  );
}
