import type { Meta, StoryObj } from '@storybook/react';
import { CopyIcon, FileTextIcon, RefreshCcwIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '../attachment';
import { AvatarFallback } from '../avatar';
import { Bubble, BubbleContent } from '../bubble';
import { Button } from '../button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message';

const meta: Meta<typeof Message> = {
  title: 'Components/Message',
  component: Message,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Message>;

const column = 'nx:w-full nx:max-w-lg';

const topDelta = (a: Element, b: Element) =>
  Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top);

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

export const Alignment: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message align="start">
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Incoming turns keep the avatar rail at the inline start.
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Own turns move it to the inline end.</BubbleContent>
          </Bubble>
          <MessageFooter>09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message"]'
    );
    const [startRow, endRow] = [rows[0]!, rows[1]!];

    const avatarLeft = (row: HTMLElement) =>
      row.querySelector('[data-slot="message-avatar"]')!.getBoundingClientRect()
        .left;
    const contentLeft = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect().left;

    await expect(avatarLeft(startRow)).toBeLessThan(contentLeft(startRow));
    await expect(avatarLeft(endRow)).toBeGreaterThan(contentLeft(endRow));

    // A turn declares its side once, on `Message`. The bubbles carry no `align`
    // of their own, so this fails if the column's alignment is ever overridden
    // by a cross-axis auto margin further down.
    const bubbleBox = (row: HTMLElement) =>
      row.querySelector('[data-slot="bubble"]')!.getBoundingClientRect();
    const columnBox = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();

    await expect(bubbleBox(startRow).left).toBeCloseTo(
      columnBox(startRow).left,
      0
    );
    await expect(bubbleBox(endRow).right).toBeCloseTo(
      columnBox(endRow).right,
      0
    );
  },
};

export const WithoutAvatar: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageContent>
          <MessageHeader>System</MessageHeader>
          <Bubble variant="outline">
            <BubbleContent>
              A turn with no avatar rail still fills the row.
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:12</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;
    const content = row.querySelector<HTMLElement>(
      '[data-slot="message-content"]'
    )!;

    await expect(row.querySelector('[data-slot="message-avatar"]')).toBeNull();

    await expect(
      Math.abs(
        content.getBoundingClientRect().width -
          row.getBoundingClientRect().width
      )
    ).toBeLessThan(1);
  },
};

// ============================================
// METADATA COMBINATIONS
// ============================================

export const HeaderOnly: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi &middot; 09:14</MessageHeader>
          <Bubble>
            <BubbleContent>Header above, nothing below.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

export const FooterOnly: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>Nothing above, footer below.</BubbleContent>
          </Bubble>
          <MessageFooter>Delivered 09:14</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

/**
 * The avatar must sit beside the turn in all four metadata combinations, at
 * one-line and wrapped metadata.
 */
export const AvatarAlignmentMatrix: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {(
        [
          { key: 'neither', header: false, footer: false },
          { key: 'header', header: true, footer: false },
          { key: 'footer', header: false, footer: true },
          { key: 'both', header: true, footer: true },
        ] as const
      ).map(({ key, header, footer }) => (
        <div key={key} className={column}>
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            {key}
          </p>
          <MessageGroup>
            <Message>
              <MessageAvatar>
                <AvatarFallback>AB</AvatarFallback>
              </MessageAvatar>
              <MessageContent>
                {header ? (
                  <MessageHeader>
                    Ana Bianchi &middot; Staff Engineer &middot; Platform
                    Infrastructure &middot; wraps onto a second line
                  </MessageHeader>
                ) : null}
                <Bubble>
                  <BubbleContent>Metadata combination: {key}.</BubbleContent>
                </Bubble>
                {footer ? (
                  <MessageFooter>
                    Delivered 09:14 &middot; read by Ana, Bruno, and Chandra
                    &middot; wraps onto a second line
                  </MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
          </MessageGroup>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message"]'
    );

    await expect(rows).toHaveLength(4);

    for (const row of rows) {
      const avatar = row.querySelector<HTMLElement>(
        '[data-slot="message-avatar"]'
      )!;
      const content = row.querySelector<HTMLElement>(
        '[data-slot="message-content"]'
      )!;

      await expect(topDelta(avatar, content)).toBeLessThan(1);
    }
  },
};

// ============================================
// GROUPING
// ============================================

export const ConsecutiveTurns: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>It started after the token refactor.</BubbleContent>
          </Bubble>
          <MessageFooter>09:15</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Looking now.</BubbleContent>
          </Bubble>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

const typingDotClassName =
  'nx:size-1.5 nx:animate-bounce nx:rounded-full nx:bg-muted-foreground nx:motion-reduce:animate-none';

/**
 * A received turn followed by the sender's typing indicator. The dots are
 * decorative; the footer carries the same state as real text so it lands in
 * reading order, and the group is announced so the state reaches assistive
 * tech when it appears.
 */
export const TypingIndicator: Story = {
  render: () => (
    <MessageGroup announce className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:22</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar placeholder />
        <MessageContent>
          <Bubble>
            <BubbleContent>
              <span
                aria-hidden="true"
                className="nx:flex nx:items-center nx:gap-1 nx:py-1"
              >
                <span className={typingDotClassName} />
                <span
                  className={`${typingDotClassName} nx:[animation-delay:150ms]`}
                />
                <span
                  className={`${typingDotClassName} nx:[animation-delay:300ms]`}
                />
              </span>
            </BubbleContent>
          </Bubble>
          <MessageFooter>Ana Bianchi is typing&hellip;</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-group"]'
    )!;

    await expect(canvas.getByText(/Ana Bianchi is typing/)).toBeVisible();
    await expect(group).toHaveAttribute('role', 'log');

    const dotRow = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble-content"] [aria-hidden="true"]'
    )!;
    const dots = Array.from(dotRow.children) as HTMLElement[];

    await expect(dots).toHaveLength(3);

    // The dots animate and are staggered; the meaning lives in the footer text,
    // so they stay out of the a11y tree.
    const delays = dots.map((dot) => getComputedStyle(dot).animationDelay);
    await expect(new Set(delays).size).toBe(3);

    for (const dot of dots) {
      await expect(getComputedStyle(dot).animationName).not.toBe('none');
    }
  },
};

export const Announced: Story = {
  render: () => (
    <MessageGroup announce className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AI</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistant</MessageHeader>
          <Bubble>
            <BubbleContent>
              Turns appended to this stream are announced politely.
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:18</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-group"]'
    )!;

    await expect(group).toHaveAttribute('role', 'log');
    await expect(group).toHaveAttribute('aria-relevant', 'additions');
  },
};

export const StaticTranscript: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>
              A transcript carries no live region, so paging in older turns
              never reads them out.
            </BubbleContent>
          </Bubble>
          <MessageFooter>Yesterday 17:02</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-group"]'
    )!;

    await expect(group).not.toHaveAttribute('role');
    await expect(group).not.toHaveAttribute('aria-relevant');
  },
};

export const WithAvatar: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>It started after the token refactor.</BubbleContent>
          </Bubble>
          <MessageFooter>09:15</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="primary">
            <BubbleContent>Looking now.</BubbleContent>
          </Bubble>
          <MessageFooter>09:16</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="primary">
            <BubbleContent>Found it &mdash; a renamed token.</BubbleContent>
          </Bubble>
          <MessageFooter>09:17</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message"]'
    );

    await expect(rows).toHaveLength(4);

    for (const row of rows) {
      const avatar = row.querySelector<HTMLElement>(
        '[data-slot="message-avatar"]'
      )!;
      const content = row.querySelector<HTMLElement>(
        '[data-slot="message-content"]'
      )!;

      await expect(topDelta(avatar, content)).toBeLessThan(1);

      const railLeadsContent =
        avatar.getBoundingClientRect().left <
        content.getBoundingClientRect().left;
      await expect(railLeadsContent).toBe(row.dataset.align !== 'end');
    }
  },
};

/**
 * A consecutive run from one speaker shows the avatar once and reserves the
 * rail on the continuation turns, so every body stays on the same inline edge.
 * The avatar sits on the first turn because the rail is top-anchored.
 */
export const GroupedTurns: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar placeholder />
        <MessageContent>
          <Bubble>
            <BubbleContent>It started after the token refactor.</BubbleContent>
          </Bubble>
          <MessageFooter>09:15</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Looking now.</BubbleContent>
          </Bubble>
          <MessageFooter>09:16</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar placeholder />
        <MessageContent>
          <Bubble variant="primary">
            <BubbleContent>Found it &mdash; a renamed token.</BubbleContent>
          </Bubble>
          <MessageFooter>09:17</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );
    const box = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();

    // The reserved rail keeps a continuation turn on the same inline edge as
    // the turn that owns the avatar, on both sides of the conversation.
    await expect(box(rows[1]!).left).toBe(box(rows[0]!).left);
    await expect(box(rows[3]!).right).toBe(box(rows[2]!).right);

    const placeholders = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message-avatar"][data-placeholder]'
    );
    await expect(placeholders).toHaveLength(2);

    // Reserved, not merely blank: it holds width but leaves the a11y tree.
    for (const placeholder of placeholders) {
      await expect(getComputedStyle(placeholder).visibility).toBe('hidden');
      await expect(placeholder.getBoundingClientRect().width).toBeGreaterThan(
        0
      );
    }
  },
};

export const WithActions: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <MessageGroup className={column}>
        <Message>
          <MessageAvatar>
            <AvatarFallback>AI</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>
                The audit passes once the four renamed tokens are rerouted.
              </BubbleContent>
            </Bubble>
            <MessageFooter>
              09:18
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Copy reply"
                  >
                    <CopyIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Regenerate reply"
                  >
                    <RefreshCcwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            </MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <AvatarFallback>YOU</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="destructive">
              <BubbleContent>Rerun the contrast audit on main.</BubbleContent>
            </Bubble>
            <MessageFooter>
              09:20 &middot;{' '}
              <span className="nx:text-error-subtle-foreground">
                Failed to send
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Copy message"
                  >
                    <CopyIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Retry sending"
                  >
                    <RefreshCcwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Retry</TooltipContent>
              </Tooltip>
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );

    await expect(
      canvas.getByRole('button', { name: 'Regenerate reply' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Retry sending' })
    ).toBeVisible();

    // The action row follows its turn's side, so own-message controls sit on
    // the inline end instead of stranded under the opposite edge.
    for (const row of rows) {
      const content = row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();
      const footer = row
        .querySelector('[data-slot="message-footer"]')!
        .getBoundingClientRect();

      const gap =
        row.dataset.align === 'end'
          ? content.right - footer.right
          : footer.left - content.left;

      await expect(Math.abs(gap)).toBeLessThan(1);
    }

    const failed = canvas.getByText('Failed to send');
    const footer = failed.closest<HTMLElement>('[data-slot="message-footer"]')!;

    // The failure reads as a status, not as one more muted metadata word.
    await expect(getComputedStyle(failed).color).not.toBe(
      getComputedStyle(footer).color
    );

    const copy = canvas.getByRole('button', { name: 'Copy reply' });

    await expect(
      document.querySelector('[data-slot="tooltip-content"]')
    ).toBeNull();

    await userEvent.hover(copy);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeInTheDocument();
    });

    await userEvent.unhover(copy);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeNull();
    });

    await userEvent.tab();
    await expect(copy).toHaveFocus();
  },
};

export const WithAttachment: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
              <AttachmentDescription>2.4 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>contrast-audit.log</AttachmentTitle>
              <AttachmentDescription>18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );

    await expect(canvas.getByText('sales-dashboard.pdf')).toBeVisible();
    await expect(canvas.getByText('contrast-audit.log')).toBeVisible();

    for (const row of rows) {
      await expect(row.querySelector('[data-slot="bubble"]')).toBeNull();

      const content = row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();
      const attachment = row
        .querySelector('[data-slot="attachment"]')!
        .getBoundingClientRect();

      const gap =
        row.dataset.align === 'end'
          ? content.right - attachment.right
          : attachment.left - content.left;

      await expect(Math.abs(gap)).toBeLessThan(1);
    }
  },
};

// ============================================
// RTL
// ============================================

export const RightToLeft: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;ltr&quot;
        </p>
        <MessageGroup dir="ltr">
          <Message align="start">
            <MessageAvatar>
              <AvatarFallback>AB</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble>
                <BubbleContent>Where did the build fail?</BubbleContent>
              </Bubble>
              <MessageFooter>09:14</MessageFooter>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageAvatar>
              <AvatarFallback>YOU</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="primary">
                <BubbleContent>On the type-check step.</BubbleContent>
              </Bubble>
              <MessageFooter>09:16</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </div>
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;rtl&quot; &mdash; same markup, no physical-side overrides
        </p>
        <MessageGroup dir="rtl">
          <Message align="start">
            <MessageAvatar>
              <AvatarFallback>AB</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble>
                <BubbleContent>أين فشل البناء؟</BubbleContent>
              </Bubble>
              <MessageFooter>09:14</MessageFooter>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageAvatar>
              <AvatarFallback>أنت</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="primary">
                <BubbleContent>في خطوة فحص الأنواع.</BubbleContent>
              </Bubble>
              <MessageFooter>09:16</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message-group"]'
    );
    const ltr = groups[0]!;
    const rtl = groups[1]!;

    const railSide = (group: HTMLElement, align: 'start' | 'end') => {
      const row = group.querySelector<HTMLElement>(
        `[data-slot="message"][data-align="${align}"]`
      )!;
      const avatar = row.querySelector('[data-slot="message-avatar"]')!;
      const content = row.querySelector('[data-slot="message-content"]')!;

      return (
        avatar.getBoundingClientRect().left <
        content.getBoundingClientRect().left
      );
    };

    await expect(railSide(ltr, 'start')).toBe(true);
    await expect(railSide(ltr, 'end')).toBe(false);
    await expect(railSide(rtl, 'start')).toBe(false);
    await expect(railSide(rtl, 'end')).toBe(true);
  },
};

// ============================================
// COMPOSITION
// ============================================

export const ComposedScene: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Here is the audit output from this morning&rsquo;s run.
            </BubbleContent>
          </Bubble>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>contrast-audit.log</AttachmentTitle>
              <AttachmentDescription>18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Thanks — reading it now.</BubbleContent>
          </Bubble>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const endRow = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"][data-align="end"]'
    )!;
    const content = endRow.querySelector<HTMLElement>(
      '[data-slot="message-content"]'
    )!;
    const bubble = endRow.querySelector<HTMLElement>('[data-slot="bubble"]')!;

    await expect(canvas.getByText('contrast-audit.log')).toBeVisible();

    await expect(
      Math.abs(
        content.getBoundingClientRect().right -
          bubble.getBoundingClientRect().right
      )
    ).toBeLessThan(1);
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongUnbrokenContent: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            https://nexuslabs.example.com/observability/traces/0f3a9c1b-77de-4a02-9d31
          </MessageHeader>
          <Bubble>
            <BubbleContent>
              Supercalifragilisticexpialidociousantidisestablishmentarianismpneumonoultramicroscopic
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:21</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;

    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Shipped it.</BubbleContent>
          </Bubble>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;

    await expect(row).toHaveAttribute('data-slot', 'message');
    await expect(row).toHaveAttribute('data-align', 'end');

    for (const slot of [
      'message-avatar',
      'message-content',
      'message-header',
      'message-footer',
    ]) {
      await expect(row.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }

    // MessageAvatar renders Avatar but owns its own identity hook.
    await expect(row.querySelector('[data-slot="avatar"]')).toBeNull();
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {(['start', 'end'] as const).map((align) => (
        <div key={align} className={column}>
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            align=&quot;{align}&quot;
          </p>
          <MessageGroup>
            <Message align={align}>
              <MessageAvatar>
                <AvatarFallback>AB</AvatarFallback>
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>Ana Bianchi</MessageHeader>
                <Bubble variant={align === 'end' ? 'primary' : 'muted'}>
                  <BubbleContent>
                    A turn aligned to the inline {align}.
                  </BubbleContent>
                </Bubble>
                <MessageFooter>09:14</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </div>
      ))}
    </div>
  ),
};
