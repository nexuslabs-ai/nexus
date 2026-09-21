'use client';
import type * as React from 'react';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@nexus_ds/react';
function SixDigitSlots() {
  return (
    <InputOTPGroup>
      {Array.from({ length: 6 }, (_, i) => (
        <InputOTPSlot key={i} index={i} />
      ))}
    </InputOTPGroup>
  );
}
function Example0() {
  const args: React.ComponentProps<typeof InputOTP> = {
    maxLength: 6,
    'aria-label': 'One-time password',
  };
  return (
    <InputOTP {...args}>
      <SixDigitSlots />
    </InputOTP>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <InputOTP maxLength={6} aria-label="One-time password">
        <SixDigitSlots />
      </InputOTP>
      <InputOTP maxLength={6} aria-label="One-time password, split">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <InputOTP maxLength={6} disabled aria-label="One-time password, disabled">
        <SixDigitSlots />
      </InputOTP>
    </div>
  );
}
function Example2() {
  const args: React.ComponentProps<typeof InputOTP> = {
    maxLength: 6,
    'aria-label': 'One-time password',
    disabled: true,
  };
  return (
    <InputOTP {...args}>
      <SixDigitSlots />
    </InputOTP>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
