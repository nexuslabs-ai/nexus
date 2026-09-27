'use client';

import * as React from 'react';

import type { CheckedState } from '@radix-ui/react-checkbox';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';

export default function CheckboxIndeterminate() {
  const [email, setEmail] = React.useState(true);
  const [sms, setSms] = React.useState(false);

  const allState: CheckedState =
    email && sms ? true : email || sms ? 'indeterminate' : false;

  function toggleAll(checked: CheckedState) {
    setEmail(checked === true);
    setSms(checked === true);
  }

  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox
          id="checkbox-indeterminate-all"
          checked={allState}
          onCheckedChange={toggleAll}
          aria-controls="checkbox-indeterminate-email checkbox-indeterminate-sms"
        />
        <Label htmlFor="checkbox-indeterminate-all">All notifications</Label>
      </div>
      <div className="nx:flex nx:flex-col nx:gap-3 nx:pl-6">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox
            id="checkbox-indeterminate-email"
            checked={email}
            onCheckedChange={(checked) => setEmail(checked === true)}
          />
          <Label htmlFor="checkbox-indeterminate-email">Email</Label>
        </div>
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox
            id="checkbox-indeterminate-sms"
            checked={sms}
            onCheckedChange={(checked) => setSms(checked === true)}
          />
          <Label htmlFor="checkbox-indeterminate-sms">SMS</Label>
        </div>
      </div>
    </div>
  );
}
