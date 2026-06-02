import type { Meta, StoryObj } from '@storybook/react';
import { IconSelector } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

// A trigger composed with a ghost Button, toggling a content region.
export const Default: Story = {
  render: () => (
    <Collapsible className="nx:flex nx:w-72 nx:flex-col nx:gap-2">
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
        <span className="nx:text-sm nx:font-medium nx:text-foreground">
          @nexus starred 3 repositories
        </span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Toggle repositories">
            <IconSelector />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
        @radix-ui/react-collapsible
      </div>
      <CollapsibleContent className="nx:flex nx:flex-col nx:gap-2">
        <div className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
          @radix-ui/react-toggle
        </div>
        <div className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
          @radix-ui/react-slider
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

// Open by default, showing the revealed content region.
export const Open: Story = {
  render: () => (
    <Collapsible defaultOpen className="nx:flex nx:w-72 nx:flex-col nx:gap-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-muted-foreground">
        Revealed content shown while open.
      </CollapsibleContent>
    </Collapsible>
  ),
};

// Clicking the trigger expands the content and fires onOpenChange.
export const ClickInteraction: Story = {
  args: { onOpenChange: fn() },
  render: (args) => (
    <Collapsible
      onOpenChange={args.onOpenChange}
      className="nx:flex nx:w-72 nx:flex-col nx:gap-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
        Now you see me.
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Now you see me.')).toBeVisible();
  },
};

// Enter/Space toggles the collapsible when the trigger is focused.
export const KeyboardInteraction: Story = {
  args: { onOpenChange: fn() },
  render: (args) => (
    <Collapsible
      onOpenChange={args.onOpenChange}
      className="nx:flex nx:w-72 nx:flex-col nx:gap-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
        Keyboard-revealed content.
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

// A disabled collapsible: the trigger cannot toggle the content.
export const Disabled: Story = {
  args: { onOpenChange: fn() },
  render: (args) => (
    <Collapsible
      disabled
      onOpenChange={args.onOpenChange}
      className="nx:flex nx:w-72 nx:flex-col nx:gap-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-foreground">
        Unreachable while disabled.
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    // No click: a disabled trigger stays closed; the disabled attribute and
    // the never-fired onOpenChange are the signals.
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

// data-slot identifies the root, trigger, and content.
export const WithDataAttributes: Story = {
  render: () => (
    <Collapsible defaultOpen className="nx:flex nx:w-72 nx:flex-col nx:gap-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="collapsible"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-trigger"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-content"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Closed (resting) and open states side by side. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <Collapsible className="nx:flex nx:w-64 nx:flex-col nx:gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline">Closed by default</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-muted-foreground">
          Hidden until toggled.
        </CollapsibleContent>
      </Collapsible>
      <Collapsible defaultOpen className="nx:flex nx:w-64 nx:flex-col nx:gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline">Open by default</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="nx:rounded-md nx:border nx:border-border-default nx:px-4 nx:py-2 nx:text-sm nx:text-muted-foreground">
          Visible on first render.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
