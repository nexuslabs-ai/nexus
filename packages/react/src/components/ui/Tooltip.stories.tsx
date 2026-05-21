import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
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

export const SideTop: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Top</Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Tooltip on top</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideRight: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Right</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Tooltip on right</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideBottom: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Bottom</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Tooltip on bottom</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideLeft: Story = {
  render: (_args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Left</Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Tooltip on left</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithLongContent: Story = {
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

    // Move away from trigger
    await userEvent.unhover(trigger);

    // Tooltip should disappear
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeNull();
    });
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

export const DataAttributesTest: Story = {
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
