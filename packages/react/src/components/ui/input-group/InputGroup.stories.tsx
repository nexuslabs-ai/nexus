import type { Meta, StoryObj } from '@storybook/react';
import { IconEye, IconMail, IconSearch, IconX } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { expectHeightPinned } from '../../../stories/test-utils';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group';

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

// A search field: a leading icon addon and the input.
export const Default: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
    </InputGroup>
  ),
};

// A trailing button addon.
export const WithButton: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupInput aria-label="Email" placeholder="you@example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// A text prefix addon.
export const WithText: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Site URL" placeholder="nexus.dev" />
    </InputGroup>
  ),
};

// Addons at each alignment — inline start/end and stacked block start/end.
export const Alignments: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Inline start" placeholder="inline-start" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Inline end" placeholder="inline-end" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Bio</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Bio" placeholder="block-start" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="With counter" placeholder="block-end" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// The compact in-field button sizes.
export const ButtonSizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupInput aria-label="Text buttons" placeholder="xs / sm" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">xs</InputGroupButton>
          <InputGroupButton size="sm">sm</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Icon buttons" placeholder="icon sizes" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Show">
            <IconEye aria-hidden />
          </InputGroupButton>
          <InputGroupButton size="icon-sm" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    await document.fonts.ready;
    buttons.forEach((button) => {
      expect(button).not.toHaveClass('nx:py-control-md');
      expect(getComputedStyle(button).paddingTop).toBe('0px');
      expect(getComputedStyle(button).paddingBottom).toBe('0px');
    });
  },
};

// A textarea with a stacked footer addon.
export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown supported</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// The group is a role=group field; control, addon, text, and button carry
// data-slot hooks, and the control mirrors Input's data-size.
export const WithDataAttributes: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Site URL" placeholder="nexus.dev" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Clear">Clear</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="input-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(
      canvasElement.querySelector('[data-slot="input-group-addon"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="input-group-text"]')
    ).toBeInTheDocument();

    const control = canvasElement.querySelector(
      '[data-slot="input-group-control"]'
    );
    await expect(control).toBeInTheDocument();
    await expect(control).toHaveAttribute('data-size', 'default');

    const button = canvasElement.querySelector(
      '[data-slot="input-group-button"]'
    );
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('data-size', 'xs');
  },
};

// Clicking an in-field button fires its handler (event bubbles to the group).
export const ClickInteraction: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <InputGroup className="nx:w-80" onClick={args.onClick}>
      <InputGroupInput aria-label="Email" placeholder="you@example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// Typing into the control updates its value.
export const KeyboardInteraction: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'nexus');
    await expect(input).toHaveValue('nexus');
  },
};

// A disabled control + button; the group dims its addons via data-disabled.
export const Disabled: Story = {
  render: () => (
    <InputGroup className="nx:w-80" data-disabled="true">
      <InputGroupInput
        aria-label="Email"
        placeholder="you@example.com"
        disabled
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton disabled>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Subscribe' })
    ).toBeDisabled();
  },
};

// The three sizes — sm / default (implicit) / lg — match standalone Input.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="sm" aria-label="Small" placeholder="sm" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Default"
          placeholder="default (implicit)"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="lg" aria-label="Large" placeholder="lg" />
      </InputGroup>
    </div>
  ),
};

// The visible frame takes the control's size height (h-8 / h-10 / h-12) so the
// group is never taller than a standalone Input. Heights follow the active
// spacing mode like Input, so the px pin is scoped to vega.
export const HeightsFollowModes: Story = {
  parameters: { a11y: { test: 'off' } },
  render: () => (
    <div
      data-style="vega"
      className="nx:flex nx:w-80 nx:flex-col nx:gap-4 nx:bg-background nx:p-10"
    >
      <InputGroup data-testid="ig-sm">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="sm" aria-label="Small" placeholder="sm" />
      </InputGroup>
      <InputGroup data-testid="ig-default">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Default" placeholder="default" />
      </InputGroup>
      <InputGroup data-testid="ig-lg">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="lg" aria-label="Large" placeholder="lg" />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const groupSelector = { selector: '[data-slot="input-group"]' };

    // Child carries Input's data-size; the frame follows it.
    await expect(
      canvas.getByRole('textbox', { name: 'Small' })
    ).toHaveAttribute('data-size', 'sm');
    await expect(
      canvas.getByRole('textbox', { name: 'Default' })
    ).toHaveAttribute('data-size', 'default');
    await expect(
      canvas.getByRole('textbox', { name: 'Large' })
    ).toHaveAttribute('data-size', 'lg');

    // Outer group heights (vega): h-8 / h-10 / h-12.
    await expectHeightPinned(canvas, 'ig-sm', 32, groupSelector);
    await expectHeightPinned(canvas, 'ig-default', 40, groupSelector);
    await expectHeightPinned(canvas, 'ig-lg', 48, groupSelector);
  },
};

// Hover + disabled map to Input's semantic state tokens — no opacity dimming.
export const VisualStateTokens: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-hover">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Hover surface" placeholder="hover" />
      </InputGroup>
      <InputGroup data-testid="ig-disabled" data-disabled="true">
        <InputGroupAddon data-testid="ig-disabled-addon">
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Disabled"
          placeholder="disabled"
          disabled
        />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hover = canvas.getByTestId('ig-hover');
    const disabled = canvas.getByTestId('ig-disabled');
    const addon = canvas.getByTestId('ig-disabled-addon');

    // Token-name sentinel: synthetic userEvent can't toggle CSS :hover.
    await expect(hover).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-background-hover'
    );

    // Disabled = semantic tokens, not opacity (opacity stays 1). No computed
    // bg check: bg-disabled / background / -hover collapse in dark mode.
    await expect(disabled).toHaveClass('nx:data-[disabled=true]:bg-disabled');
    await expect(disabled).toHaveClass(
      'nx:data-[disabled=true]:border-border-disabled'
    );
    await expect(window.getComputedStyle(addon).opacity).toBe('1');
    await expect(addon).toHaveClass(
      'nx:group-data-[disabled=true]/input-group:text-disabled-foreground'
    );
  },
};

// An invalid control reddens the group border (always-on, focus-independent).
export const Invalid: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-valid">
        <InputGroupAddon>
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Valid email" placeholder="valid" />
      </InputGroup>
      <InputGroup data-testid="ig-invalid">
        <InputGroupAddon>
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Invalid email"
          placeholder="invalid"
          aria-invalid
        />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'Invalid email' })
    ).toHaveAttribute('aria-invalid', 'true');

    // Error border fires: the invalid group's border colour differs from valid.
    const valid = canvas.getByTestId('ig-valid');
    const invalid = canvas.getByTestId('ig-invalid');
    await expect(window.getComputedStyle(invalid).borderTopColor).not.toBe(
      window.getComputedStyle(valid).borderTopColor
    );
  },
};

// A trailing kbd hint pulls toward the field edge by the canonical −1.5 step.
export const WithKbd: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupInput aria-label="Search" placeholder="Search…" />
      <InputGroupAddon align="inline-end" data-testid="ig-kbd-addon">
        <kbd>⌘K</kbd>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // has-[>kbd]:-mr-1.5 → −6px (spacing-1.5 is mode-invariant).
    await expect(
      window.getComputedStyle(canvas.getByTestId('ig-kbd-addon')).marginRight
    ).toBe('-6px');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Icon-prefixed search, a text prefix with a trailing clear button, and a
// textarea with a footer addon. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="URL" placeholder="nexus.dev" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
