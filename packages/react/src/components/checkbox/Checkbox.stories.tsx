import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Label } from '../label';

import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Checkbox is the atom for checked, unchecked, and indeterminate state. Pair it with Label for simple inline labels, ChoiceRow for compact option rows, and ChoiceCard for rich title/description option cards.',
      },
    },
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

export const IndicatorCrossFade: Story = {
  render: () => <Checkbox defaultChecked aria-label="Accept" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept' });
    const check = checkbox.querySelector('[data-slot="checkbox-check"]');

    await expect(check).not.toHaveClass('nx:hidden');
    await expect(check).toHaveClass('nx:transition-[opacity,scale]');
    await expect(check).toHaveClass(
      'nx:group-data-[state=checked]:opacity-100'
    );
    await expect(check).toHaveClass('nx:motion-reduce:transition-none');
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

    // Disabled state uses a semantic border token at full opacity (not a fade).
    await expect(checkbox).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(checkbox).opacity).toBe('1');

    // Click should not toggle
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const TouchTarget: Story = {
  render: () => <Checkbox aria-label="Accept" />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('[data-slot="checkbox"]');

    await expect(box).toHaveClass('nx:relative');
    await expect(box).toHaveClass('nx:pointer-coarse:after:-inset-3.5');
  },
};

export const WithLabel: Story = {
  render: function WithLabelStory(args) {
    const termsId = React.useId();

    return (
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox {...args} id={termsId} />
        <Label htmlFor={termsId}>Accept terms and conditions</Label>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    const label = canvas.getByText('Accept terms and conditions');

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(label);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const Invalid: Story = {
  args: {
    defaultChecked: true,
    'aria-invalid': true,
  },
  render: function InvalidStory(args) {
    const checkboxId = React.useId();
    const errorId = React.useId();

    return (
      <div className="nx:grid nx:gap-2">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox {...args} id={checkboxId} aria-describedby={errorId} />
          <Label htmlFor={checkboxId}>Accept terms and conditions</Label>
        </div>
        <p
          id={errorId}
          className="nx:typography-body-default nx:text-error-subtle-foreground"
        >
          Choose at least one required option.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    const error = canvas.getByText('Choose at least one required option.');

    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAttribute('aria-describedby', error.id);
    await expect(checkbox).toHaveAccessibleDescription(
      'Choose at least one required option.'
    );
  },
};

export const InvalidStates: Story = {
  render: function InvalidStatesStory() {
    const uncheckedId = React.useId();
    const checkedId = React.useId();
    const indeterminateId = React.useId();
    const uncheckedErrorId = `${uncheckedId}-error`;
    const checkedErrorId = `${checkedId}-error`;
    const indeterminateErrorId = `${indeterminateId}-error`;

    return (
      <div className="nx:flex nx:flex-col nx:gap-4">
        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={uncheckedId}
              aria-invalid
              aria-describedby={uncheckedErrorId}
            />
            <Label htmlFor={uncheckedId}>Unchecked required option</Label>
          </div>
          <p
            id={uncheckedErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Choose this option before continuing.
          </p>
        </div>

        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={checkedId}
              defaultChecked
              aria-invalid
              aria-describedby={checkedErrorId}
            />
            <Label htmlFor={checkedId}>Checked invalid option</Label>
          </div>
          <p
            id={checkedErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Resolve the related error before continuing.
          </p>
        </div>

        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={indeterminateId}
              checked="indeterminate"
              aria-invalid
              aria-describedby={indeterminateErrorId}
            />
            <Label htmlFor={indeterminateId}>
              Indeterminate invalid option
            </Label>
          </div>
          <p
            id={indeterminateErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Review the partially selected options.
          </p>
        </div>
      </div>
    );
  },
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

    await expect(unchecked).not.toBeChecked();
    await expect(unchecked).toHaveAttribute('aria-invalid', 'true');
    await expect(unchecked).toHaveAccessibleDescription(
      'Choose this option before continuing.'
    );

    await expect(checked).toBeChecked();
    await expect(checked).toHaveAttribute('aria-invalid', 'true');
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
    // shade) via the class contract — for both checked and indeterminate, since
    // the source swaps both.
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
    await expect(indicator).toHaveAttribute('data-slot', 'checkbox-indicator');

    const check = checkbox.querySelector('[data-slot="checkbox-check"]');
    await expect(check).toBeVisible();
    await expect(check).toHaveAttribute('aria-hidden', 'true');
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
    const termsDescriptionId = `${uid}-terms-description`;

    return (
      <div className="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-label="Unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Unchecked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox defaultChecked aria-label="Checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox checked="indeterminate" aria-label="Indeterminate" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Indeterminate
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled aria-label="Disabled unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled defaultChecked aria-label="Disabled checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                disabled
                checked="indeterminate"
                aria-label="Disabled indeterminate"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled Mixed
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Validation
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-invalid aria-label="Unchecked invalid" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                defaultChecked
                aria-invalid
                aria-label="Checked invalid"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid Checked
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With Labels
          </h3>
          <div className="nx:flex nx:flex-col nx:gap-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${uid}-newsletter`} defaultChecked />
              <Label htmlFor={`${uid}-newsletter`}>
                Subscribe to newsletter
              </Label>
            </div>
            <div className="nx:flex nx:items-start nx:gap-2">
              <Checkbox
                id={`${uid}-terms`}
                aria-describedby={termsDescriptionId}
                className="nx:mt-0.5"
              />
              <div className="nx:grid nx:gap-1.5">
                <Label htmlFor={`${uid}-terms`}>
                  Accept terms and conditions
                </Label>
                <p
                  id={termsDescriptionId}
                  className="nx:typography-body-default nx:text-muted-foreground"
                >
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
