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

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => <ProvidedStream count={12} />,
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

    // Nothing to scroll, so the affordance never arms.
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

    // Inactive: hidden, so it is out of the tab order and the a11y tree.
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

// Sits beside the scroller, not inside it, the way a real composer bar does.
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

    // The reader stays exactly where they were reading. This is the whole
    // point of the component: appended content must not yank the viewport.
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

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Scroll to the oldest message' })
    );

    await waitFor(
      async () => {
        await expect(viewport.scrollTop).toBe(0);
      },
      { timeout: 3000 }
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });

    // Jumping to the start unpins, so the new turn does not pull the reader
    // back to the end.
    await expect(viewport.scrollTop).toBe(0);
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

    // The transcript holds nothing focusable, so the viewport itself must be
    // reachable or a keyboard user cannot scroll it at all.
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

    // Once active, the button is the next stop after the viewport.
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

    // Both states are emitted, not only the true one, so consumers can style
    // either edge.
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
