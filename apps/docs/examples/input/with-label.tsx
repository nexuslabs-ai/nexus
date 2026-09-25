'use client';

import { Input } from '@/components/input/input';

export default function InputWithLabel() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-1.5">
      <label
        htmlFor="input-with-label-name"
        className="nx:typography-label-default nx:text-foreground"
      >
        Full name
      </label>
      <Input id="input-with-label-name" placeholder="Ada Lovelace" />
    </div>
  );
}
