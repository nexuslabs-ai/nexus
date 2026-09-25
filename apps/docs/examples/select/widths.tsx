'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

export default function SelectWidths() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
      <Select>
        <SelectTrigger className="nx:w-[120px]" aria-label="Shirt size">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">SM</SelectItem>
          <SelectItem value="md">MD</SelectItem>
          <SelectItem value="lg">LG</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="nx:w-[180px]" aria-label="Plan">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="team">Team</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="au">Australia</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
