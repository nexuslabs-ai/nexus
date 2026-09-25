'use client';

import { Input } from '@/components/input/input';

export default function InputInvalid() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-1.5">
      <label
        htmlFor="input-invalid-email"
        className="nx:typography-label-default nx:text-foreground"
      >
        Email
      </label>
      <Input
        id="input-invalid-email"
        type="email"
        defaultValue="ada@"
        aria-invalid
        aria-describedby="input-invalid-email-error"
      />
      <p
        id="input-invalid-email-error"
        className="nx:typography-body-small nx:text-error-subtle-foreground"
      >
        Enter a complete email address.
      </p>
    </div>
  );
}
