import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    'aria-label': 'Accept terms',
  },
};

export const Checked: Story = {
  args: {
    'aria-label': 'Checked option',
    defaultChecked: true,
  },
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
  args: {
    'aria-label': 'Indeterminate option',
    checked: 'indeterminate',
  },
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
  args: {
    'aria-label': 'Disabled checkbox',
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toBeDisabled();

    // Click should not toggle
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const WithLabel: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="nx:text-sm nx:font-medium nx:leading-none nx:peer-disabled:cursor-not-allowed nx:peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
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
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Click to uncheck
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
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
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Space to uncheck
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Checkbox',
    defaultChecked: true,
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
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  // Named function + useId so the id/htmlFor pairs are unique. This showcase is
  // reused by base-variant generation (rendered once per cell, 10×); static ids
  // would collide across cells. See testing-react.md § Caveats.
  render: function AllVariantsShowcase() {
    const uid = React.useId();
    return (
      <div className="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
            States
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-label="Unchecked" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Unchecked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox defaultChecked aria-label="Checked" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox checked="indeterminate" aria-label="Indeterminate" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Indeterminate
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled aria-label="Disabled unchecked" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Disabled
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled defaultChecked aria-label="Disabled checked" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Disabled Checked
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
            With Labels
          </h3>
          <div className="nx:flex nx:flex-col nx:gap-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${uid}-newsletter`} defaultChecked />
              <label
                htmlFor={`${uid}-newsletter`}
                className="nx:text-sm nx:font-medium"
              >
                Subscribe to newsletter
              </label>
            </div>
            <div className="nx:flex nx:items-start nx:gap-2">
              <Checkbox id={`${uid}-terms`} className="nx:mt-0.5" />
              <div className="nx:grid nx:gap-1.5">
                <label
                  htmlFor={`${uid}-terms`}
                  className="nx:text-sm nx:font-medium nx:leading-none"
                >
                  Accept terms and conditions
                </label>
                <p className="nx:text-sm nx:text-muted-foreground">
                  You agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
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
