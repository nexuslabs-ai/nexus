import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field, FieldDescription, FieldGroup, FieldLabel } from '../field';

import { MultiSelect, type MultiSelectOptionInput } from './multi-select';

const frameworkOptions: MultiSelectOptionInput[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const groupedOptions: MultiSelectOptionInput[] = [
  {
    label: 'Frontend',
    options: [
      { value: 'next', label: 'Next.js' },
      { value: 'sveltekit', label: 'SvelteKit' },
      { value: 'remix', label: 'Remix' },
    ],
  },
  {
    label: 'Backend',
    options: [
      {
        value: 'rails',
        label: 'Ruby on Rails',
        description: 'Convention-first full-stack framework.',
      },
      {
        value: 'laravel',
        label: 'Laravel',
        description: 'PHP application framework with batteries included.',
      },
    ],
  },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
  },
  args: {
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="nx:w-[420px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

function ControlledMultiSelectExample(
  args: React.ComponentProps<typeof MultiSelect>
) {
  const [value, setValue] = React.useState<string[]>(['next']);

  return (
    <MultiSelect
      {...args}
      aria-label="Controlled frameworks"
      options={frameworkOptions}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        args.onValueChange?.(nextValue);
      }}
    />
  );
}

export const Default: Story = {
  args: {
    'aria-label': 'Frameworks',
    options: frameworkOptions,
    placeholder: 'Select frameworks',
  },
};

export const WithDefaultValues: Story = {
  args: {
    'aria-label': 'Selected frameworks',
    defaultValue: ['next', 'astro'],
    options: frameworkOptions,
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledMultiSelectExample {...args} />,
};

export const Grouped: Story = {
  args: {
    'aria-label': 'Grouped frameworks',
    options: groupedOptions,
    placeholder: 'Select stack',
  },
};

export const DisabledOption: Story = {
  args: {
    'aria-label': 'Frameworks with disabled option',
    options: [
      { value: 'next', label: 'Next.js' },
      { value: 'remix', label: 'Remix', disabled: true },
      { value: 'astro', label: 'Astro' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled multi select',
    disabled: true,
    options: frameworkOptions,
    placeholder: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    'aria-label': 'Read only multi select',
    readOnly: true,
    defaultValue: ['next', 'astro'],
    options: frameworkOptions,
  },
};

export const InvalidField: Story = {
  render: () => (
    <FieldGroup>
      <Field data-invalid>
        <FieldLabel htmlFor="frameworks-invalid">Frameworks</FieldLabel>
        <MultiSelect
          id="frameworks-invalid"
          aria-invalid
          aria-describedby="frameworks-invalid-description"
          options={frameworkOptions}
          placeholder="Select frameworks"
        />
        <FieldDescription id="frameworks-invalid-description">
          Choose at least one framework.
        </FieldDescription>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Frameworks' });

    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Loading: Story = {
  args: {
    'aria-label': 'Loading frameworks',
    loading: true,
    options: [],
    loadingText: 'Loading frameworks...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Loading frameworks' });

    await userEvent.click(input);
    await expect(
      await within(document.body).findByRole('status')
    ).toHaveTextContent('Loading frameworks...');
  },
};

export const EmptyResults: Story = {
  args: {
    'aria-label': 'Empty frameworks',
    options: frameworkOptions,
    emptyText: 'No matching frameworks.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Empty frameworks' });

    await userEvent.click(input);
    await userEvent.type(input, 'zzz');
    await expect(
      await within(document.body).findByText('No matching frameworks.')
    ).toBeVisible();
  },
};

export const OverflowChips: Story = {
  args: {
    'aria-label': 'Overflow frameworks',
    defaultValue: ['next', 'sveltekit', 'nuxt', 'remix', 'astro'],
    maxVisibleValues: 2,
    options: frameworkOptions,
  },
};

export const NarrowWidth: Story = {
  render: () => (
    <div className="nx:w-52">
      <MultiSelect
        aria-label="Narrow frameworks"
        defaultValue={['next', 'sveltekit']}
        options={frameworkOptions}
        placeholder="Frameworks"
      />
    </div>
  ),
};

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Click frameworks',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Click frameworks' });

    await userEvent.click(input);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Next.js' })
    );
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await expect(canvas.getByText('Next.js')).toBeVisible();
    await expect(canvas.getByText('Astro')).toBeVisible();
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Keyboard frameworks',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', {
      name: 'Keyboard frameworks',
    });

    await userEvent.click(input);
    await userEvent.type(input, 'sv');
    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByText('SvelteKit')).toBeVisible();
  },
};

export const RemoveSelection: Story = {
  args: {
    'aria-label': 'Remove frameworks',
    defaultValue: ['next', 'astro'],
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Next.js')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Next.js' })
    );
    await expect(canvas.queryByText('Next.js')).toBeNull();
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Data attribute frameworks',
    defaultValue: ['next'],
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas
      .getByRole('combobox', {
        name: 'Data attribute frameworks',
      })
      .closest('[data-slot="multi-select"]');

    await expect(root).toHaveAttribute('data-slot', 'multi-select');
    await expect(root).not.toHaveAttribute('data-empty');
  },
};
