import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

// A profile-preview card revealed on hover.
export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="nx:flex nx:flex-col nx:gap-1">
          <p className="nx:text-sm nx:font-semibold nx:text-foreground">
            @nexus
          </p>
          <p className="nx:text-sm nx:text-muted-foreground">
            The AI-native design system. Joined March 2026.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// Hovering the trigger opens the card; moving away closes it.
export const OpenCloseInteraction: Story = {
  render: () => (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>Joined March 2026</HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '@nexus' });

    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });

    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeNull();
    });
  },
};

// Focusing the trigger via keyboard opens the card (a11y).
export const KeyboardInteraction: Story = {
  render: () => (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>Joined March 2026</HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '@nexus' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
  },
};

// data-slot identifies the root (via trigger/content), trigger, and content.
export const WithDataAttributes: Story = {
  render: () => (
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>Content</HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="hover-card-trigger"]')
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The (closed) trigger across bases — the card portals to the body, so the
// showcase renders the resting trigger. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>Joined March 2026</HoverCardContent>
    </HoverCard>
  ),
};
