import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field, FieldDescription, FieldGroup, FieldLabel } from '../field';

import { Combobox, type ComboboxOptionInput } from './combobox';

const frameworkOptions: ComboboxOptionInput[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const groupedOptions: ComboboxOptionInput[] = [
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

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'padded',
  },
  args: {
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="nx:w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

function ControlledComboboxExample(
  args: React.ComponentProps<typeof Combobox>
) {
  const [value, setValue] = React.useState('astro');

  return (
    <Combobox
      {...args}
      aria-label="Controlled framework"
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
    'aria-label': 'Framework',
    options: frameworkOptions,
    placeholder: 'Select a framework',
  },
};

export const WithDefaultValue: Story = {
  args: {
    'aria-label': 'Framework with default',
    defaultValue: 'next',
    options: frameworkOptions,
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledComboboxExample {...args} />,
};

export const Grouped: Story = {
  args: {
    'aria-label': 'Grouped framework',
    options: groupedOptions,
    placeholder: 'Select a stack',
  },
};

export const DisabledOption: Story = {
  args: {
    'aria-label': 'Framework with disabled option',
    options: [
      { value: 'next', label: 'Next.js' },
      { value: 'remix', label: 'Remix', disabled: true },
      { value: 'astro', label: 'Astro' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled combobox',
    disabled: true,
    options: frameworkOptions,
    placeholder: 'Disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    'aria-label': 'Read only combobox',
    readOnly: true,
    defaultValue: 'next',
    options: frameworkOptions,
  },
};

export const InvalidField: Story = {
  render: () => (
    <FieldGroup>
      <Field data-invalid>
        <FieldLabel htmlFor="framework-invalid">Framework</FieldLabel>
        <Combobox
          id="framework-invalid"
          aria-invalid
          aria-describedby="framework-invalid-description"
          options={frameworkOptions}
          placeholder="Select a framework"
        />
        <FieldDescription id="framework-invalid-description">
          Choose a supported framework.
        </FieldDescription>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Loading: Story = {
  args: {
    'aria-label': 'Loading framework',
    loading: true,
    options: [],
    loadingText: 'Loading frameworks...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Loading framework' });

    await userEvent.click(input);
    await expect(
      await within(document.body).findByRole('status')
    ).toHaveTextContent('Loading frameworks...');
  },
};

export const EmptyResults: Story = {
  args: {
    'aria-label': 'Empty framework',
    options: frameworkOptions,
    emptyText: 'No matching frameworks.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Empty framework' });

    await userEvent.click(input);
    await userEvent.type(input, 'zzz');
    await expect(
      await within(document.body).findByText('No matching frameworks.')
    ).toBeVisible();
  },
};

export const LongOptionLabels: Story = {
  args: {
    'aria-label': 'Verbose framework',
    options: [
      {
        value: 'enterprise-platform',
        label:
          'Enterprise application platform with a deliberately long label for truncation checks',
      },
      { value: 'short', label: 'Short label' },
    ],
  },
};

export const NarrowWidth: Story = {
  render: () => (
    <div className="nx:w-48">
      <Combobox
        aria-label="Narrow framework"
        options={frameworkOptions}
        placeholder="Framework"
      />
    </div>
  ),
};

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Click framework',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Click framework' });

    await userEvent.click(input);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Remix' })
    );

    await expect(input).toHaveValue('Remix');
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Keyboard framework',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Keyboard framework' });

    await userEvent.click(input);
    await userEvent.type(input, 'sv');
    await userEvent.keyboard('{Enter}');

    await expect(input).toHaveValue('SvelteKit');
  },
};

export const ClearSelection: Story = {
  args: {
    'aria-label': 'Clearable framework',
    defaultValue: 'next',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Clearable framework' });

    await expect(input).toHaveValue('Next.js');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(input).toHaveValue('');
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Data attribute framework',
    defaultValue: 'next',
    options: frameworkOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas
      .getByRole('combobox', {
        name: 'Data attribute framework',
      })
      .closest('[data-slot="combobox"]');

    await expect(root).toHaveAttribute('data-slot', 'combobox');
    await expect(root).not.toHaveAttribute('data-empty');
  },
};
