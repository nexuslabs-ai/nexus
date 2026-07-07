import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  type MultiSelectProps,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
} from './multi-select';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

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

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: () => <Frameworks />,
};

export const WithDefaultValue: Story = {
  render: () => <Frameworks defaultValues={['react', 'svelte']} />,
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = React.useState(['react']);

    return (
      <div className="nx:flex nx:flex-col nx:gap-3">
        <Frameworks values={value} onValuesChange={setValue} />
        <output className="nx:typography-body-small nx:text-muted-foreground">
          Selected: {value.join(', ') || 'none'}
        </output>
      </div>
    );
  },
};

export const Grouped: Story = {
  render: () => (
    <MultiSelect defaultValues={['react']}>
      <MultiSelectTrigger aria-label="Frameworks" className="nx:w-80">
        <MultiSelectValue placeholder="Select frameworks" />
      </MultiSelectTrigger>
      <MultiSelectContent
        searchPlaceholder="Search frameworks…"
        emptyMessage="No frameworks found."
      >
        <MultiSelectGroup heading="Libraries">
          <MultiSelectItem value="react">React</MultiSelectItem>
          <MultiSelectItem value="solid">Solid</MultiSelectItem>
        </MultiSelectGroup>
        <MultiSelectSeparator />
        <MultiSelectGroup heading="Frameworks">
          <MultiSelectItem value="vue">Vue</MultiSelectItem>
          <MultiSelectItem value="svelte">Svelte</MultiSelectItem>
          <MultiSelectItem value="angular">Angular</MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const WrapChips: Story = {
  render: () => (
    <MultiSelect defaultValues={['react', 'vue', 'svelte', 'angular', 'solid']}>
      <MultiSelectTrigger aria-label="Frameworks" className="nx:w-72">
        <MultiSelectValue
          placeholder="Select frameworks"
          overflowBehavior="wrap"
        />
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
  ),
};

export const OverflowCollapse: Story = {
  render: () => (
    <MultiSelect
      defaultValues={['react', 'vue', 'svelte', 'angular', 'solid', 'qwik']}
    >
      <MultiSelectTrigger aria-label="Frameworks" className="nx:w-64">
        <MultiSelectValue
          placeholder="Select frameworks"
          overflowBehavior="cutoff"
        />
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Six chips overflow the 256px field, so measurement collapses the excess
    // into a visible `+N` badge.
    await waitFor(() => expect(canvas.getByText(/^\+\d+$/)).toBeVisible());
  },
};

export const Disabled: Story = {
  render: () => (
    <MultiSelect defaultValues={['react']}>
      <MultiSelectTrigger aria-label="Frameworks" disabled className="nx:w-80">
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // The default value is still labeled while disabled.
    await expect(within(trigger).getByText('React')).toBeInTheDocument();
  },
};

export const WithDisabledOption: Story = {
  render: () => (
    <MultiSelect>
      <MultiSelectTrigger aria-label="Frameworks" className="nx:w-80">
        <MultiSelectValue placeholder="Select frameworks" />
      </MultiSelectTrigger>
      <MultiSelectContent
        searchPlaceholder="Search frameworks…"
        emptyMessage="No frameworks found."
      >
        <MultiSelectItem value="react">React</MultiSelectItem>
        <MultiSelectItem value="vue" disabled>
          Vue
        </MultiSelectItem>
        <MultiSelectItem value="svelte">Svelte</MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    const disabled = await body.findByRole('option', { name: 'Vue' });

    // A disabled option is inert (pointer-events: none) and cannot be selected.
    await expect(disabled).toHaveAttribute('data-disabled', 'true');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(within(trigger).queryByText('Vue')).toBeNull();
  },
};

export const InvalidField: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Frameworks</FieldLabel>
      <MultiSelect>
        <MultiSelectTrigger
          aria-label="Frameworks"
          aria-invalid
          className="nx:w-80"
        >
          <MultiSelectValue placeholder="Select frameworks" />
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
      <FieldDescription>Choose at least one framework.</FieldDescription>
      <FieldError>Framework selection is required.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ClickInteraction: Story = {
  render: () => <Frameworks />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('option', { name: 'React' }));
    await userEvent.click(body.getByRole('option', { name: 'Svelte' }));

    await expect(within(trigger).getByText('React')).toBeInTheDocument();
    await expect(within(trigger).getByText('Svelte')).toBeInTheDocument();
  },
};

export const KeyboardInteraction: Story = {
  render: () => <Frameworks />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    const search = await body.findByPlaceholderText('Search frameworks…');

    // Radix moves focus into the list on open, so cmdk's arrow/type nav is live
    // immediately — no manual click into the search box required.
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.keyboard('sve');
    await userEvent.keyboard('{Enter}');

    await expect(within(trigger).getByText('Svelte')).toBeInTheDocument();
  },
};

export const ChipRemoval: Story = {
  render: () => <Frameworks defaultValues={['react', 'vue']} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(within(trigger).getByText('React')).toBeInTheDocument();
    await userEvent.click(within(trigger).getByText('React'));

    await waitFor(() =>
      expect(within(trigger).queryByText('React')).toBeNull()
    );
    await expect(within(trigger).getByText('Vue')).toBeInTheDocument();
  },
};

export const ChipKeyboardRemoval: Story = {
  render: () => <Frameworks defaultValues={['react', 'vue']} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    // Backspace on the focused field removes the last selected value without
    // reopening the list — the keyboard equivalent of clicking a chip's X.
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Backspace}');

    await waitFor(() => expect(within(trigger).queryByText('Vue')).toBeNull());
    await expect(within(trigger).getByText('React')).toBeInTheDocument();
  },
};

export const SearchEmpty: Story = {
  render: () => <Frameworks />,
  parameters: {
    a11y: {
      // The no-results state legitimately renders an empty listbox; axe's
      // aria-required-children flags the transient absence of option children,
      // which is expected here. All other a11y rules stay enabled.
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    await userEvent.type(
      await body.findByPlaceholderText('Search frameworks…'),
      'zzz'
    );

    await expect(body.getByText('No frameworks found.')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  render: () => (
    <MultiSelect defaultValues={['a', 'b']}>
      <MultiSelectTrigger aria-label="Options" className="nx:w-72">
        <MultiSelectValue placeholder="Select options" />
      </MultiSelectTrigger>
      <MultiSelectContent
        searchPlaceholder="Search…"
        emptyMessage="No options found."
      >
        <MultiSelectItem value="a">
          A remarkably long option label that should truncate inside its chip
        </MultiSelectItem>
        <MultiSelectItem value="b">
          Another verbose option that needs graceful overflow handling
        </MultiSelectItem>
        <MultiSelectItem value="c">Short</MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  ),
};

export const WithDataAttributes: Story = {
  render: () => <Frameworks />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toHaveAttribute('data-slot', 'multi-select-trigger');

    await userEvent.click(trigger);
    const option = await body.findByRole('option', { name: 'React' });

    await expect(option).toHaveAttribute('data-slot', 'multi-select-item');
    await userEvent.click(option);
    await expect(option).toHaveAttribute('data-checked', 'true');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-[720px] nx:grid-cols-2 nx:gap-4">
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
  ),
};
