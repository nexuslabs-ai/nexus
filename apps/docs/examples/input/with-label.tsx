'use client';

import { Input } from '@/components/input/input';
import { Label } from '@/components/label/label';

export default function InputWithLabel() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-1.5">
      <Label htmlFor="input-with-label-name">Full name</Label>
      <Input id="input-with-label-name" placeholder="Ada Lovelace" />
    </div>
  );
}
