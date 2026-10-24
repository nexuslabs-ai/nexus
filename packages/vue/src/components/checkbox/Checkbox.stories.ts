import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { Label } from '../label';

import { Checkbox } from '.';

// `aria-label` falls through to the checkbox, so it is not a declared prop.
type CheckboxArgs = InstanceType<typeof Checkbox>['$props'] & {
  'aria-label'?: string;
};

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    'onUpdate:modelValue': fn(),
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Checkbox selects one or more options, or toggles one setting. Its indeterminate state marks a partly selected group. Pair it with Label, or use ChoiceRow or ChoiceCard for richer option rows.',
      },
    },
  },
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args }),
    template: '<Checkbox v-bind="args" />',
  }),
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const WithLabel: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Checkbox, Label },
    setup: () => ({ termsId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Checkbox :id="termsId" />
        <Label :for="termsId">Accept terms and conditions</Label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    const label = canvas.getByText('Accept terms and conditions');

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(label);
    await expect(checkbox).toBeChecked();
  },
};

export const Checked: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Start checked with `:default-value="true"`.',
      },
    },
  },
  render: () => ({
    components: { Checkbox },
    template: `
      <Checkbox aria-label="Checked option" :default-value="true" />
    `,
  }),
  // Verifies the check indicator (not the minus) is the one that paints when
  // checked — i.e. the group-data CSS that drives the dual indicator emits.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(
      checkbox.querySelector('[data-slot="checkbox-check"]')
    ).toBeVisible();
    await expect(
      checkbox.querySelector('[data-slot="checkbox-minus"]')
    ).not.toBeVisible();
  },
};

export const Indeterminate: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a minus for a partly selected group with `model-value="indeterminate"`.',
      },
    },
  },
  render: () => ({
    components: { Checkbox },
    template: `
      <Checkbox aria-label="Indeterminate option" model-value="indeterminate" />
    `,
  }),
  // The mirror of Checked: the minus paints, the check does not.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    await expect(
      checkbox.querySelector('[data-slot="checkbox-minus"]')
    ).toBeVisible();
    await expect(
      checkbox.querySelector('[data-slot="checkbox-check"]')
    ).not.toBeVisible();
  },
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Disable the checkbox so it cannot be toggled.',
      },
    },
  },
  render: () => ({
    components: { Checkbox },
    template: `
      <Checkbox aria-label="Disabled checkbox" disabled />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toBeDisabled();

    await expect(checkbox).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(checkbox).opacity).toBe('1');

    // Click should not toggle
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  },
};

export const InvalidStates: Story = {
  render: () => ({
    components: { Checkbox, Label },
    setup: () => ({
      uncheckedId: useId(),
      checkedId: useId(),
      indeterminateId: useId(),
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div class="nx:grid nx:gap-2">
          <div class="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              :id="uncheckedId"
              aria-invalid="true"
              :aria-describedby="uncheckedId + '-error'"
            />
            <Label :for="uncheckedId">Unchecked required option</Label>
          </div>
          <p
            :id="uncheckedId + '-error'"
            class="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Choose this option before continuing.
          </p>
        </div>

        <div class="nx:grid nx:gap-2">
          <div class="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              :id="checkedId"
              :default-value="true"
              aria-invalid="true"
              :aria-describedby="checkedId + '-error'"
            />
            <Label :for="checkedId">Checked invalid option</Label>
          </div>
          <p
            :id="checkedId + '-error'"
            class="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Resolve the related error before continuing.
          </p>
        </div>

        <div class="nx:grid nx:gap-2">
          <div class="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              :id="indeterminateId"
              model-value="indeterminate"
              aria-invalid="true"
              :aria-describedby="indeterminateId + '-error'"
            />
            <Label :for="indeterminateId">
              Indeterminate invalid option
            </Label>
          </div>
          <p
            :id="indeterminateId + '-error'"
            class="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Review the partially selected options.
          </p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unchecked = canvas.getByRole('checkbox', {
      name: 'Unchecked required option',
    });
    const checked = canvas.getByRole('checkbox', {
      name: 'Checked invalid option',
    });
    const indeterminate = canvas.getByRole('checkbox', {
      name: 'Indeterminate invalid option',
    });
    const checkedError = canvas.getByText(
      'Resolve the related error before continuing.'
    );

    await expect(unchecked).not.toBeChecked();
    await expect(unchecked).toHaveAttribute('aria-invalid', 'true');
    await expect(unchecked).toHaveAccessibleDescription(
      'Choose this option before continuing.'
    );

    await expect(checked).toBeChecked();
    await expect(checked).toHaveAttribute('aria-invalid', 'true');
    await expect(checked).toHaveAttribute('aria-describedby', checkedError.id);
    await expect(checked).toHaveAccessibleDescription(
      'Resolve the related error before continuing.'
    );

    await expect(indeterminate).toHaveAttribute('data-state', 'indeterminate');
    await expect(indeterminate).toHaveAttribute('aria-invalid', 'true');
    await expect(indeterminate).toHaveAccessibleDescription(
      'Review the partially selected options.'
    );

    // The invalid pressed state can't be triggered deterministically in a play
    // fn, so assert the press token resolves to the -active shade (not the rest
    // shade) via the class contract — for both checked and indeterminate.
    await expect(checked).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background-active'
    );
    await expect(indeterminate).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background-active'
    );
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Toggle checkbox',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    // Initially unchecked
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    // Click to check
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);

    // Click to uncheck
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(false);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Toggle checkbox',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    // Tab to focus
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    // Space to check (checkboxes toggle on Space, not Enter)
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);

    // Space to uncheck
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(false);
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Checkbox',
    defaultValue: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    await expect(checkbox).toHaveAttribute('data-state', 'checked');

    // Indicator renders (and carries its slot) when checked
    const indicator = checkbox.querySelector(
      '[data-slot="checkbox-indicator"]'
    );
    await expect(indicator).toBeInTheDocument();
    await expect(indicator).toHaveAttribute('data-slot', 'checkbox-indicator');

    const check = checkbox.querySelector('[data-slot="checkbox-check"]');
    await expect(check).toBeVisible();
    await expect(check).toHaveAttribute('aria-hidden', 'true');
  },
};

export const VModel: Story = {
  render: () => ({
    components: { Checkbox, Label },
    setup: () => ({ subscribed: ref(true) }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Checkbox id="vmodel-newsletter" v-model="subscribed" />
        <Label for="vmodel-newsletter">Newsletter {{ subscribed ? 'on' : 'off' }}</Label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Newsletter on')).toBeVisible();
    await userEvent.click(canvas.getByRole('checkbox'));
    await expect(canvas.getByText('Newsletter off')).toBeVisible();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Checkbox, Label },
    setup: () => ({ uid: useId() }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div class="nx:flex nx:items-center nx:gap-6">
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-label="Unchecked" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Unchecked</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox :default-value="true" aria-label="Checked" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Checked</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox model-value="indeterminate" aria-label="Indeterminate" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Indeterminate</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled aria-label="Disabled unchecked" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Disabled</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled :default-value="true" aria-label="Disabled checked" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Disabled Checked</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled model-value="indeterminate" aria-label="Disabled indeterminate" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Disabled Mixed</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Validation
          </h3>
          <div class="nx:flex nx:items-center nx:gap-6">
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-invalid="true" aria-label="Unchecked invalid" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Invalid</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox :default-value="true" aria-invalid="true" aria-label="Checked invalid" />
              <span class="nx:typography-label-small nx:text-muted-foreground">Invalid Checked</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With Labels
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-4">
            <div class="nx:flex nx:items-center nx:gap-2">
              <Checkbox :id="uid + '-newsletter'" :default-value="true" />
              <Label :for="uid + '-newsletter'">Subscribe to newsletter</Label>
            </div>
            <div class="nx:flex nx:items-start nx:gap-2">
              <Checkbox
                :id="uid + '-terms'"
                :aria-describedby="uid + '-terms-description'"
                class="nx:mt-0.5"
              />
              <div class="nx:grid nx:gap-1.5">
                <Label :for="uid + '-terms'">Accept terms and conditions</Label>
                <p
                  :id="uid + '-terms-description'"
                  class="nx:typography-body-default nx:text-muted-foreground"
                >
                  You agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
