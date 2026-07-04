import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
};

export const Checked: Story = {
  args: {
    'aria-label': 'Toggle switch',
    defaultChecked: true,
  },
};

export const TouchTarget: Story = {
  render: () => <Switch aria-label="Wifi" />,
  play: async ({ canvasElement }) => {
    const sw = canvasElement.querySelector('[data-slot="switch"]');

    await expect(sw).toHaveClass('nx:relative');
    await expect(sw).toHaveClass('nx:pointer-coarse:after:-inset-3');
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Toggle switch',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();
    // An unchecked-disabled switch recolors its border via a semantic disabled
    // token at full opacity (not a fade).
    await expect(switchEl).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const DisabledChecked: Story = {
  args: {
    'aria-label': 'Toggle switch',
    disabled: true,
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();
    // A checked-disabled switch fills via a semantic primary-disabled token at
    // full opacity (not a fade).
    await expect(switchEl).toHaveClass(
      'nx:data-[state=checked]:disabled:bg-primary-disabled'
    );
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
  },
  render: function InvalidStory(args) {
    const switchId = React.useId();
    const errorId = React.useId();

    return (
      <div className="nx:grid nx:gap-2">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Switch {...args} id={switchId} aria-describedby={errorId} />
          <label htmlFor={switchId} className="nx:typography-label-default">
            Enable required setting
          </label>
        </div>
        <p
          id={errorId}
          className="nx:typography-body-default nx:text-error-subtle-foreground"
        >
          This setting must be enabled to continue.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    const error = canvas.getByText('This setting must be enabled to continue.');

    await expect(switchEl).toHaveAttribute('aria-invalid', 'true');
    await expect(switchEl).toHaveAttribute('aria-describedby', error.id);
    await expect(switchEl).toHaveAccessibleDescription(
      'This setting must be enabled to continue.'
    );
    await expect(switchEl).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-primary-background'
    );
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const Small: Story = {
  args: {
    size: 'sm',
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toHaveAttribute('data-size', 'sm');

    // The smaller control still toggles (geometry-only size change).
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const WithLabel: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="nx:typography-label-default nx:leading-none nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground"
      >
        Airplane Mode
      </label>
    </div>
  ),
};

export const WithLabelAndDescription: Story = {
  render: (_args) => (
    <div className="nx:grid nx:grid-cols-[auto_1fr] nx:items-center nx:gap-x-3 nx:gap-y-1.5">
      <Switch id="notifications" />
      <label
        htmlFor="notifications"
        className="nx:typography-label-default nx:leading-none"
      >
        Enable Notifications
      </label>
      <p className="nx:col-start-2 nx:typography-body-default nx:text-muted-foreground">
        Receive notifications when someone mentions you.
      </p>
    </div>
  ),
};

export const LabelOnLeft: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4">
      <div className="nx:space-y-0.5">
        <label
          htmlFor="marketing"
          className="nx:typography-label-default nx:leading-none"
        >
          Marketing emails
        </label>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Receive emails about new products and features.
        </p>
      </div>
      <Switch id="marketing" />
    </div>
  ),
};

// ============================================
// CONTROLLED EXAMPLE
// ============================================

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = React.useState(false);

    return (
      <div className="nx:flex nx:flex-col nx:items-center nx:gap-4">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Switch
            id="controlled"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <label htmlFor="controlled" className="nx:typography-label-default">
            Controlled Switch
          </label>
        </div>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Switch is {checked ? 'on' : 'off'}
        </p>
      </div>
    );
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Initially unchecked
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');

    // Click to toggle on
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Click to toggle off
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Tab to focus
    await userEvent.tab();
    await expect(switchEl).toHaveFocus();

    // Space to toggle on
    await userEvent.keyboard(' ');
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Space to toggle off
    await userEvent.keyboard(' ');
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    'aria-label': 'Disabled switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();

    // Click should not toggle
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Check data-slot attribute
    await expect(switchEl).toHaveAttribute('data-slot', 'switch');

    // Default size resolves to data-size="default"
    await expect(switchEl).toHaveAttribute('data-size', 'default');

    // Check thumb has data-slot
    const thumb = switchEl.querySelector('[data-slot="switch-thumb"]');
    await expect(thumb).toBeInTheDocument();
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
              <Switch aria-label="Unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Unchecked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch defaultChecked aria-label="Checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch disabled aria-label="Disabled unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch disabled defaultChecked aria-label="Disabled checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled Checked
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Sizes
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch size="default" aria-label="Default size" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Default
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch
                size="default"
                defaultChecked
                aria-label="Default size checked"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Default checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch size="sm" aria-label="Small size" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Small
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Switch
                size="sm"
                defaultChecked
                aria-label="Small size checked"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Small checked
              </span>
            </div>
          </div>
          <div className="nx:mt-6 nx:flex nx:flex-col nx:gap-4">
            <div className="nx:grid nx:grid-cols-[auto_1fr] nx:items-center nx:gap-x-3 nx:gap-y-1.5">
              <Switch size="default" id={`${uid}-desc-default`} />
              <label
                htmlFor={`${uid}-desc-default`}
                className="nx:typography-label-default nx:leading-none"
              >
                Default with description
              </label>
              <p className="nx:col-start-2 nx:typography-body-default nx:text-muted-foreground">
                The control centers with the label&apos;s first line.
              </p>
            </div>
            <div className="nx:grid nx:grid-cols-[auto_1fr] nx:items-center nx:gap-x-3 nx:gap-y-1.5">
              <Switch size="sm" id={`${uid}-desc-sm`} />
              <label
                htmlFor={`${uid}-desc-sm`}
                className="nx:typography-label-default nx:leading-none"
              >
                Small with description
              </label>
              <p className="nx:col-start-2 nx:typography-body-default nx:text-muted-foreground">
                Alignment holds at the smaller size too.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With Labels
          </h3>
          <div className="nx:flex nx:flex-col nx:gap-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Switch id={`${uid}-label-right`} />
              <label
                htmlFor={`${uid}-label-right`}
                className="nx:typography-label-default"
              >
                Label on right
              </label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <label
                htmlFor={`${uid}-label-left`}
                className="nx:typography-label-default"
              >
                Label on left
              </label>
              <Switch id={`${uid}-label-left`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Settings Pattern
          </h3>
          <div className="nx:w-80 nx:space-y-4">
            <div className="nx:flex nx:items-center nx:justify-between">
              <label
                htmlFor={`${uid}-setting1`}
                className="nx:typography-label-default"
              >
                Enable feature
              </label>
              <Switch id={`${uid}-setting1`} defaultChecked />
            </div>
            <div className="nx:flex nx:items-center nx:justify-between">
              <label
                htmlFor={`${uid}-setting2`}
                className="nx:typography-label-default"
              >
                Show previews
              </label>
              <Switch id={`${uid}-setting2`} />
            </div>
            <div className="nx:flex nx:items-center nx:justify-between">
              <label
                htmlFor={`${uid}-setting3`}
                className="nx:typography-label-default nx:text-muted-foreground"
              >
                Beta features (disabled)
              </label>
              <Switch id={`${uid}-setting3`} disabled />
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
