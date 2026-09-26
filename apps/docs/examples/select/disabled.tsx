'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

export default function SelectDisabled() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-[180px] nx:flex-col nx:gap-3">
      <Select disabled>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger aria-label="Plan">
          <SelectValue placeholder="Disabled items" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="growth" disabled>
            Growth (sold out)
          </SelectItem>
          <SelectItem value="scale">Scale</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
