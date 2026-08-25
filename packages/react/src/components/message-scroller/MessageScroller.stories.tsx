import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconMessage2 } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AvatarFallback } from '../avatar';
import { Bubble, BubbleContent } from '../bubble';
import { Button } from '../button';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '../empty-state';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from '../message';

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from './message-scroller';

const meta: Meta<typeof MessageScroller> = {
  title: 'Components/MessageScroller',
  component: MessageScroller,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MessageScroller>;

const frame =
  'nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background';

function Turn({ index }: { index: number }) {
  const own = index % 2 === 1;

  return (
    <MessageGroup>
      <Message align={own ? 'end' : 'start'}>
        <MessageAvatar>
          <AvatarFallback>{own ? 'YOU' : 'AB'}</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant={own ? 'primary' : 'muted'}>
            <BubbleContent>Turn {index + 1} in the transcript.</BubbleContent>
          </Bubble>
          <MessageFooter>
            09:{String(10 + index).padStart(2, '0')}
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

function Stream({
  count,
  children,
  ...props
}: { count: number } & React.ComponentProps<typeof MessageScroller>) {
  return (
    <MessageScroller className={frame} {...props}>
      <MessageScrollerViewport>
        <MessageScrollerContent>
          {Array.from({ length: count }, (_, index) => (
            <MessageScrollerItem key={index}>
              <Turn index={index} />
            </MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
      {children}
    </MessageScroller>
  );
}

const viewportOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-viewport"]'
  )!;

const atEnd = (viewport: HTMLElement) =>
  viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 24;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => <Stream count={12} />,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    // A long stream opens holding the newest turn.
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const EmptyStream: Story = {
  render: () => (
    <MessageScroller className={frame}>
      <MessageScrollerViewport>
        <MessageScrollerContent>
          <EmptyState>
            <EmptyStateHeader>
              <EmptyStateMedia variant="icon">
                <IconMessage2 />
              </EmptyStateMedia>
              <EmptyStateTitle>No messages yet</EmptyStateTitle>
              <EmptyStateDescription>
                Send the first message to start this conversation.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyState>
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  ),
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);
    const button = canvasElement.querySelector(
      '[data-slot="message-scroller-button"]'
    );

    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
    await expect(button).toHaveAttribute('data-active', 'false');
  },
};

export const ShortStream: Story = {
  render: () => <Stream count={2} />,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    // Nothing to scroll, so the affordance never arms.
    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
    await expect(
      canvasElement.querySelector('[data-slot="message-scroller-button"]')
    ).toHaveAttribute('data-active', 'false');
  },
};

// ============================================
// SCROLL AWAY AND RETURN
// ============================================

export const ScrolledAway: Story = {
  render: () => <Stream count={14} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    const name = 'Scroll to the latest message';

    // Inactive: out of the tab order and out of the a11y tree.
    await expect(canvas.queryByRole('button', { name })).toBeNull();

    viewport.scrollTop = 0;

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const button = canvas.getByRole('button', { name });
    await expect(button).not.toHaveAttribute('aria-hidden');
    await expect(button).not.toHaveAttribute('tabindex', '-1');

    // The affordance is a circle, not a pill: a width utility on the root
    // would collapse the icon box onto its glyph.
    const box = button.getBoundingClientRect();
    await expect(box.width).toBe(box.height);

    await userEvent.click(button);

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );

    // Back at the end, the affordance stands down again.
    await waitFor(async () => {
      await expect(canvas.queryByRole('button', { name })).toBeNull();
    });
  },
};

// ============================================
// STREAMING
// ============================================

function AppendableStream({ startScrolledAway = false }) {
  const [count, setCount] = React.useState(10);

  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <Stream count={count} />
      <Button
        size="sm"
        variant="outline"
        className="nx:w-fit"
        onClick={() => setCount((value) => value + 1)}
      >
        Append turn
      </Button>
      <span className="nx:sr-only">
        {startScrolledAway ? 'away' : 'pinned'}
      </span>
    </div>
  );
}

export const StreamingWhilePinned: Story = {
  render: () => <AppendableStream />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    // Appending while the reader is at the end holds them there.
    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const StreamingWhileScrolledAway: Story = {
  render: () => <AppendableStream startScrolledAway />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTop = 0;
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(false);
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });

    // The reader stays exactly where they were reading. This is the whole
    // point of the component: appended content must not yank the viewport.
    await expect(viewport.scrollTop).toBe(0);
    await expect(atEnd(viewport)).toBe(false);
  },
};

// ============================================
// INTERACTION
// ============================================

export const KeyboardInteraction: Story = {
  render: () => <Stream count={14} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    // The transcript holds nothing focusable, so the viewport itself must be
    // reachable or a keyboard user cannot scroll it at all.
    await expect(viewport).toHaveAttribute('tabindex', '0');

    viewport.scrollTop = 0;

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const button = canvas.getByRole('button', { name });
    button.focus();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

// ============================================
// RTL
// ============================================

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <MessageScroller className={frame}>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {Array.from({ length: 12 }, (_, index) => (
              <MessageScrollerItem key={index}>
                <MessageGroup>
                  <Message align={index % 2 === 1 ? 'end' : 'start'}>
                    <MessageAvatar>
                      <AvatarFallback>
                        {index % 2 === 1 ? 'أنت' : 'ع ب'}
                      </AvatarFallback>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble variant={index % 2 === 1 ? 'primary' : 'muted'}>
                        <BubbleContent>
                          الرسالة رقم {index + 1} في المحادثة.
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter>
                        09:{String(10 + index).padStart(2, '0')}
                      </MessageFooter>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    viewport.scrollTop = 0;

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    // The affordance is centred, so it holds its place under either direction
    // rather than depending on a physical side.
    const rootBox = root.getBoundingClientRect();
    const buttonBox = canvas
      .getByRole('button', { name })
      .getBoundingClientRect();

    const startGap = buttonBox.left - rootBox.left;
    const endGap = rootBox.right - buttonBox.right;

    await expect(Math.abs(startGap - endGap)).toBeLessThan(2);
  },
};

// ============================================
// MOTION
// ============================================

/**
 * Under `prefers-reduced-motion: reduce` the affordance still appears and
 * disappears, but without the entrance translate, and `scrollToEnd` jumps
 * instead of animating. The harness cannot emulate the media query inside a
 * play function, so this story is for manual review with the OS setting on.
 */
export const ReducedMotion: Story = {
  render: () => <Stream count={14} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTop = 0;

    const button = await waitFor(() =>
      canvas.getByRole('button', { name: 'Scroll to the latest message' })
    );

    // The state change survives regardless of whether the motion runs; the
    // opacity is read after the transition so this holds either way.
    await expect(button).toHaveAttribute('data-active', 'true');
    await waitFor(async () => {
      await expect(getComputedStyle(button).opacity).toBe('1');
    });
  },
};

// ============================================
// DATA ATTRIBUTES
// ============================================

export const WithDataAttributes: Story = {
  render: () => <Stream count={12} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    for (const slot of [
      'message-scroller-viewport',
      'message-scroller-content',
      'message-scroller-item',
      'message-scroller-button',
    ]) {
      await expect(root.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }

    const button = root.querySelector<HTMLElement>(
      '[data-slot="message-scroller-button"]'
    )!;
    await expect(button).toHaveAttribute('data-direction', 'end');

    // The edge fade keys off these, so they carry both states rather than
    // only marking the true one.
    await expect(root).toHaveAttribute('data-at-end', 'true');
    await expect(root).toHaveAttribute('data-at-start', 'false');
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <MessageScroller className={frame}>
      <MessageScrollerViewport>
        <MessageScrollerContent>
          {Array.from({ length: 14 }, (_, index) => (
            <MessageScrollerItem key={index}>
              <Turn index={index} />
            </MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton direction="start" />
      <MessageScrollerButton direction="end" />
    </MessageScroller>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;
    const buttons = root.querySelectorAll<HTMLElement>(
      '[data-slot="message-scroller-button"]'
    );

    await expect(buttons).toHaveLength(2);
    await expect(buttons[0]).toHaveAttribute('data-direction', 'start');
    await expect(buttons[1]).toHaveAttribute('data-direction', 'end');
  },
};
