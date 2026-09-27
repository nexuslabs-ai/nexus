'use client';

import * as React from 'react';

import { Checkbox } from '@/components/checkbox/checkbox';

export default function CheckboxIndeterminate() {
  const [email, setEmail] = React.useState(true);
  const [sms, setSms] = React.useState(false);

  const all = email && sms;
  const some = email || sms;

  function selectAll(checked: boolean | 'indeterminate') {
    setEmail(checked === true);
    setSms(checked === true);
  }

  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox
          id="checkbox-indeterminate-all"
          checked={all ? true : some ? 'indeterminate' : false}
          onCheckedChange={selectAll}
        />
        <label
          htmlFor="checkbox-indeterminate-all"
          className="nx:typography-label-default nx:text-foreground nx:select-none"
        >
          All notifications
        </label>
      </div>
      <div className="nx:flex nx:flex-col nx:gap-3 nx:pl-6">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox
            id="checkbox-indeterminate-email"
            checked={email}
            onCheckedChange={(checked) => setEmail(checked === true)}
          />
          <label
            htmlFor="checkbox-indeterminate-email"
            className="nx:typography-label-default nx:text-foreground nx:select-none"
          >
            Email
          </label>
        </div>
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox
            id="checkbox-indeterminate-sms"
            checked={sms}
            onCheckedChange={(checked) => setSms(checked === true)}
          />
          <label
            htmlFor="checkbox-indeterminate-sms"
            className="nx:typography-label-default nx:text-foreground nx:select-none"
          >
            SMS
          </label>
        </div>
      </div>
    </div>
  );
}
