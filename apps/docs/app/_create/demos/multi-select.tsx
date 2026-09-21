'use client';
import type * as React from 'react';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  type MultiSelectProps,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@nexus_ds/react';
function Frameworks({
  placeholder = 'Select frameworks',
  triggerClassName = 'nx:w-80',
  ...props
}: Partial<MultiSelectProps> & {
  placeholder?: string;
  triggerClassName?: string;
}) {
  return (
    <MultiSelect {...props}>
      <MultiSelectTrigger aria-label="Frameworks" className={triggerClassName}>
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent
        searchPlaceholder="Search frameworks…"
        emptyMessage="No frameworks found."
      >
        {FRAMEWORKS.map((option) => (
          <MultiSelectItem key={option.value} value={option.value}>
            {option.label}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  );
}
const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];
function Example0() {
  return <Frameworks />;
}
function Example1() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-md nx:grid-cols-2 nx:gap-4">
      <Frameworks placeholder="Empty" triggerClassName="" />
      <Frameworks
        defaultValues={['react', 'vue']}
        placeholder="Filled"
        triggerClassName=""
      />
      <Frameworks
        defaultValues={['react', 'vue', 'svelte', 'angular']}
        placeholder="Overflow"
        triggerClassName=""
      />
      <Frameworks
        defaultValues={['react', 'svelte']}
        placeholder="Grouped"
        triggerClassName=""
      />
    </div>
  );
}
function Example2() {
  return (
    <MultiSelect defaultValues={['react']}>
      <MultiSelectTrigger
        aria-label="Frameworks"
        disabled
        className="nx:w-full nx:max-w-md"
      >
        <MultiSelectValue placeholder="Select frameworks" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((option) => (
          <MultiSelectItem key={option.value} value={option.value}>
            {option.label}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
