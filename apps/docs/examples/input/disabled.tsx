'use client';

import { Input } from '@/components/input/input';

export default function InputDisabled() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
      <Input
        disabled
        defaultValue="acct_1024"
        aria-label="Disabled with value"
      />
    </div>
  );
}
