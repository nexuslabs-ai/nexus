import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from './combobox';

type ComboboxItemData = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

// cmdk lowercases the value passed to onSelect, so keep option values lowercase
// and compare against them directly.
const frameworks: ComboboxItemData[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const groupedFrameworks: ComboboxItemData[] = [
  { value: 'next', label: 'Next.js', group: 'React' },
  { value: 'remix', label: 'Remix', group: 'React' },
  { value: 'sveltekit', label: 'SvelteKit', group: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Vue' },
  { value: 'astro', label: 'Astro', group: 'Other' },
];

const longFrameworks: ComboboxItemData[] = [
  { value: 'next', label: 'Next.js — the React framework for the web' },
  {
    value: 'sveltekit',
    label: 'SvelteKit — the fastest way to build Svelte apps',
  },
  {
    value: 'astro',
    label: 'Astro — the web framework for content-driven sites',
  },
];

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

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: () => <ComboboxExample />,
};

export const WithSelection: Story = {
  render: () => <ComboboxExample defaultValue="next" />,
};

// Raw composition holding open + value state at the call site — the canonical
// controlled usage, and the composition example the pattern is built around.
export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('astro');
    const selectedLabel = frameworks.find((f) => f.value === value)?.label;

    const handleSelect = (next: string) => {
      setValue(next === value ? '' : next);
      setOpen(false);
    };

    return (
      <div className="nx:flex nx:flex-col nx:gap-3">
        <Combobox open={open} onOpenChange={setOpen}>
          <ComboboxTrigger className="nx:w-64">
            <span className="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left">
              {selectedLabel ?? 'Select framework'}
            </span>
          </ComboboxTrigger>
          <ComboboxContent label="Framework">
            <ComboboxInput placeholder="Search framework..." />
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              <ComboboxGroup>
                {frameworks.map((framework) => (
                  <ComboboxItem
                    key={framework.value}
                    value={framework.value}
                    selected={value === framework.value}
                    onSelect={handleSelect}
                  >
                    {framework.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <output className="nx:typography-body-small nx:text-muted-foreground">
          Selected: {value || 'none'}
        </output>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-64 nx:flex-col nx:gap-3">
      <ComboboxExample
        size="sm"
        placeholder="Small"
        triggerClassName="nx:w-full"
      />
      <ComboboxExample placeholder="Default" triggerClassName="nx:w-full" />
      <ComboboxExample
        size="lg"
        placeholder="Large"
        triggerClassName="nx:w-full"
      />
    </div>
  ),
};

export const Grouped: Story = {
  render: () => <ComboboxExample items={groupedFrameworks} />,
};

export const WithDisabledOption: Story = {
  render: () => (
    <ComboboxExample
      items={[
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit', disabled: true },
        { value: 'astro', label: 'Astro' },
      ]}
    />
  ),
};

export const LongLabelsNarrowField: Story = {
  render: () => (
    <ComboboxExample
      items={longFrameworks}
      triggerClassName="nx:w-56"
      defaultValue="sveltekit"
    />
  ),
};

export const Disabled: Story = {
  render: () => <ComboboxExample disabled defaultValue="next" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Next.js' });

    await expect(trigger).toBeDisabled();
    // The disabled trigger sets pointer-events: none; bypass the guard to prove
    // the click is a no-op and the popover stays closed.
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const InvalidField: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="framework-invalid">Framework</FieldLabel>
      <ComboboxExample
        id="framework-invalid"
        aria-invalid
        aria-describedby="framework-invalid-description framework-invalid-error"
      />
      <FieldDescription id="framework-invalid-description">
        Choose the framework used by this project.
      </FieldDescription>
      <FieldError id="framework-invalid-error">
        Framework is required.
      </FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ClickInteraction: Story = {
  render: () => <ComboboxExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Astro' })).toBeInTheDocument();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: () => <ComboboxExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const input = await within(document.body).findByRole('combobox', {
      name: 'Framework',
    });

    await userEvent.type(input, 'rem');
    const listbox = within(document.body).getByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Remix' })
    ).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Remix' })).toBeInTheDocument();
    });
  },
};

export const ClearOnReselect: Story = {
  render: () => <ComboboxExample defaultValue="next" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Next.js' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Next.js' })
    );

    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: 'Select framework' })
      ).toBeInTheDocument();
    });
  },
};

export const EmptyResults: Story = {
  render: () => <ComboboxExample />,
  parameters: {
    a11y: {
      // aria-required-children flags the transient absence of option children
      // while the query matches nothing, which is expected here. All other a11y
      // rules stay enabled. Mirrors the Command Empty story.
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const input = await within(document.body).findByRole('combobox', {
      name: 'Framework',
    });

    await userEvent.type(input, 'zzz');
    await expect(
      await within(document.body).findByText('No framework found.')
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};

export const WithDataAttributes: Story = {
  render: () => <ComboboxExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await expect(trigger).toHaveAttribute('data-slot', 'combobox-trigger');

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await expect(listbox).toHaveAttribute('data-slot', 'combobox-list');
    await expect(
      within(listbox).getByRole('option', { name: 'Next.js' })
    ).toHaveAttribute('data-slot', 'combobox-item');

    await userEvent.keyboard('{Escape}');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-[520px] nx:grid-cols-2 nx:gap-4">
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
  ),
};
