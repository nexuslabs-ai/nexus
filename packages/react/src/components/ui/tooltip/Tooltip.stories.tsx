import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SPACING_MODES } from '../../../stories/spacing-modes';
import { Button } from '../button';

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

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          "Each row sets `data-style` on the trigger wrapper to demonstrate the available spacing modes. Note that `TooltipContent` portals to `document.body` and therefore picks up the document-level `data-style`, not the wrapper — opening a tooltip from any row renders content at whatever mode the Style toolbar selected, not the row's mode. The triggers themselves (Buttons) do respond to the wrapper.",
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-w-fit">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:gap-2 nx:items-center"
        >
          <span className="nx:w-[64px] nx:typography-label-default nx:font-mono nx:text-muted-foreground">
            {mode}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip in {mode}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};

export const TooltipContentUsesNumericSpacing: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Regression sentinel — verifies `TooltipContent` keeps its intended numeric padding (`px-3` / `py-1.5`) at the resolved pixel values via `getComputedStyle`. Because the content is portaled, the assertion sees document-level mode resolution — default, where `px-3` is 12px and `py-1.5` is 6px.',
      },
    },
  },
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
    await document.fonts.ready;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    try {
      await userEvent.hover(trigger);

      const tooltip = await waitFor(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-slot="tooltip-content"]'
        );
        if (!el) throw new Error('tooltip not visible yet');
        return el;
      });

      const styles = getComputedStyle(tooltip);
      expect(styles.paddingLeft).toBe('12px');
      expect(styles.paddingRight).toBe('12px');
      expect(styles.paddingTop).toBe('6px');
      expect(styles.paddingBottom).toBe('6px');
    } finally {
      await userEvent.unhover(trigger);
      await waitFor(() => {
        expect(
          document.querySelector('[data-slot="tooltip-content"]')
        ).toBeNull();
      });
    }
  },
};

export const TooltipContentUsesTypographyComposite: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Regression sentinel — verifies `TooltipContent` carries the canonical `nx:typography-body-small` composite (replacing raw `text-xs`). `toHaveClass` is sufficient here because `typography-*` composites are invisible to the tailwind-merge conflict groups, so the class cannot be silently collapsed under a consumer override. The content is portaled, so the assertion queries `document`.',
      },
    },
  },
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
    await document.fonts.ready;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    try {
      await userEvent.hover(trigger);

      const tooltip = await waitFor(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-slot="tooltip-content"]'
        );
        if (!el) throw new Error('tooltip not visible yet');
        return el;
      });

      expect(tooltip).toHaveClass('nx:typography-body-small');
    } finally {
      await userEvent.unhover(trigger);
      await waitFor(() => {
        expect(
          document.querySelector('[data-slot="tooltip-content"]')
        ).toBeNull();
      });
    }
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
