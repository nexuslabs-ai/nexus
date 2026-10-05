'use client';

import { Input } from '@/components/input/input';

export default function InputVariants() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
      <Input variant="bordered" placeholder="Bordered" aria-label="Bordered" />
      <Input
        variant="borderless"
        placeholder="Borderless"
        aria-label="Borderless"
      />
    </div>
  );
}
