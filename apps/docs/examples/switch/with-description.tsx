'use client';

import { Label } from '@/components/label/label';
import { Switch } from '@/components/switch/switch';

export default function SwitchWithDescription() {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4">
      <div className="nx:space-y-0.5">
        <Label htmlFor="switch-with-description-marketing">
          Marketing emails
        </Label>
        <p
          id="switch-with-description-marketing-description"
          className="nx:typography-body-default nx:text-muted-foreground"
        >
          Receive emails about new products and features.
        </p>
      </div>
      <Switch
        id="switch-with-description-marketing"
        aria-describedby="switch-with-description-marketing-description"
      />
    </div>
  );
}
