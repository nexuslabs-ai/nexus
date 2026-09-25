'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

export default function SelectInvalid() {
  return (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Region" aria-invalid>
        <SelectValue placeholder="Select a region" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us-east">US East</SelectItem>
        <SelectItem value="eu-west">EU West</SelectItem>
        <SelectItem value="ap-south">AP South</SelectItem>
      </SelectContent>
    </Select>
  );
}
