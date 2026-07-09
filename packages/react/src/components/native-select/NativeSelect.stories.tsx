import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from './native-select';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

// A basic select with a styled closed trigger; the open list is OS-rendered.
export const Default: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="pro">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="team">Team</NativeSelectOption>
    </NativeSelect>
  ),
};

// Both sizes: the default control height and the dense `sm`.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect size="default" aria-label="Default size" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small size" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

// Grouped options via optgroup.
export const WithOptGroups: Story = {
  render: () => (
    <NativeSelect aria-label="Timezone" defaultValue="pst">
      <NativeSelectOptGroup label="Americas">
        <NativeSelectOption value="pst">Pacific</NativeSelectOption>
        <NativeSelectOption value="est">Eastern</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="gmt">London</NativeSelectOption>
        <NativeSelectOption value="cet">Berlin</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

// Invalid state — error boundary + error focus ring.
export const Invalid: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" aria-invalid defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
};

// Disabled — semantic disabled tokens on the select and chevron.
export const Disabled: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free" disabled>
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await expect(select).toBeDisabled();
    await expect(select).toHaveClass('nx:disabled:border-border-disabled');
    await expect(select).toHaveClass('nx:disabled:bg-disabled');
    await expect(select).toHaveClass('nx:disabled:text-disabled-foreground');

    const icon = canvasElement.querySelector(
      '[data-slot="native-select-icon"]'
    );
    await expect(icon).toHaveClass(
      'nx:group-has-[select:disabled]/native-select:text-disabled-foreground'
    );
  },
};

export const BorderlessStates: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect
        data-testid="native-select-borderless-default"
        variant="borderless"
        aria-label="Borderless plan"
        defaultValue="pro"
      >
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        data-testid="native-select-borderless-invalid"
        variant="borderless"
        aria-label="Invalid borderless plan"
        aria-invalid
        defaultValue="free"
      >
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        data-testid="native-select-borderless-disabled"
        variant="borderless"
        aria-label="Disabled borderless plan"
        defaultValue="free"
        disabled
      >
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const base = canvas.getByTestId('native-select-borderless-default');
    const invalid = canvas.getByTestId('native-select-borderless-invalid');
    const disabled = canvas.getByTestId('native-select-borderless-disabled');

    await expect(base).toHaveAttribute('data-variant', 'borderless');
    await expect(base).toHaveClass('nx:border-transparent');
    await expect(base).toHaveClass('nx:bg-control-background');
    await expect(base).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(window.getComputedStyle(invalid).borderTopWidth).toBe('0px');
    await expect(window.getComputedStyle(invalid).boxShadow).not.toBe('none');

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

export const ReadOnlyBoundary: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'NativeSelect wraps a native `select`, which has disabled but no native readOnly state. Use disabled when the control is unavailable. If a locked value must still submit with a form, render a display-only value and a hidden input instead of passing a readOnly prop.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:w-[320px] nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Disabled native select
        </span>
        <NativeSelect
          aria-label="Disabled native plan"
          defaultValue="pro"
          disabled
        >
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </div>
      <form className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Display-only submission value
        </span>
        <div
          data-testid="native-select-display-only-value"
          className="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:px-3 nx:py-2 nx:typography-body-default nx:text-foreground"
        >
          Pro
        </div>
        <input type="hidden" name="plan" value="pro" />
        <p className="nx:typography-body-small nx:text-muted-foreground">
          The hidden input carries the locked value through native form
          submission.
        </p>
      </form>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', {
      name: 'Disabled native plan',
    });
    const hiddenInput = canvasElement.querySelector('input[type="hidden"]');

    await expect(select).toBeDisabled();
    await expect(select).not.toHaveAttribute('readonly');
    await expect(
      canvas.getByTestId('native-select-display-only-value')
    ).toHaveTextContent('Pro');
    await expect(hiddenInput).toHaveAttribute('name', 'plan');
    await expect(hiddenInput).toHaveAttribute('value', 'pro');
  },
};

// Selecting an option updates the value and fires onChange.
export const ClickInteraction: Story = {
  args: { onChange: fn() },
  render: (args) => (
    <NativeSelect
      aria-label="Plan"
      defaultValue="free"
      onChange={args.onChange}
    >
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="team">Team</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await userEvent.selectOptions(select, 'pro');
    await expect(select).toHaveValue('pro');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

// The select is keyboard-reachable via Tab.
export const KeyboardInteraction: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
  },
};

// The wrapper, control, and icon carry data-slot hooks; the control carries data-size.
export const WithDataAttributes: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('[data-slot="native-select"]');
    await expect(select).toBeInTheDocument();
    await expect(select).toHaveAttribute('data-size', 'default');
    await expect(select).toHaveAttribute('data-variant', 'bordered');
    await expect(
      canvasElement.querySelector('[data-slot="native-select-wrapper"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="native-select-icon"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Bordered, small, invalid, and disabled side by side. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect size="default" aria-label="Bordered" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        variant="borderless"
        aria-label="Borderless"
        defaultValue="pro"
      >
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Invalid" aria-invalid defaultValue="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Disabled" defaultValue="free" disabled>
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};
