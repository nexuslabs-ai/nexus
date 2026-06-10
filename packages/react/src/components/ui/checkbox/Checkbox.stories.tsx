import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconCircleFilled } from '@/lib/icons';

import { Label } from '../label';

import { Checkbox, CheckboxGroup } from './checkbox';

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
type CheckboxGroupStory = StoryObj<typeof CheckboxGroup>;

function CheckboxGroupFrame({ children }: { children: React.ReactNode }) {
  return <div className="nx:w-[478.5px] nx:max-w-full">{children}</div>;
}

function LabelLeadingIcon() {
  return <IconCircleFilled aria-hidden="true" className="nx:size-3.5" />;
}

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
        <p id={errorId} className="nx:text-sm nx:text-error-subtle-foreground">
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
    const uncheckedErrorId = `${uncheckedId}-error`;
    const checkedErrorId = `${checkedId}-error`;

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
            className="nx:text-sm nx:text-error-subtle-foreground"
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
            className="nx:text-sm nx:text-error-subtle-foreground"
          >
            Resolve the related error before continuing.
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
  },
};

// ============================================
// CHECKBOX GROUP STORIES
// ============================================

export const GroupDefault: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
};

export const GroupOutline: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
    variant: 'outline',
    defaultChecked: true,
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
};

export const GroupTrailingCheckbox: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
    checkboxPosition: 'after',
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
};

export const GroupNonFloating: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
    variant: 'outline',
    floating: false,
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
};

export const GroupWithLeadingSlot: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
    variant: 'outline',
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} labelLeading={<LabelLeadingIcon />} />
    </CheckboxGroupFrame>
  ),
};

export const GroupDisabled: CheckboxGroupStory = {
  args: {
    label: 'Label',
    description: 'Description for label',
    required: true,
    variant: 'outline',
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Label' });

    await expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const GroupClickInteraction: CheckboxGroupStory = {
  args: {
    label: 'Email updates',
    description: 'Receive product updates and security alerts.',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Email updates' });

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const GroupKeyboardInteraction: CheckboxGroupStory = {
  args: {
    label: 'Keyboard option',
    description: 'Toggle this option with the Space key.',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} />
    </CheckboxGroupFrame>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Keyboard option' });

    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const GroupWithDataAttributes: CheckboxGroupStory = {
  args: {
    label: 'Data attributes',
    description: 'Data-slot hooks are available on the group parts.',
    variant: 'outline',
    checkboxPosition: 'after',
    floating: false,
    defaultChecked: true,
  },
  render: (args) => (
    <CheckboxGroupFrame>
      <CheckboxGroup {...args} labelLeading={<LabelLeadingIcon />} />
    </CheckboxGroupFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Data attributes' });

    await expect(checkbox).toHaveAttribute('data-slot', 'checkbox-group');
    await expect(checkbox).toHaveAttribute('data-variant', 'outline');
    await expect(checkbox).toHaveAttribute('data-checkbox-position', 'after');
    await expect(checkbox).toHaveAttribute('data-floating', 'false');
    await expect(checkbox).toHaveAttribute('data-state', 'checked');

    const label = checkbox.querySelector('[data-slot="checkbox-group-label"]');
    const description = checkbox.querySelector(
      '[data-slot="checkbox-group-description"]'
    );
    const control = checkbox.querySelector(
      '[data-slot="checkbox-group-control"]'
    );
    const leading = checkbox.querySelector(
      '[data-slot="checkbox-group-label-leading"]'
    );
    const check = checkbox.querySelector('[data-slot="checkbox-group-check"]');

    await expect(label).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
    await expect(control).toBeInTheDocument();
    await expect(leading).toBeInTheDocument();
    await expect(check).toBeVisible();
    await expect(checkbox).toHaveAttribute('aria-labelledby', label?.id);
    await expect(checkbox).toHaveAttribute('aria-describedby', description?.id);
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
  // Named function + useId so the id/htmlFor pairs are unique. This showcase is
  // reused by base-variant generation (rendered once per cell, 10×); static ids
  // would collide across cells. See testing-react.md § Caveats.
  render: function AllVariantsShowcase() {
    const uid = React.useId();
    const termsDescriptionId = `${uid}-terms-description`;

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
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                disabled
                checked="indeterminate"
                aria-label="Disabled indeterminate"
              />
              <span className="nx:text-xs nx:text-muted-foreground">
                Disabled Mixed
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
            Validation
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-invalid aria-label="Unchecked invalid" />
              <span className="nx:text-xs nx:text-muted-foreground">
                Invalid
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                defaultChecked
                aria-invalid
                aria-label="Checked invalid"
              />
              <span className="nx:text-xs nx:text-muted-foreground">
                Invalid Checked
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
            Checkbox Group
          </h3>
          <div className="nx:grid nx:max-w-5xl nx:grid-cols-1 nx:items-start nx:gap-4 nx:md:grid-cols-2">
            <CheckboxGroup
              label="Default"
              description="Description for label"
              required
            />
            <CheckboxGroup
              label="Default checked"
              description="Description for label"
              required
              defaultChecked
            />
            <CheckboxGroup
              label="Trailing"
              description="Checkbox sits after the label and description"
              checkboxPosition="after"
            />
            <CheckboxGroup
              label="Trailing checked"
              description="Trailing checkbox with a checked state"
              checkboxPosition="after"
              defaultChecked
            />
            <CheckboxGroup
              label="Outline"
              description="Floating card with a leading checkbox"
              variant="outline"
              required
            />
            <CheckboxGroup
              label="Outline checked"
              description="Floating card with a selected checkbox"
              variant="outline"
              defaultChecked
            />
            <CheckboxGroup
              label="Trailing outline"
              description="Checkbox sits after the label and description"
              variant="outline"
              checkboxPosition="after"
            />
            <CheckboxGroup
              label="Trailing outline checked"
              description="Floating card with a selected trailing checkbox"
              variant="outline"
              checkboxPosition="after"
              defaultChecked
            />
            <CheckboxGroup
              label="Non-floating"
              description="Outline row rendered with only a bottom border"
              variant="outline"
              floating={false}
            />
            <CheckboxGroup
              label="Trailing row"
              description="Non-floating row with a trailing checkbox"
              variant="outline"
              checkboxPosition="after"
              floating={false}
            />
            <CheckboxGroup
              label="Default row"
              description="Non-floating default row treatment"
              checkboxPosition="after"
              floating={false}
            />
            <CheckboxGroup
              label="Disabled"
              description="Disabled options keep the same row structure"
              variant="outline"
              disabled
              defaultChecked
            />
            <CheckboxGroup
              label="No description"
              variant="outline"
              labelLeading={<LabelLeadingIcon />}
            />
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
                  className="nx:text-sm nx:text-muted-foreground"
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
