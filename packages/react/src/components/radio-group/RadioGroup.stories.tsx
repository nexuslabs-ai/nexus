import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Label } from '../label';

import { RadioGroup, RadioGroupItem } from './radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    onValueChange: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="comfortable" aria-label="Density">
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="default" id="default-default" />
        <Label htmlFor="default-default">Default</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="comfortable" id="default-comfortable" />
        <Label htmlFor="default-comfortable">Comfortable</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="compact" id="default-compact" />
        <Label htmlFor="default-compact">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const VerticalWithLabels: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="starter" aria-label="Plan">
      <div className="nx:flex nx:items-start nx:gap-3">
        <RadioGroupItem
          value="starter"
          id="vertical-starter"
          className="nx:mt-0.5"
        />
        <div className="nx:grid nx:gap-1">
          <Label htmlFor="vertical-starter">Starter</Label>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            For individuals getting started.
          </p>
        </div>
      </div>
      <div className="nx:flex nx:items-start nx:gap-3">
        <RadioGroupItem value="pro" id="vertical-pro" className="nx:mt-0.5" />
        <div className="nx:grid nx:gap-1">
          <Label htmlFor="vertical-pro">Pro</Label>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            For growing teams that need more.
          </p>
        </div>
      </div>
      <div className="nx:flex nx:items-start nx:gap-3">
        <RadioGroupItem
          value="enterprise"
          id="vertical-enterprise"
          className="nx:mt-0.5"
        />
        <div className="nx:grid nx:gap-1">
          <Label htmlFor="vertical-enterprise">Enterprise</Label>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Advanced controls and support.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup
      {...args}
      defaultValue="md"
      orientation="horizontal"
      className="nx:flex nx:gap-4"
      aria-label="Size"
    >
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="sm" id="horizontal-sm" />
        <Label htmlFor="horizontal-sm">Small</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="md" id="horizontal-md" />
        <Label htmlFor="horizontal-md">Medium</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="lg" id="horizontal-lg" />
        <Label htmlFor="horizontal-lg">Large</Label>
      </div>
    </RadioGroup>
  ),
};

export const TouchTarget: Story = {
  render: () => (
    <RadioGroup defaultValue="a">
      <RadioGroupItem value="a" aria-label="A" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('[data-slot="radio-group-item"]');

    await expect(item).toHaveClass('nx:relative');
    await expect(item).toHaveClass('nx:pointer-coarse:after:-inset-3.5');
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const Disabled: Story = {
  render: (args) => (
    <RadioGroup
      {...args}
      defaultValue="one"
      disabled
      aria-label="Disabled options"
    >
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="one" id="disabled-one" />
        <Label htmlFor="disabled-one">Option one</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="two" id="disabled-two" />
        <Label htmlFor="disabled-two">Option two</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
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
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(two).toHaveAttribute('data-state', 'unchecked');
  },
};

export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="card" aria-label="Payment method">
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="card" id="invalid-card" aria-invalid />
        <Label htmlFor="invalid-card">Credit card</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="paypal" id="invalid-paypal" aria-invalid />
        <Label htmlFor="invalid-paypal">PayPal</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('radio', { name: 'Credit card' });
    const paypal = canvas.getByRole('radio', { name: 'PayPal' });

    await expect(card).toHaveAttribute('aria-invalid', 'true');
    await expect(paypal).toHaveAttribute('aria-invalid', 'true');
    await expect(card).toHaveAttribute('data-state', 'checked');

    // Unchecked invalid → base error border + error focus ring.
    await expect(paypal).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(paypal).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    // Checked invalid → combinatorial override outranks the checked primary border.
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-border-error'
    );

    // Checked invalid also reddens the selection dot — the item drives the
    // color and the dot inherits via currentColor (matches checkbox).
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:text-error-background'
    );
  },
};

export const ClickInteraction: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Pick one">
      <RadioGroupItem value="one" aria-label="Option one" />
      <RadioGroupItem value="two" aria-label="Option two" />
      <RadioGroupItem value="three" aria-label="Option three" />
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const two = canvas.getByRole('radio', { name: 'Option two' });
    const three = canvas.getByRole('radio', { name: 'Option three' });

    // Nothing is selected initially
    await expect(two).toHaveAttribute('data-state', 'unchecked');

    // Clicking selects the option
    await userEvent.click(two);
    await expect(two).toHaveAttribute('data-state', 'checked');
    await expect(args.onValueChange).toHaveBeenCalledWith('two');

    // Selecting another option deselects the first (single-select)
    await userEvent.click(three);
    await expect(three).toHaveAttribute('data-state', 'checked');
    await expect(two).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onValueChange).toHaveBeenCalledWith('three');
  },
};

export const KeyboardInteraction: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Pick one">
      <RadioGroupItem value="one" aria-label="Option one" />
      <RadioGroupItem value="two" aria-label="Option two" />
      <RadioGroupItem value="three" aria-label="Option three" />
    </RadioGroup>
  ),
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

    // Space selects the focused option (await the controlled re-render)
    await userEvent.keyboard(' ');
    await waitFor(() => expect(two).toHaveAttribute('data-state', 'checked'));
    await expect(args.onValueChange).toHaveBeenCalledWith('two');
  },
};

export const WithDataAttributes: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="one" aria-label="Pick one">
      <RadioGroupItem value="one" aria-label="Option one" />
      <RadioGroupItem value="two" aria-label="Option two" />
    </RadioGroup>
  ),
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

export const IndicatorCrossFade: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="one" aria-label="Pick one">
      <RadioGroupItem value="one" aria-label="Option one" />
      <RadioGroupItem value="two" aria-label="Option two" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('radio', { name: 'Option one' });
    const two = canvas.getByRole('radio', { name: 'Option two' });

    const selectedDot = one.querySelector('[data-slot="radio-group-dot"]');
    const unselectedDot = two.querySelector('[data-slot="radio-group-dot"]');

    await expect(selectedDot).toBeInTheDocument();
    await expect(unselectedDot).toBeInTheDocument();
    await expect(selectedDot).toHaveClass('nx:transition-[opacity,scale]');
    await expect(selectedDot).toHaveClass(
      'nx:group-data-[state=checked]:opacity-100'
    );
    await expect(selectedDot).toHaveClass('nx:motion-reduce:transition-none');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  // Named function + useId keeps the repeated id/htmlFor pairs unique within
  // this showcase.
  render: function AllVariantsShowcase() {
    const uid = React.useId();
    return (
      <div className="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Unselected state">
                <RadioGroupItem value="a" aria-label="Unselected" />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Unselected
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup defaultValue="a" aria-label="Selected state">
                <RadioGroupItem value="a" aria-label="Selected" />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Selected
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Disabled state">
                <RadioGroupItem value="a" disabled aria-label="Disabled" />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup defaultValue="a" aria-label="Disabled selected state">
                <RadioGroupItem
                  value="a"
                  disabled
                  aria-label="Disabled selected"
                />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled selected
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup aria-label="Invalid state">
                <RadioGroupItem value="a" aria-invalid aria-label="Invalid" />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <RadioGroup defaultValue="a" aria-label="Invalid selected state">
                <RadioGroupItem
                  value="a"
                  aria-invalid
                  aria-label="Invalid selected"
                />
              </RadioGroup>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid selected
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With labels
          </h3>
          <RadioGroup defaultValue="comfortable" aria-label="Density">
            <div className="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="default" id={`${uid}-default`} />
              <Label htmlFor={`${uid}-default`}>Default</Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="comfortable" id={`${uid}-comfortable`} />
              <Label htmlFor={`${uid}-comfortable`}>Comfortable</Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <RadioGroupItem value="compact" id={`${uid}-compact`} />
              <Label htmlFor={`${uid}-compact`}>Compact</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
