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
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
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

function ProvidedStream(props: React.ComponentProps<typeof Stream>) {
  return (
    <MessageScrollerProvider>
      <Stream {...props} />
    </MessageScrollerProvider>
  );
}

const viewportOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-viewport"]'
  )!;

const buttonOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-button"]'
  )!;

// Resting on the last pixel, not merely within the component's edge slack.
const atEnd = (viewport: HTMLElement) =>
  viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 1;

// Resize observers are notified after a frame's animation callbacks, so only
// the frame after next is sure to have run them.
const afterResizeObservers = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => <ProvidedStream count={12} />,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const EmptyStream: Story = {
  render: () => (
    <MessageScrollerProvider>
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
    </MessageScrollerProvider>
  ),
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-active',
      'false'
    );
  },
};

export const ShortStream: Story = {
  render: () => <ProvidedStream count={2} />,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-active',
      'false'
    );
  },
};

// ============================================
// SCROLL AWAY AND RETURN
// ============================================

export const ScrolledAway: Story = {
  render: () => <ProvidedStream count={14} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    const name = 'Scroll to the latest message';

    await expect(canvas.queryByRole('button', { name })).toBeNull();

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const button = canvas.getByRole('button', { name });
    await expect(button).toBeVisible();

    const box = button.getBoundingClientRect();
    await expect(box.width).toBe(box.height);

    await userEvent.click(button);

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );

    await waitFor(async () => {
      await expect(canvas.queryByRole('button', { name })).toBeNull();
    });
  },
};

// ============================================
// STREAMING
// ============================================

function Composer({ onAppend }: { onAppend: () => void }) {
  const { scrollToEnd } = useMessageScroller();

  return (
    <div className="nx:flex nx:gap-2">
      <Button size="sm" variant="outline" onClick={onAppend}>
        Append turn
      </Button>
      <Button
        size="sm"
        onClick={() => {
          onAppend();
          scrollToEnd();
        }}
      >
        Send
      </Button>
    </div>
  );
}

function AppendableStream({ children }: { children?: React.ReactNode }) {
  const [count, setCount] = React.useState(10);

  return (
    <MessageScrollerProvider>
      <div className="nx:flex nx:flex-col nx:gap-3">
        <Stream count={count}>{children}</Stream>
        <Composer onAppend={() => setCount((value) => value + 1)} />
      </div>
    </MessageScrollerProvider>
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

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const StreamingWhileScrolledAway: Story = {
  render: () => <AppendableStream />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(false);
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
    await afterResizeObservers();

    await expect(viewport.scrollTop).toBe(0);
    await expect(atEnd(viewport)).toBe(false);
  },
};

export const ScrollToStart: Story = {
  render: () => (
    <AppendableStream>
      <MessageScrollerButton direction="start" />
    </AppendableStream>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    // Leave a scroll range short enough that its midpoint is near both edges,
    // yet long enough that the start button still arms.
    const range = () => viewport.scrollHeight - viewport.clientHeight;
    root.style.height = `${root.offsetHeight + range() - 36}px`;

    const start = canvas.getByRole('button', {
      name: 'Scroll to the oldest message',
    });
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
      await expect(start).toHaveAttribute('data-active', 'true');
    });

    // Cutting the smooth scroll short at its midpoint stands in for the
    // animation frame that is still near the end, with no frame in between.
    const midpoint = Math.floor(range() / 2);
    start.click();
    viewport.scrollTo({ top: midpoint, behavior: 'instant' });
    await waitFor(async () => {
      await expect(root).toHaveAttribute('data-at-start', 'true');
      await expect(root).toHaveAttribute('data-at-end', 'true');
    });
    await afterResizeObservers();

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
    await afterResizeObservers();

    await expect(viewport.scrollTop).toBe(midpoint);
  },
};

export const SendFromComposer: Story = {
  render: () => <AppendableStream />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Scroll to the latest message' })
      ).toHaveAttribute('data-active', 'true');
    });

    // The jump starts before the new turn renders, so it aims at the old
    // height. Re-pinning is what carries it onto the turn that just arrived.
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    await waitFor(
      async () => {
        await expect(
          canvas.getByText('Turn 11 in the transcript.')
        ).toBeVisible();
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

// ============================================
// INTERACTION
// ============================================

export const KeyboardInteraction: Story = {
  render: () => <ProvidedStream count={14} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await expect(viewport).toHaveAttribute('tabindex', '0');

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    await userEvent.tab();
    await expect(viewport).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

export const ReducedMotion: Story = {
  render: () => <ProvidedStream count={14} />,
  globals: { reduceMotion: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    await userEvent.click(canvas.getByRole('button', { name }));

    // No smooth scroll to wait out: the jump lands within the click.
    await expect(atEnd(viewport)).toBe(true);
  },
};

// ============================================
// RTL
// ============================================

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <MessageScrollerProvider>
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
      </MessageScrollerProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

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
// DATA ATTRIBUTES
// ============================================

export const WithDataAttributes: Story = {
  render: () => <ProvidedStream count={12} />,
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

    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-direction',
      'end'
    );

    await waitFor(async () => {
      await expect(root).toHaveAttribute('data-at-end', 'true');
      await expect(root).toHaveAttribute('data-at-start', 'false');
    });
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <MessageScrollerProvider>
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
    </MessageScrollerProvider>
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
