'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

export default function SelectVariants() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-[180px] nx:flex-col nx:gap-3">
      <Select>
        <SelectTrigger variant="bordered" aria-label="Bordered">
          <SelectValue placeholder="Bordered" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger variant="borderless" aria-label="Borderless">
          <SelectValue placeholder="Borderless" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
