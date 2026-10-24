import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '.';

// `change` falls through to the `<select>`, so it is not a declared emit.
type NativeSelectArgs = InstanceType<typeof NativeSelect>['$props'] & {
  onChange?: (event: Event) => void;
};

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  parameters: {
    docs: {
      description: {
        component:
          'NativeSelect styles the browser `<select>`, so mobile users get the system picker. Use it for dense forms and long, plain lists. For a styled dropdown use Select, and for search use Combobox.',
      },
    },
  },
} satisfies Meta<NativeSelectArgs>;

export default meta;
type Story = StoryObj<Meta<NativeSelectArgs>>;

// A basic select with a styled closed trigger; the open list is OS-rendered.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Plan" default-value="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
        <NativeSelectOption value="team">Team</NativeSelectOption>
      </NativeSelect>
    `,
  }),
};

// Both sizes: the default control height and the dense `sm`.
export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: { description: { story: 'Use the `sm` size for dense forms.' } },
  },
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <NativeSelect size="default" aria-label="Default size" default-value="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect size="sm" aria-label="Small size" default-value="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </div>
    `,
  }),
};

// Grouped options via optgroup.
export const WithOptGroups: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Group options under labels with NativeSelectOptGroup.',
      },
    },
  },
  render: () => ({
    components: { NativeSelect, NativeSelectOptGroup, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Timezone" default-value="pst">
        <NativeSelectOptGroup label="Americas">
          <NativeSelectOption value="pst">Pacific</NativeSelectOption>
          <NativeSelectOption value="est">Eastern</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Europe">
          <NativeSelectOption value="gmt">London</NativeSelectOption>
          <NativeSelectOption value="cet">Berlin</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    `,
  }),
};

// Invalid state — error boundary + error focus ring.
export const Invalid: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `aria-invalid` to show the error border and focus ring.',
      },
    },
  },
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Plan" aria-invalid="true" default-value="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    `,
  }),
};

// Disabled — semantic disabled tokens on the select and chevron.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable the select to dim it and its chevron and block changes.',
      },
    },
  },
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Plan" default-value="free" disabled>
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    `,
  }),
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
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <NativeSelect
          data-testid="native-select-borderless-default"
          variant="borderless"
          aria-label="Borderless plan"
          default-value="pro"
        >
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          data-testid="native-select-borderless-invalid"
          variant="borderless"
          aria-label="Invalid borderless plan"
          aria-invalid="true"
          default-value="free"
        >
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          data-testid="native-select-borderless-disabled"
          variant="borderless"
          aria-label="Disabled borderless plan"
          default-value="free"
          disabled
        >
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </div>
    `,
  }),
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
    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // A borderless field keeps a transparent border, and the invalid state
    // recolours it in place.
    const restStyles = window.getComputedStyle(base);
    await expect(Number.parseFloat(restStyles.borderTopWidth)).toBeGreaterThan(
      0
    );
    await expect(restStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

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
          '`<select>` has no read-only state, so use `disabled`, or show a locked value as text with a hidden input if it must submit.',
      },
    },
  },
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <div class="nx:flex nx:w-[320px] nx:flex-col nx:gap-4">
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Disabled native select
          </span>
          <NativeSelect
            aria-label="Disabled native plan"
            default-value="pro"
            disabled
          >
            <NativeSelectOption value="free">Free</NativeSelectOption>
            <NativeSelectOption value="pro">Pro</NativeSelectOption>
          </NativeSelect>
        </div>
        <form class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Display-only submission value
          </span>
          <div
            data-testid="native-select-display-only-value"
            class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:px-3 nx:py-2 nx:typography-body-default nx:text-foreground"
          >
            Pro
          </div>
          <input type="hidden" name="plan" value="pro" />
          <p class="nx:typography-body-small nx:text-muted-foreground">
            The hidden input carries the locked value through native form
            submission.
          </p>
        </form>
      </div>
    `,
  }),
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

// Selecting an option updates the value and fires the native change event.
export const ClickInteraction: Story = {
  args: { onChange: fn() },
  render: (args) => ({
    components: { NativeSelect, NativeSelectOption },
    setup: () => ({ args }),
    template: `
      <NativeSelect aria-label="Plan" default-value="free" @change="args.onChange">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
        <NativeSelectOption value="team">Team</NativeSelectOption>
      </NativeSelect>
    `,
  }),
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
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Plan" default-value="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
  },
};

// The wrapper, control, and icon carry data-slot hooks; the control carries data-size.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <NativeSelect aria-label="Plan" default-value="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', {
      name: 'Plan',
    });
    await expect(select).toHaveAttribute('data-slot', 'native-select');
    await expect(select).toHaveAttribute('data-size', 'default');
    await expect(select).toHaveAttribute('data-variant', 'bordered');
    await expect(select).toHaveClass('nx:bg-container');
    await expect(select).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(select);
    await expect(
      canvasElement.querySelector('[data-slot="native-select-wrapper"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="native-select-icon"]')
    ).toBeInTheDocument();
  },
};

export const VModel: Story = {
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    setup: () => ({ plan: ref('free') }),
    template: `
      <div class="nx:grid nx:gap-2">
        <NativeSelect v-model="plan" aria-label="Plan">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <p>Selected: {{ plan }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox')).toHaveValue('free');
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'pro');
    await expect(canvas.getByText('Selected: pro')).toBeVisible();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { NativeSelect, NativeSelectOption },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <NativeSelect size="default" aria-label="Bordered" default-value="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect variant="borderless" aria-label="Borderless" default-value="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect size="sm" aria-label="Small" default-value="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect aria-label="Invalid" aria-invalid="true" default-value="free">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
        <NativeSelect aria-label="Disabled" default-value="free" disabled>
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </div>
    `,
  }),
};
