'use client';

import { Input } from '@/components/input/input';

export default function InputDemo() {
  return (
    <Input
      className="nx:max-w-sm"
      type="email"
      placeholder="you@example.com"
      aria-label="Email"
    />
  );
}
