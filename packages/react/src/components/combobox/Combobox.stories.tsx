import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  type ComboboxOption,
} from './combobox';

const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const groupedFrameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js', group: 'React' },
  { value: 'remix', label: 'Remix', group: 'React' },
  { value: 'sveltekit', label: 'SvelteKit', group: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Vue' },
  { value: 'astro', label: 'Astro', group: 'Meta frameworks' },
];

function FrameworkCombobox({
  inputClassName = 'nx:w-64',
  options = frameworks,
  placeholder = 'Select a framework',
  ...props
}: Omit<React.ComponentProps<typeof Combobox>, 'options'> & {
  inputClassName?: string;
  options?: ComboboxOption[];
  placeholder?: string;
}) {
  return (
    <Combobox options={options} {...props}>
      <ComboboxInput
        aria-label="Framework"
        className={inputClassName}
        placeholder={placeholder}
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList />
      </ComboboxContent>
    </Combobox>
  );
}

function ControlledComboboxExample() {
  const [value, setValue] = React.useState('astro');

  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <FrameworkCombobox value={value} onValueChange={setValue} />
      <output className="nx:typography-body-small nx:text-muted-foreground">
        Selected: {value || 'none'}
      </output>
    </div>
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
  render: () => <FrameworkCombobox />,
};

export const WithDefaultValue: Story = {
  render: () => <FrameworkCombobox defaultValue="next" />,
};

export const ReopenShowsFullList: Story = {
  render: () => <FrameworkCombobox defaultValue="next" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(input).toHaveValue('Next.js');
    await userEvent.click(input);

    const listbox = await within(document.body).findByRole('listbox');

    await expect(
      within(listbox).getByRole('option', { name: 'Next.js' })
    ).toBeInTheDocument();
    await expect(
      within(listbox).getByRole('option', { name: 'SvelteKit' })
    ).toBeInTheDocument();
    await expect(
      within(listbox).getByRole('option', { name: 'Astro' })
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};

export const Controlled: Story = {
  render: () => <ControlledComboboxExample />,
};

export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-64 nx:flex-col nx:gap-3">
      <FrameworkCombobox placeholder="Default" inputClassName="" />
      <Combobox options={frameworks}>
        <ComboboxInput
          aria-label="Small framework"
          size="sm"
          placeholder="Sm"
        />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <Combobox options={frameworks}>
        <ComboboxInput
          aria-label="Large framework"
          size="lg"
          placeholder="Lg"
        />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
    </div>
  ),
};

export const Grouped: Story = {
  render: () => <FrameworkCombobox options={groupedFrameworks} />,
};

export const Disabled: Story = {
  render: () => <FrameworkCombobox disabled defaultValue="next" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(input).toBeDisabled();
    await userEvent.click(input);
    await waitFor(() => {
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const WithDisabledOption: Story = {
  render: () => (
    <FrameworkCombobox
      options={[
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit', disabled: true },
        { value: 'astro', label: 'Astro' },
      ]}
    />
  ),
};

export const InvalidRequiredField: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="framework-required">Framework</FieldLabel>
      <Combobox options={frameworks} required invalid>
        <ComboboxInput
          id="framework-required"
          aria-describedby="framework-required-description framework-required-error"
          aria-label="Framework"
          className="nx:w-64"
          placeholder="Select a framework"
        />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <FieldDescription id="framework-required-description">
        Choose the framework used by this project.
      </FieldDescription>
      <FieldError id="framework-required-error">
        Framework is required.
      </FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-required', 'true');
  },
};

export const KeyboardInteraction: Story = {
  render: () => <FrameworkCombobox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await userEvent.click(input);
    await userEvent.keyboard('rem');

    const listbox = await within(document.body).findByRole('listbox');

    await expect(
      within(listbox).getByRole('option', { name: 'Remix' })
    ).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(input).toHaveValue('Remix');
    });
  },
};

export const ClickInteraction: Story = {
  render: () => <FrameworkCombobox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await userEvent.click(input);
    const listbox = await within(document.body).findByRole('listbox');

    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await expect(input).toHaveValue('Astro');
  },
};

export const ClearButton: Story = {
  render: () => <FrameworkCombobox defaultValue="next" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    const clearButton = canvas.getByRole('button', { name: 'Clear selection' });

    await expect(input).toHaveValue('Next.js');
    await userEvent.click(clearButton);
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  },
};

export const FormReset: Story = {
  render: () => (
    <form className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <FrameworkCombobox name="framework" defaultValue="next" />
      <Button type="reset" variant="outline">
        Reset
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    const hiddenInput = canvasElement.querySelector('input[type="hidden"]');

    await userEvent.click(input);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await expect(input).toHaveValue('Astro');
    await expect(hiddenInput).toHaveValue('astro');

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(input).toHaveValue('Next.js');
      expect(hiddenInput).toHaveValue('next');
    });
  },
};

export const WithDataAttributes: Story = {
  render: () => <FrameworkCombobox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    const field = canvasElement.querySelector('[data-slot="combobox-field"]');

    await expect(field).toHaveAttribute('data-size', 'default');
    await expect(field).toHaveAttribute('data-variant', 'default');
    await expect(input).toHaveAttribute('data-slot', 'combobox-input');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-[520px] nx:grid-cols-2 nx:gap-4">
      <FrameworkCombobox placeholder="Default empty" inputClassName="" />
      <FrameworkCombobox
        defaultValue="next"
        placeholder="Default filled"
        inputClassName=""
      />
      <Combobox options={frameworks}>
        <ComboboxInput
          variant="borderless"
          aria-label="Borderless empty"
          placeholder="Borderless empty"
        />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <Combobox options={frameworks} defaultValue="astro">
        <ComboboxInput
          variant="borderless"
          aria-label="Borderless filled"
          placeholder="Borderless filled"
        />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
    </div>
  ),
};
