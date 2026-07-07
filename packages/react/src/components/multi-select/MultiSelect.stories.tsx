import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Field, FieldDescription, FieldGroup, FieldLabel } from '../field';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
} from './multi-select';

const frameworkOptions = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
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

async function waitForPopoverSettle() {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 350);
  });
}

async function waitForPopoverToClose() {
  await waitFor(() =>
    expect(
      document.body.querySelector('[data-slot="multi-select-content"]')
    ).toBeNull()
  );
}

function FrameworkItems() {
  return (
    <MultiSelectGroup>
      {frameworkOptions.map((option) => (
        <MultiSelectItem key={option.value} value={option.value}>
          {option.label}
        </MultiSelectItem>
      ))}
    </MultiSelectGroup>
  );
}

function FrameworkMultiSelect({
  label,
  placeholder = 'Select frameworks...',
  defaultValues,
  values,
  onValuesChange,
  triggerProps,
  valueProps,
  contentProps,
  single,
}: {
  label: string;
  placeholder?: string;
  defaultValues?: string[];
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  triggerProps?: React.ComponentProps<typeof MultiSelectTrigger>;
  valueProps?: React.ComponentProps<typeof MultiSelectValue>;
  contentProps?: Omit<
    React.ComponentProps<typeof MultiSelectContent>,
    'children'
  >;
  single?: boolean;
}) {
  return (
    <MultiSelect
      defaultValues={defaultValues}
      values={values}
      onValuesChange={onValuesChange}
      single={single}
    >
      <MultiSelectTrigger aria-label={label} {...triggerProps}>
        <MultiSelectValue placeholder={placeholder} {...valueProps} />
      </MultiSelectTrigger>
      <MultiSelectContent
        search={{
          placeholder: 'Search frameworks...',
          emptyMessage: 'No matching frameworks.',
        }}
        {...contentProps}
      >
        <FrameworkItems />
      </MultiSelectContent>
    </MultiSelect>
  );
}

function ControlledMultiSelectExample({
  onValuesChange,
}: {
  onValuesChange: (values: string[]) => void;
}) {
  const [values, setValues] = React.useState<string[]>(['next']);

  return (
    <FrameworkMultiSelect
      label="Controlled frameworks"
      values={values}
      onValuesChange={(nextValues) => {
        setValues(nextValues);
        onValuesChange(nextValues);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <FrameworkMultiSelect label="Frameworks" />,
};

export const WithDefaultValues: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Selected frameworks"
      defaultValues={['next', 'astro']}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="nx:grid nx:gap-3">
      <FrameworkMultiSelect
        label="Small frameworks"
        defaultValues={['next']}
        triggerProps={{ size: 'sm' }}
        placeholder="Small"
      />
      <FrameworkMultiSelect
        label="Default frameworks"
        defaultValues={['next']}
        triggerProps={{ size: 'default' }}
        placeholder="Default"
      />
      <FrameworkMultiSelect
        label="Large frameworks"
        defaultValues={['next']}
        triggerProps={{ size: 'lg' }}
        placeholder="Large"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('combobox', { name: 'Small frameworks' })
    ).toHaveAttribute('data-size', 'sm');
    await expect(
      canvas.getByRole('combobox', { name: 'Default frameworks' })
    ).toHaveAttribute('data-size', 'default');
    await expect(
      canvas.getByRole('combobox', { name: 'Large frameworks' })
    ).toHaveAttribute('data-size', 'lg');
  },
};

export const Controlled: Story = {
  args: {
    onValuesChange: fn(),
  },
  render: (args) => (
    <ControlledMultiSelectExample
      onValuesChange={args.onValuesChange ?? (() => {})}
    />
  ),
};

export const Grouped: Story = {
  render: () => (
    <MultiSelect>
      <MultiSelectTrigger aria-label="Grouped frameworks">
        <MultiSelectValue placeholder="Select stack..." />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup heading="Frontend">
          <MultiSelectItem value="next">Next.js</MultiSelectItem>
          <MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
          <MultiSelectItem value="remix">Remix</MultiSelectItem>
        </MultiSelectGroup>
        <MultiSelectSeparator />
        <MultiSelectGroup heading="Backend">
          <MultiSelectItem value="rails">Ruby on Rails</MultiSelectItem>
          <MultiSelectItem value="laravel">Laravel</MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const DisabledOption: Story = {
  render: () => (
    <MultiSelect>
      <MultiSelectTrigger aria-label="Frameworks with disabled option">
        <MultiSelectValue placeholder="Select frameworks..." />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          <MultiSelectItem value="next">Next.js</MultiSelectItem>
          <MultiSelectItem value="remix" disabled>
            Remix
          </MultiSelectItem>
          <MultiSelectItem value="astro">Astro</MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Disabled multi select"
      triggerProps={{ disabled: true }}
      placeholder="Disabled"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('combobox', { name: 'Disabled multi select' })
    ).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  render: () => (
    <MultiSelect readOnly defaultValues={['next', 'astro']}>
      <MultiSelectTrigger aria-label="Read only multi select">
        <MultiSelectValue placeholder="Select frameworks..." />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <FrameworkItems />
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const InvalidField: Story = {
  render: () => (
    <FieldGroup>
      <Field data-invalid>
        <FieldLabel htmlFor="frameworks-invalid">Frameworks</FieldLabel>
        <MultiSelect>
          <MultiSelectTrigger
            id="frameworks-invalid"
            aria-invalid
            aria-describedby="frameworks-invalid-description"
          >
            <MultiSelectValue placeholder="Select frameworks..." />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <FrameworkItems />
          </MultiSelectContent>
        </MultiSelect>
        <FieldDescription id="frameworks-invalid-description">
          Choose at least one framework.
        </FieldDescription>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Frameworks' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WithoutSearch: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Frameworks without search"
      contentProps={{ search: false }}
    />
  ),
};

export const EmptyResults: Story = {
  render: () => <FrameworkMultiSelect label="Empty frameworks" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Empty frameworks' });

    await userEvent.click(trigger);
    await userEvent.type(
      await within(document.body).findByPlaceholderText('Search frameworks...'),
      'zzz'
    );
    await expect(
      await within(document.body).findByText('No matching frameworks.')
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    );
    await waitForPopoverToClose();
  },
};

export const CustomBadges: Story = {
  render: () => (
    <MultiSelect defaultValues={['apple', 'banana']}>
      <MultiSelectTrigger aria-label="Fruit">
        <MultiSelectValue placeholder="Select fruit..." clickToRemove={false} />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          <MultiSelectItem value="apple" badgeLabel="Apple">
            Apple
          </MultiSelectItem>
          <MultiSelectItem value="banana" badgeLabel="Banana">
            Banana
          </MultiSelectItem>
          <MultiSelectItem value="cherry" badgeLabel="Cherry">
            Cherry
          </MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const OverflowChips: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Overflow frameworks"
      defaultValues={['next', 'sveltekit', 'nuxt', 'remix', 'astro']}
      valueProps={{ overflowBehavior: 'cutoff' }}
    />
  ),
};

export const NarrowWidth: Story = {
  render: () => (
    <div className="nx:w-52">
      <FrameworkMultiSelect
        label="Narrow frameworks"
        defaultValues={['next', 'sveltekit']}
        placeholder="Frameworks"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: 'Narrow frameworks',
    });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    );
    await waitForPopoverSettle();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      document.body.querySelector('[data-slot="multi-select-content"]')
    ).toHaveAttribute('data-state', 'open');
  },
};

export const SingleSelect: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Single framework"
      placeholder="Select one framework..."
      single
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Single framework' });

    await userEvent.click(trigger);
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Next.js' })
    );

    await expect(within(trigger).getByText('Next.js')).toBeVisible();
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    );
    await waitForPopoverToClose();
  },
};

export const ClickInteraction: Story = {
  render: () => <FrameworkMultiSelect label="Click frameworks" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Click frameworks' });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    );
    await waitForPopoverSettle();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      document.body.querySelector('[data-slot="multi-select-content"]')
    ).toHaveAttribute('data-state', 'open');

    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Next.js' })
    );
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Astro' })
    );

    await expect(within(trigger).getByText('Next.js')).toBeVisible();
    await expect(within(trigger).getByText('Astro')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardInteraction: Story = {
  render: () => <FrameworkMultiSelect label="Keyboard frameworks" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: 'Keyboard frameworks',
    });

    await userEvent.click(trigger);
    await userEvent.type(
      await within(document.body).findByPlaceholderText('Search frameworks...'),
      'sv'
    );
    await userEvent.keyboard('{Enter}');

    await expect(within(trigger).getByText('SvelteKit')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    );
    await waitForPopoverToClose();
  },
};

export const RemoveSelection: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Remove frameworks"
      defaultValues={['next', 'astro']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Remove frameworks' });

    await expect(within(trigger).getByText('Next.js')).toBeVisible();
    await userEvent.click(within(trigger).getByText('Next.js'));
    await expect(within(trigger).queryByText('Next.js')).toBeNull();
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <FrameworkMultiSelect
      label="Data attribute frameworks"
      defaultValues={['next']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: 'Data attribute frameworks',
    });

    await expect(trigger).toHaveAttribute('data-slot', 'multi-select-trigger');
    await expect(trigger).toHaveAttribute('data-size', 'default');
    await expect(trigger).toHaveAttribute('data-variant', 'default');
    await expect(trigger).not.toHaveAttribute('data-empty');
    await expect(trigger).toHaveClass('nx:border-0');
    await expect(trigger).toHaveClass('nx:border-border-default');

    const triggerStyle = window.getComputedStyle(trigger);
    await expect(triggerStyle.borderTopWidth).toBe('0px');
    await expect(triggerStyle.boxShadow).toContain('inset');

    await userEvent.click(trigger);
    const content = document.body.querySelector<HTMLElement>(
      '[data-slot="multi-select-content"]'
    );
    const item = await within(document.body).findByRole('option', {
      name: 'Next.js',
    });

    await expect(content).toHaveAttribute('data-state', 'open');
    await expect(item).toHaveAttribute('data-slot', 'multi-select-item');
    await expect(item).toHaveAttribute('data-selected', 'true');
  },
};
