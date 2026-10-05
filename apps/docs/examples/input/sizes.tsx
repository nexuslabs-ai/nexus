'use client';

import { Input } from '@/components/input/input';

export default function InputSizes() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="default" placeholder="Default" aria-label="Default" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  );
}
