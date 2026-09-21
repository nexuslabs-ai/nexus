'use client';
import * as React from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@nexus_ds/react';

import { cn } from '../../../../../packages/react/src/lib/utils';
function ComboboxExample({
  defaultValue = '',
  emptyText = 'No framework found.',
  items = frameworks,
  placeholder = 'Select framework',
  searchPlaceholder = 'Search framework...',
  triggerClassName = 'nx:w-64',
  ...triggerProps
}: {
  defaultValue?: string;
  emptyText?: string;
  items?: ComboboxItemData[];
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
} & Omit<
  React.ComponentProps<typeof ComboboxTrigger>,
  'children' | 'className'
>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);
  const selectedLabel = items.find((item) => item.value === value)?.label;

  const handleSelect = (next: string) => {
    setValue(next === value ? '' : next);
    setOpen(false);
  };

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger className={triggerClassName} {...triggerProps}>
        <span
          className={cn(
            'nx:min-w-0 nx:flex-1 nx:truncate nx:text-left',
            selectedLabel ? undefined : 'nx:text-muted-foreground'
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
      </ComboboxTrigger>
      <ComboboxContent label="Framework">
        <ComboboxInput placeholder={searchPlaceholder} />
        <ComboboxList>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          {toGroups(items).map(({ heading, options }) => (
            <ComboboxGroup key={heading ?? '_root'} heading={heading}>
              {options.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  disabled={option.disabled}
                  selected={value === option.value}
                  onSelect={handleSelect}
                >
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
const frameworks: ComboboxItemData[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];
type ComboboxItemData = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};
function toGroups(items: ComboboxItemData[]) {
  if (!items.some((item) => item.group))
    return [{ heading: undefined, options: items }];

  const groups = new Map<string, ComboboxItemData[]>();

  for (const item of items) {
    const heading = item.group ?? 'Other';
    groups.set(heading, [...(groups.get(heading) ?? []), item]);
  }

  return [...groups.entries()].map(([heading, options]) => ({
    heading,
    options,
  }));
}
function Example0() {
  return <ComboboxExample />;
}
function Example1() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-md nx:grid-cols-2 nx:gap-4">
      <ComboboxExample placeholder="Empty" triggerClassName="nx:w-full" />
      <ComboboxExample
        defaultValue="next"
        placeholder="Filled"
        triggerClassName="nx:w-full"
      />
      <ComboboxExample
        disabled
        defaultValue="astro"
        triggerClassName="nx:w-full"
      />
      <ComboboxExample
        aria-invalid
        placeholder="Invalid"
        triggerClassName="nx:w-full"
      />
    </div>
  );
}
function Example2() {
  return <ComboboxExample disabled defaultValue="next" />;
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
