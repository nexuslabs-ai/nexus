'use client';

import { Checkbox } from '@/components/checkbox/checkbox';

export default function CheckboxDemo() {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Checkbox id="checkbox-demo-terms" />
      <label
        htmlFor="checkbox-demo-terms"
        className="nx:typography-label-default nx:text-foreground nx:select-none"
      >
        Accept terms and conditions
      </label>
    </div>
  );
}
