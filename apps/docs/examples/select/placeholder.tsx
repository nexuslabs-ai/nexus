'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

export default function SelectPlaceholder() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-[180px] nx:flex-col nx:gap-3">
      <Select>
        <SelectTrigger aria-label="Timezone">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="utc">UTC</SelectItem>
          <SelectItem value="est">Eastern Time</SelectItem>
          <SelectItem value="pst">Pacific Time</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="est">
        <SelectTrigger aria-label="Timezone">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="utc">UTC</SelectItem>
          <SelectItem value="est">Eastern Time</SelectItem>
          <SelectItem value="pst">Pacific Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
