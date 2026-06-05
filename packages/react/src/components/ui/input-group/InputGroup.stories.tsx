import type { Meta, StoryObj } from '@storybook/react';
import { IconEye, IconMail, IconSearch, IconX } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

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

// The group is a role=group field; the control + addon carry data-slot hooks.
export const WithDataAttributes: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
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
      canvasElement.querySelector('[data-slot="input-group-control"]')
    ).toBeInTheDocument();
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
