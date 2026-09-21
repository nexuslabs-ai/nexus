'use client';
import { useState } from 'react';

import { DatePicker } from '@nexus_ds/react';
const REFERENCE_MONTH = new Date(2025, 0, 1);
function Example0() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 0, 15));
  return (
    <DatePicker
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      selected={date}
      onSelect={setDate}
    />
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
    </div>
  );
}
