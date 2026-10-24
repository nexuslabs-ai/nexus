import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Progress } from '.';

// `aria-label` falls through to the progressbar, so it is not a declared prop.
type ProgressArgs = InstanceType<typeof Progress>['$props'] & {
  'aria-label'?: string;
};

const meta = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Progress shows how far along a task is, such as an upload or a multi-step form. Leave out `model-value` for an animated bar while the total is unknown. Always give it an `aria-label` or `aria-labelledby`.',
      },
    },
  },
  // The bar is full-width, so every story gets a sized container; the label
  // gives the progressbar an accessible name for the automatic a11y checks.
  args: {
    'aria-label': 'Progress',
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="nx:w-80"><story /></div>',
    }),
  ],
  render: (args) => ({
    components: { Progress },
    setup: () => ({ args }),
    template: '<Progress v-bind="args" />',
  }),
} satisfies Meta<ProgressArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

// A typical mid-task bar.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Progress },
    template: `
      <Progress aria-label="Progress" :model-value="60" />
    `,
  }),
};

export const Empty: Story = {
  args: { modelValue: 0 },
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );
    // 0 is determinate (data-state="loading"), not indeterminate — no sweep
    await expect(indicator).toHaveAttribute('data-state', 'loading');
  },
};

export const Full: Story = {
  args: { modelValue: 100 },
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );
    await expect(indicator).toHaveAttribute('data-state', 'complete');
  },
};

// ============================================
// INDETERMINATE
// ============================================

// Value omitted while the total is unknown — the indicator runs the sweep.
export const Indeterminate: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Leave out `model-value` to show a sweeping bar while the total is unknown.',
      },
    },
  },
  render: () => ({
    components: { Progress },
    template: `
      <Progress aria-label="Loading" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar');
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );

    // Reka marks the bar indeterminate and omits the numeric value
    await expect(indicator).toHaveAttribute('data-state', 'indeterminate');
    await expect(progress).not.toHaveAttribute('aria-valuenow');
    await expect(getComputedStyle(indicator as Element).animationName).toBe(
      'nx-progress-indeterminate'
    );
    await expect(getComputedStyle(indicator as Element).animationDuration).toBe(
      '1.5s'
    );
  },
};

// ============================================
// ATTRIBUTE TEST
// ============================================

export const WithDataAttributes: Story = {
  args: { modelValue: 40 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar');
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );

    await expect(progress).toHaveAttribute('data-slot', 'progress');
    await expect(indicator).toHaveAttribute('data-slot', 'progress-indicator');
    // model-value reaches the Reka root, so it reports a determinate value
    await expect(progress).toHaveAttribute('aria-valuenow', '40');
    await expect(indicator).toHaveAttribute('data-state', 'loading');
    await expect(indicator).toHaveClass('nx:duration-fast');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: { story: 'Fill the bar at 0, 25, 50, 75 and 100 percent.' },
    },
  },
  render: () => ({
    components: { Progress },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div v-for="pct in [0, 25, 50, 75, 100]" :key="pct" class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:typography-label-default nx:tabular-nums nx:text-muted-foreground">
            {{ pct }}%
          </span>
          <Progress :model-value="pct" :aria-label="pct + '% complete'" />
        </div>
      </div>
    `,
  }),
};
