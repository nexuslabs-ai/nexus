import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectList,
  type MultiSelectOption,
  MultiSelectSearch,
  MultiSelectTrigger,
} from './multi-select';

const technologies: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'next', label: 'Next.js', keywords: ['framework'] },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'tailwind', label: 'Tailwind CSS' },
];

const groupedTechnologies: MultiSelectOption[] = [
  { value: 'react', label: 'React', group: 'Libraries' },
  { value: 'tailwind', label: 'Tailwind CSS', group: 'Libraries' },
  { value: 'next', label: 'Next.js', group: 'Frameworks' },
  { value: 'remix', label: 'Remix', group: 'Frameworks' },
  { value: 'sveltekit', label: 'SvelteKit', group: 'Frameworks' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Frameworks' },
];

function TechnologyMultiSelect({
  options = technologies,
  placeholder = 'Select technologies',
  triggerClassName = 'nx:w-80',
  ...props
}: Omit<React.ComponentProps<typeof MultiSelect>, 'options'> & {
  options?: MultiSelectOption[];
  placeholder?: string;
  triggerClassName?: string;
}) {
  return (
    <MultiSelect options={options} {...props}>
      <MultiSelectTrigger
        aria-label="Technologies"
        className={triggerClassName}
        placeholder={placeholder}
      />
      <MultiSelectContent>
        <MultiSelectSearch aria-label="Search technologies" />
        <MultiSelectEmpty>No technologies found.</MultiSelectEmpty>
        <MultiSelectList />
      </MultiSelectContent>
    </MultiSelect>
  );
}

function ControlledMultiSelectExample() {
  const [value, setValue] = React.useState(['react', 'tailwind']);

  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <TechnologyMultiSelect value={value} onValueChange={setValue} />
      <output className="nx:typography-body-small nx:text-muted-foreground">
        Selected: {value.join(', ') || 'none'}
      </output>
    </div>
  );
}

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: () => <TechnologyMultiSelect />,
};

export const WithDefaultValue: Story = {
  render: () => <TechnologyMultiSelect defaultValue={['react', 'next']} />,
};

export const Controlled: Story = {
  render: () => <ControlledMultiSelectExample />,
};

export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <TechnologyMultiSelect placeholder="Default" triggerClassName="" />
      <MultiSelect options={technologies}>
        <MultiSelectTrigger
          aria-label="Small technologies"
          size="sm"
          placeholder="Small"
        />
        <MultiSelectContent>
          <MultiSelectSearch aria-label="Search small technologies" />
          <MultiSelectEmpty>No technologies found.</MultiSelectEmpty>
          <MultiSelectList />
        </MultiSelectContent>
      </MultiSelect>
      <MultiSelect options={technologies}>
        <MultiSelectTrigger
          aria-label="Large technologies"
          size="lg"
          placeholder="Large"
        />
        <MultiSelectContent>
          <MultiSelectSearch aria-label="Search large technologies" />
          <MultiSelectEmpty>No technologies found.</MultiSelectEmpty>
          <MultiSelectList />
        </MultiSelectContent>
      </MultiSelect>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => <TechnologyMultiSelect options={groupedTechnologies} />,
};

export const Disabled: Story = {
  render: () => (
    <TechnologyMultiSelect
      disabled
      name="technologies"
      defaultValue={['next']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });
    const hiddenInput = canvasElement.querySelector('input[type="hidden"]');

    await expect(trigger).toBeDisabled();
    await expect(hiddenInput).toBeDisabled();
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const WithDisabledOption: Story = {
  render: () => (
    <TechnologyMultiSelect
      options={[
        { value: 'react', label: 'React' },
        { value: 'next', label: 'Next.js', disabled: true },
        { value: 'astro', label: 'Astro' },
      ]}
    />
  ),
};

export const InvalidRequiredField: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Technologies</FieldLabel>
      <TechnologyMultiSelect required invalid />
      <FieldDescription>Choose at least one technology.</FieldDescription>
      <FieldError>Technology selection is required.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const validationInput = canvasElement.querySelector(
      '[data-slot="multi-select"] input[required]'
    );
    const field = canvasElement.querySelector(
      '[data-slot="multi-select-field"]'
    );

    await expect(field).toHaveAttribute('data-invalid', 'true');
    await expect(validationInput).toBeRequired();
  },
};

export const ClickInteraction: Story = {
  render: () => <TechnologyMultiSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');

    await userEvent.click(
      within(listbox).getByRole('option', { name: 'React' })
    );
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Tailwind CSS' })
    );

    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('Tailwind CSS')).toBeInTheDocument();
  },
};

export const KeyboardInteraction: Story = {
  render: () => <TechnologyMultiSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });

    await userEvent.click(trigger);
    const search = await within(document.body).findByRole('textbox', {
      name: 'Search technologies',
    });

    await userEvent.keyboard('tailwind css');
    await expect(search).toHaveValue('tailwind css');
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await expect(canvas.getByText('Tailwind CSS')).toBeInTheDocument();
  },
};

export const ChipRemoval: Story = {
  render: () => <TechnologyMultiSelect defaultValue={['react']} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove React' });

    await expect(canvas.getByText('React')).toBeInTheDocument();
    await userEvent.click(remove);

    await waitFor(() => {
      expect(canvas.queryByText('React')).toBeNull();
    });
  },
};

export const FormReset: Story = {
  render: () => (
    <form className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <TechnologyMultiSelect
        name="technologies"
        defaultValue={['react', 'next']}
      />
      <Button type="reset" variant="outline">
        Reset
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await expect(
      canvasElement.querySelectorAll('input[type="hidden"]')
    ).toHaveLength(3);

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(
        canvasElement.querySelectorAll('input[type="hidden"]')
      ).toHaveLength(2);
    });
  },
};

export const SearchEmpty: Story = {
  render: () => <TechnologyMultiSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });

    await userEvent.click(trigger);
    const search = await within(document.body).findByRole('textbox', {
      name: 'Search technologies',
    });

    await userEvent.type(search, 'missing');
    await expect(
      within(document.body).getByText('No technologies found.')
    ).toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => <TechnologyMultiSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Technologies' });
    const field = canvasElement.querySelector(
      '[data-slot="multi-select-field"]'
    );

    await expect(field).toHaveAttribute('data-size', 'default');
    await expect(field).toHaveAttribute('data-variant', 'default');
    await expect(trigger).toHaveAttribute('data-slot', 'multi-select-trigger');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-[680px] nx:grid-cols-2 nx:gap-4">
      <TechnologyMultiSelect placeholder="Default empty" triggerClassName="" />
      <TechnologyMultiSelect
        defaultValue={['react', 'next']}
        placeholder="Default filled"
        triggerClassName=""
      />
      <MultiSelect options={technologies}>
        <MultiSelectTrigger
          aria-label="Borderless empty"
          variant="borderless"
          placeholder="Borderless empty"
        />
        <MultiSelectContent>
          <MultiSelectSearch aria-label="Search borderless empty" />
          <MultiSelectEmpty>No technologies found.</MultiSelectEmpty>
          <MultiSelectList />
        </MultiSelectContent>
      </MultiSelect>
      <MultiSelect options={technologies} defaultValue={['astro']}>
        <MultiSelectTrigger
          aria-label="Borderless filled"
          variant="borderless"
          placeholder="Borderless filled"
        />
        <MultiSelectContent>
          <MultiSelectSearch aria-label="Search borderless filled" />
          <MultiSelectEmpty>No technologies found.</MultiSelectEmpty>
          <MultiSelectList />
        </MultiSelectContent>
      </MultiSelect>
    </div>
  ),
};
