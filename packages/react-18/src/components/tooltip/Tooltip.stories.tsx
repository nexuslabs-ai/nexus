import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button/button';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip shows a short hint when users hover over or focus a trigger. Use it for brief labels, such as the name of an icon button. Wrap a group of tooltips in `TooltipProvider` to share one open delay.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const SIDES = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
] as const;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `side` on TooltipContent to open the tooltip on any of four sides.',
      },
    },
  },
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {SIDES.map(({ side, label }) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline">{label}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>
            <p>Tooltip on the {side}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const WithLongContent: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Cap the width with a class so long text wraps onto several lines.',
      },
    },
  },
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover for details</Button>
      </TooltipTrigger>
      <TooltipContent className="nx:max-w-xs">
        <p>
          This tooltip contains longer content that might wrap to multiple lines
          when it exceeds the maximum width.
        </p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomOffset: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `sideOffset` to change the gap between trigger and tooltip.',
      },
    },
  },
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Custom offset</Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={12}>
        <p>12px offset from trigger</p>
      </TooltipContent>
    </Tooltip>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const HoverInteraction: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Tooltip should not be visible initially
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    await expect(trigger).toBeInTheDocument();

    // Hover over the trigger
    await userEvent.hover(trigger);

    // Tooltip content should appear
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeInTheDocument();
    });
    const tooltip = document.querySelector('[data-slot="tooltip-content"]');
    await expectInterruptibleOverlayMotion(tooltip, {
      oldOpenAnimationClass: 'nx:animate-in',
    });

    // Move away from trigger
    await userEvent.unhover(trigger);

    // Tooltip should disappear
    await expectExitBeforeUnmount(tooltip);
  },
};

// A standalone Tooltip waits Radix's default 700ms. Opening within 300ms proves
// each Tooltip joined the provider's group and took its delay.
export const GroupedInProvider: Story = {
  render: (_args) => (
    <TooltipProvider delayDuration={0}>
      <div className="nx:flex nx:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bold</Button>
          </TooltipTrigger>
          <TooltipContent>Bold text</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Italic</Button>
          </TooltipTrigger>
          <TooltipContent>Italic text</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    for (const [name, text] of [
      ['Bold', 'Bold text'],
      ['Italic', 'Italic text'],
    ] as const) {
      const trigger = canvas.getByRole('button', { name });
      await userEvent.hover(trigger);
      await waitFor(
        async () => {
          await expect(body.getByRole('tooltip', { name: text })).toBeVisible();
        },
        { timeout: 300 }
      );
      await userEvent.unhover(trigger);
    }
  },
};

export const FocusInteraction: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Focus me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus the trigger via keyboard
    const trigger = canvas.getByRole('button', { name: 'Focus me' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    // Tooltip should appear on focus
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeInTheDocument();
    });

    // Blur the trigger
    await userEvent.tab();

    // Tooltip should disappear
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Hover to show tooltip
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(trigger);

    // Check data-slot attribute
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeInTheDocument();
    });

    // Clean up - unhover and wait for tooltip to disappear
    await userEvent.unhover(trigger);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Side Variants
        </h3>
        <div className="nx:flex nx:items-center nx:justify-center nx:gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Top tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Right tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Bottom tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Left tooltip</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Different Content
        </h3>
        <div className="nx:flex nx:items-center nx:justify-center nx:gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Short</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hi!</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Medium</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a medium length tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Long</Button>
            </TooltipTrigger>
            <TooltipContent className="nx:max-w-xs">
              <p>
                This tooltip has longer content that demonstrates how it handles
                text wrapping.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
