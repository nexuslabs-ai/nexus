import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

const SIDES = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
] as const;

// A profile-preview card revealed on hover.
export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="nx:flex nx:flex-col nx:gap-1">
          <p className="nx:typography-label-default nx:font-semibold nx:text-foreground">
            @nexus
          </p>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            The AI-native design system. Joined March 2026.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// A richer preview: avatar, bio and join date.
export const ProfileCard: Story = {
  tags: ['docs'],
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@ada</Button>
      </HoverCardTrigger>
      <HoverCardContent className="nx:w-80">
        <div className="nx:flex nx:gap-4">
          <Avatar>
            <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div className="nx:flex nx:flex-col nx:gap-1">
            <p className="nx:typography-label-default nx:font-semibold nx:text-foreground">
              Ada Lovelace
            </p>
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Wrote the first program for the Analytical Engine.
            </p>
            <p className="nx:typography-label-small nx:text-muted-foreground">
              Joined December 1843
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// `side` opens the card on any edge of its trigger.
export const Placement: Story = {
  tags: ['docs'],
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {SIDES.map(({ side, label }) => (
        <HoverCard key={side}>
          <HoverCardTrigger asChild>
            <Button variant="outline">{label}</Button>
          </HoverCardTrigger>
          <HoverCardContent side={side}>
            Opens on the {side} of its trigger.
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
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
    const content = document.querySelector('[data-slot="hover-card-content"]');
    await expectInterruptibleOverlayMotion(content);

    await userEvent.unhover(trigger);
    await expectExitBeforeUnmount(content);
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
