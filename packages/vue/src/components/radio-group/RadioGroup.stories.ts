import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { Label } from '../label';

import { RadioGroup, RadioGroupItem } from '.';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    'onUpdate:modelValue': fn(),
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'RadioGroup lets the user pick one option from a short, visible list. For a long list, use Select.\n\n- For a plain text label, pair each RadioGroupItem with Label.\n- For a compact clickable row, wrap each item in ChoiceRow.\n- For a card with a title and description, wrap each item in ChoiceCard.',
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup default-value="comfortable" aria-label="Density">
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="default" id="default-default" />
          <Label for="default-default">Default</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="comfortable" id="default-comfortable" />
          <Label for="default-comfortable">Comfortable</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="compact" id="default-compact" />
          <Label for="default-compact">Compact</Label>
        </div>
      </RadioGroup>
    `,
  }),
};

export const VerticalWithLabels: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a short description under each label when options need more context.',
      },
    },
  },
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup default-value="starter" aria-label="Plan">
        <div class="nx:flex nx:items-start nx:gap-3">
          <RadioGroupItem value="starter" id="vertical-starter" class="nx:mt-0.5" />
          <div class="nx:grid nx:gap-1">
            <Label for="vertical-starter">Starter</Label>
            <p class="nx:typography-body-default nx:text-muted-foreground">For individuals getting started.</p>
          </div>
        </div>
        <div class="nx:flex nx:items-start nx:gap-3">
          <RadioGroupItem value="pro" id="vertical-pro" class="nx:mt-0.5" />
          <div class="nx:grid nx:gap-1">
            <Label for="vertical-pro">Pro</Label>
            <p class="nx:typography-body-default nx:text-muted-foreground">For growing teams that need more.</p>
          </div>
        </div>
        <div class="nx:flex nx:items-start nx:gap-3">
          <RadioGroupItem value="enterprise" id="vertical-enterprise" class="nx:mt-0.5" />
          <div class="nx:grid nx:gap-1">
            <Label for="vertical-enterprise">Enterprise</Label>
            <p class="nx:typography-body-default nx:text-muted-foreground">Advanced controls and support.</p>
          </div>
        </div>
      </RadioGroup>
    `,
  }),
};

export const Horizontal: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `orientation="horizontal"` and a flex layout to lay options out in a row.',
      },
    },
  },
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup
        default-value="md"
        orientation="horizontal"
        class="nx:flex nx:gap-4"
        aria-label="Size"
      >
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="sm" id="horizontal-sm" />
          <Label for="horizontal-sm">Small</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="md" id="horizontal-md" />
          <Label for="horizontal-md">Medium</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="lg" id="horizontal-lg" />
          <Label for="horizontal-lg">Large</Label>
        </div>
      </RadioGroup>
    `,
  }),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: { story: 'Disable the group so no option can be selected.' },
    },
  },
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup default-value="one" disabled aria-label="Disabled options">
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="one" id="disabled-one" />
          <Label for="disabled-one">Option one</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="two" id="disabled-two" />
          <Label for="disabled-two">Option two</Label>
        </div>
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('radio', { name: 'Option one' });
    const two = canvas.getByRole('radio', { name: 'Option two' });

    await expect(one).toBeDisabled();
    await expect(two).toBeDisabled();

    // Disabled state uses a semantic border token at full opacity (not a fade).
    await expect(one).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(one).opacity).toBe('1');

    // Clicking a disabled option does not change the selection
    await userEvent.click(two);
    await expect(two).toHaveAttribute('data-state', 'unchecked');
  },
};

export const Invalid: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `aria-invalid` on each item to show the error border and focus ring.',
      },
    },
  },
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup default-value="card" aria-label="Payment method">
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="card" id="invalid-card" aria-invalid="true" />
          <Label for="invalid-card">Credit card</Label>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <RadioGroupItem value="paypal" id="invalid-paypal" aria-invalid="true" />
          <Label for="invalid-paypal">PayPal</Label>
        </div>
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('radio', { name: 'Credit card' });
    const paypal = canvas.getByRole('radio', { name: 'PayPal' });

    await expect(card).toHaveAttribute('aria-invalid', 'true');
    await expect(paypal).toHaveAttribute('aria-invalid', 'true');
    await expect(card).toHaveAttribute('data-state', 'checked');

    // Unchecked invalid → base error border + error focus ring.
    await expect(paypal).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(paypal).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    // Checked invalid → combinatorial override outranks the checked primary border.
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-error-border'
    );

    // Checked invalid also reddens the selection dot — the item drives the
    // color and the dot inherits via currentColor (matches checkbox).
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:text-error-background'
    );
  },
};

export const ClickInteraction: Story = {
  render: (args) => ({
    components: { RadioGroup, RadioGroupItem },
    setup: () => ({ args }),
    template: `
      <RadioGroup v-bind="args" aria-label="Pick one">
        <RadioGroupItem value="one" aria-label="Option one" />
        <RadioGroupItem value="two" aria-label="Option two" />
        <RadioGroupItem value="three" aria-label="Option three" />
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const two = canvas.getByRole('radio', { name: 'Option two' });
    const three = canvas.getByRole('radio', { name: 'Option three' });

    // Nothing is selected initially
    await expect(two).toHaveAttribute('data-state', 'unchecked');

    // Clicking selects the option
    await userEvent.click(two);
    await expect(two).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('two');

    // Selecting another option deselects the first (single-select)
    await userEvent.click(three);
    await expect(three).toHaveAttribute('data-state', 'checked');
    await expect(two).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('three');
  },
};

export const KeyboardInteraction: Story = {
  render: (args) => ({
    components: { RadioGroup, RadioGroupItem },
    setup: () => ({ args }),
    template: `
      <RadioGroup v-bind="args" aria-label="Pick one">
        <RadioGroupItem value="one" aria-label="Option one" />
        <RadioGroupItem value="two" aria-label="Option two" />
        <RadioGroupItem value="three" aria-label="Option three" />
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('radio', { name: 'Option one' });
    const two = canvas.getByRole('radio', { name: 'Option two' });

    // Tab moves focus into the group, landing on the first item
    await userEvent.tab();
    await expect(one).toHaveFocus();

    // Arrow keys move roving focus between options
    await userEvent.keyboard('{ArrowDown}');
    await expect(two).toHaveFocus();

    // Space selects the focused option (await the re-render)
    await userEvent.keyboard(' ');
    await waitFor(() => expect(two).toHaveAttribute('data-state', 'checked'));
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('two');
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup default-value="one" aria-label="Pick one">
        <RadioGroupItem value="one" aria-label="Option one" />
        <RadioGroupItem value="two" aria-label="Option two" />
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAttribute('data-slot', 'radio-group');

    const one = canvas.getByRole('radio', { name: 'Option one' });
    const two = canvas.getByRole('radio', { name: 'Option two' });
    await expect(one).toHaveAttribute('data-slot', 'radio-group-item');
    await expect(one).toHaveAttribute('data-state', 'checked');
    await expect(two).toHaveAttribute('data-state', 'unchecked');

    // The filled dot renders only inside the checked item
    const indicator = one.querySelector('[data-slot="radio-group-indicator"]');
    await expect(indicator).toBeInTheDocument();
  },
};

export const VModel: Story = {
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    setup: () => ({ density: ref('default') }),
    template: `
      <div class="nx:grid nx:gap-3">
        <RadioGroup v-model="density" aria-label="Density">
          <div class="nx:flex nx:items-center nx:gap-2">
            <RadioGroupItem value="default" id="vmodel-default" />
            <Label for="vmodel-default">Default</Label>
          </div>
          <div class="nx:flex nx:items-center nx:gap-2">
            <RadioGroupItem value="compact" id="vmodel-compact" />
            <Label for="vmodel-compact">Compact</Label>
          </div>
        </RadioGroup>
        <p>Density: {{ density }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Density: default')).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', { name: 'Compact' }));
    await expect(canvas.getByText('Density: compact')).toBeVisible();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
    setup: () => ({ uid: useId() }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div class="nx:flex nx:items-center nx:gap-6">
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Unselected state">
                <RadioGroupItem value="a" aria-label="Unselected" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Unselected</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup default-value="a" aria-label="Selected state">
                <RadioGroupItem value="a" aria-label="Selected" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Selected</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Disabled state">
                <RadioGroupItem value="a" disabled aria-label="Disabled" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Disabled</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup default-value="a" aria-label="Disabled selected state">
                <RadioGroupItem value="a" disabled aria-label="Disabled selected" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Disabled selected</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Invalid state">
                <RadioGroupItem value="a" aria-invalid="true" aria-label="Invalid" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Invalid</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup default-value="a" aria-label="Invalid selected state">
                <RadioGroupItem value="a" aria-invalid="true" aria-label="Invalid selected" />
              </RadioGroup>
              <span class="nx:typography-label-small nx:text-muted-foreground">Invalid selected</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With labels
          </h3>
          <RadioGroup default-value="comfortable" aria-label="Density">
            <div class="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="default" :id="uid + '-default'" />
              <Label :for="uid + '-default'">Default</Label>
            </div>
            <div class="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="comfortable" :id="uid + '-comfortable'" />
              <Label :for="uid + '-comfortable'">Comfortable</Label>
            </div>
            <div class="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="compact" :id="uid + '-compact'" />
              <Label :for="uid + '-compact'">Compact</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
