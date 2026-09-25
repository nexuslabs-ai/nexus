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
    <div className="nx:grid nx:w-[180px] nx:gap-1.5">
      <Select>
        <SelectTrigger
          aria-label="Region"
          aria-invalid
          aria-describedby="select-invalid-region-error"
        >
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us-east">US East</SelectItem>
          <SelectItem value="eu-west">EU West</SelectItem>
          <SelectItem value="ap-south">AP South</SelectItem>
        </SelectContent>
      </Select>
      <p
        id="select-invalid-region-error"
        className="nx:typography-body-default nx:text-error-subtle-foreground"
      >
        Choose a region to deploy to.
      </p>
    </div>
  );
}
