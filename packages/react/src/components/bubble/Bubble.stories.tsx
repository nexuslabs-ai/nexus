import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { CheckCheckIcon, InfoIcon } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  type BubbleProps,
  BubbleReactions,
} from './bubble';

const meta: Meta<typeof Bubble> = {
  title: 'Components/Bubble',
  component: Bubble,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Bubble>;

const column = 'nx:w-full nx:max-w-md';

/**
 * The hover tint is a `:has()` variant, and synthetic pointer events never
 * activate `:hover` — so these stories assert which turns the tint *selects*
 * rather than the painted colour. The scope is read back off the compiled
 * stylesheet, not off the class attribute, so a variant Tailwind never emitted
 * fails loudly instead of passing on a class string that styles nothing.
 * Widen the scope in `bubble.tsx` and the over-fire assertions below start
 * matching and fail.
 */
function* eachStyleRule(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      yield rule;
    }

    // Tailwind nests the variant chain inside the class rule, and a
    // `CSSStyleRule` is itself a grouping rule — so recurse into every rule,
    // including the ones just yielded.
    const nested: CSSRuleList | undefined = (rule as CSSGroupingRule).cssRules;

    if (nested) {
      yield* eachStyleRule(nested);
    }
  }
}

function hoverTintSelector(bubble: Element): string {
  const emitted = [...bubble.classList].find(
    (name) => name.startsWith('nx:has-[') && name.includes(']:hover:bg-')
  );

  if (!emitted) {
    throw new Error(`no hover-tint class on "${bubble.className}"`);
  }

  const escaped = `.${CSS.escape(emitted)}`;

  for (const sheet of document.styleSheets) {
    for (const rule of eachStyleRule(sheet.cssRules)) {
      if (rule.selectorText !== escaped) {
        continue;
      }

      // `.cls { &:has(…) { &:hover { … } } }` — the scope lives on the nested
      // rule, so strip the nesting `&` and the trailing `:hover` off it.
      const scope = [...eachStyleRule(rule.cssRules)]
        .map((nested) => nested.selectorText)
        .find((selector) => selector.includes(':has('));

      if (scope) {
        return scope.replace(/^&/, '').replace(/:hover$/, '');
      }
    }
  }

  throw new Error(`"${emitted}" compiled to no :has() rule`);
}

function bubbleOf(element: Element): Element {
  return element.closest('[data-slot="bubble"]')!;
}

const VARIANTS: NonNullable<BubbleProps['variant']>[] = [
  'muted',
  'primary',
  'outline',
  'ghost',
  'destructive',
];

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => (
    <div className={column}>
      <Bubble>
        <BubbleContent>How do I rotate the signing key?</BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Muted: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="muted">
        <BubbleContent>
          The incoming surface. This is the default, and the only surface family
          that reads as a bubble against the page canvas without a border.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Primary: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="primary" align="end">
        <BubbleContent>
          The own-message surface, carrying the brand family.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Outline: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="outline">
        <BubbleContent>
          A bordered turn, for streams that sit on a tinted page.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Ghost: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="ghost">
        <BubbleContent>
          No surface at all — for assistant prose that should read as page text.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Destructive: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="destructive">
        <BubbleContent>
          Message failed to send. Check your connection and retry.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};

// ============================================
// ALIGNMENT
// ============================================

export const Alignment: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble align="start">
        <BubbleContent>Start-aligned turns hug the inline start.</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>End-aligned turns hug the inline end.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;ltr&quot;
        </p>
        <BubbleGroup dir="ltr">
          <Bubble align="start">
            <BubbleContent>Where did the build fail?</BubbleContent>
          </Bubble>
          <Bubble align="end" variant="primary">
            <BubbleContent>On the type-check step.</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </div>
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;rtl&quot; — same markup, no physical-side overrides
        </p>
        <BubbleGroup dir="rtl">
          <Bubble align="start">
            <BubbleContent>أين فشل البناء؟</BubbleContent>
          </Bubble>
          <Bubble align="end" variant="primary">
            <BubbleContent>في خطوة فحص الأنواع.</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-group"]'
    );
    const ltrGroup = groups[0]!;
    const rtlGroup = groups[1]!;

    const leftEdge = (root: HTMLElement, text: string) =>
      within(root).getByText(text).getBoundingClientRect().left;

    await expect(leftEdge(ltrGroup, 'On the type-check step.')).toBeGreaterThan(
      leftEdge(ltrGroup, 'Where did the build fail?')
    );
    await expect(leftEdge(rtlGroup, 'في خطوة فحص الأنواع.')).toBeLessThan(
      leftEdge(rtlGroup, 'أين فشل البناء؟')
    );
  },
};

// ============================================
// REACTIONS
// ============================================

export const WithReactions: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble align="start">
        <BubbleContent>Landed the marker primitive.</BubbleContent>
        <BubbleReactions>🎉 3</BubbleReactions>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>Reviewing it now.</BubbleContent>
        <BubbleReactions>👀 1</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  ),
};

export const ReactionSideAndAlign: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:pt-4">
      {(['top', 'bottom'] as const).map((side) =>
        (['start', 'end'] as const).map((align) => (
          <div key={`${side}-${align}`} className={column}>
            <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
              side=&quot;{side}&quot; align=&quot;{align}&quot;
            </p>
            <Bubble variant="muted">
              <BubbleContent>Every corner is reachable.</BubbleContent>
              <BubbleReactions side={side} align={align}>
                ✅ 2
              </BubbleReactions>
            </Bubble>
          </div>
        ))
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pills = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(4);

    for (const pill of pills) {
      const bubble = pill.closest<HTMLElement>('[data-slot="bubble"]')!;
      const bubbleBox = bubble.getBoundingClientRect();
      const pillBox = pill.getBoundingClientRect();

      // Guards against a silently-undefined utility: an unresolved inset would
      // leave the pill at its static position instead of the named corner.
      const pillStyle = getComputedStyle(pill);
      await expect(pillStyle.position).toBe('absolute');
      await expect(
        pill.dataset.align === 'start'
          ? pillStyle.insetInlineStart
          : pillStyle.insetInlineEnd
      ).not.toBe('auto');

      // The overhang is reserved by the bubble itself, so the pill stays clear
      // of its neighbour whatever gap the surrounding stack happens to set.
      const bubbleStyle = getComputedStyle(bubble);

      if (pill.dataset.side === 'top') {
        await expect(pillBox.top).toBeLessThan(bubbleBox.top);
        await expect(bubbleBox.top - pillBox.top).toBeLessThanOrEqual(
          parseFloat(bubbleStyle.marginTop)
        );
      } else {
        await expect(pillBox.bottom).toBeGreaterThan(bubbleBox.bottom);
        await expect(pillBox.bottom - bubbleBox.bottom).toBeLessThanOrEqual(
          parseFloat(bubbleStyle.marginBottom)
        );
      }

      const inlineGap =
        pill.dataset.align === 'start'
          ? pillBox.left - bubbleBox.left
          : bubbleBox.right - pillBox.right;

      // 12px from `start-3` / `end-3`, plus the reserved 1px border.
      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

export const ReactionsInRtl: Story = {
  render: () => (
    <BubbleGroup className={column} dir="rtl">
      <Bubble align="start">
        <BubbleContent>تم دمج التغييرات.</BubbleContent>
        <BubbleReactions align="start">🎉 3</BubbleReactions>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>شكرًا لك.</BubbleContent>
        <BubbleReactions align="end">👀 1</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const pills = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(2);

    for (const pill of pills) {
      const bubbleBox = pill
        .closest<HTMLElement>('[data-slot="bubble"]')!
        .getBoundingClientRect();
      const pillBox = pill.getBoundingClientRect();

      // Under RTL, inline-start is the right edge.
      const inlineGap =
        pill.dataset.align === 'start'
          ? bubbleBox.right - pillBox.right
          : pillBox.left - bubbleBox.left;

      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

// ============================================
// INTERACTION
// ============================================

export const LinksAndButtons: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble align="start" variant="ghost">
        <BubbleContent asChild>
          <a href="#thread">Jump to the full thread</a>
        </BubbleContent>
      </Bubble>
      <Bubble align="start" variant="outline">
        <BubbleContent asChild>
          <button type="button">Retry sending</button>
        </BubbleContent>
      </Bubble>
      <Bubble align="end" variant="ghost">
        <BubbleContent asChild>
          <a href="#release">Open the release notes</a>
        </BubbleContent>
      </Bubble>
      <Bubble align="end" variant="destructive">
        <BubbleContent asChild>
          <button type="button">Report this message</button>
        </BubbleContent>
      </Bubble>
      <Bubble align="start" variant="muted">
        <BubbleContent>
          An inline <a href="#docs">link inside prose</a> is underlined the same
          way as a whole-bubble link.
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'Jump to the full thread' });
    const button = canvas.getByRole('button', { name: 'Retry sending' });

    await expect(link).toHaveAttribute('href', '#thread');
    await expect(link).toHaveAttribute('data-slot', 'bubble-content');
    await expect(button).toHaveAttribute('data-slot', 'bubble-content');

    // Both live turns are actionable, so each selects its own tint.
    const linkBubble = bubbleOf(link);
    const buttonBubble = bubbleOf(button);

    await expect(linkBubble.matches(hoverTintSelector(linkBubble))).toBe(true);
    await expect(buttonBubble.matches(hoverTintSelector(buttonBubble))).toBe(
      true
    );

    // Links read as links on every surface, whether the body is the anchor or
    // merely contains one.
    const inlineLink = canvas.getByRole('link', {
      name: 'link inside prose',
    });

    // A link buried in prose is not a whole-turn action, so it must not tint.
    const proseBubble = bubbleOf(inlineLink);

    await expect(proseBubble.matches(hoverTintSelector(proseBubble))).toBe(
      false
    );

    for (const anchor of [link, inlineLink]) {
      await expect(getComputedStyle(anchor).textDecorationLine).toBe(
        'underline'
      );
    }

    await expect(getComputedStyle(link).cursor).toBe('pointer');
    await expect(getComputedStyle(button).cursor).toBe('pointer');

    // The padding lives on the content, so the hit target — and the focus ring
    // that traces it — covers the whole surface, not a box inset within it.
    for (const control of [link, button]) {
      const controlBox = control.getBoundingClientRect();
      const surfaceBox = control
        .closest<HTMLElement>('[data-slot="bubble"]')!
        .getBoundingClientRect();

      // 1px on every side: the border the surface reserves for `outline`.
      await expect(controlBox.left - surfaceBox.left).toBeLessThanOrEqual(1);
      await expect(surfaceBox.right - controlBox.right).toBeLessThanOrEqual(1);
      await expect(controlBox.top - surfaceBox.top).toBeLessThanOrEqual(1);
      await expect(surfaceBox.bottom - controlBox.bottom).toBeLessThanOrEqual(
        1
      );
    }

    // A whole-bubble link is identified by its underline, not by a surface.
    const linkBubbleStyle = getComputedStyle(linkBubble as HTMLElement);

    await expect(linkBubbleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(linkBubbleStyle.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    // The prose bubble around an inline link keeps its surface.
    await expect(
      getComputedStyle(inlineLink.closest<HTMLElement>('[data-slot="bubble"]')!)
        .backgroundColor
    ).not.toBe('rgba(0, 0, 0, 0)');

    // Every interactive turn is reachable in document order.
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const ClickInteraction: StoryObj<BubbleProps & { onRetry: () => void }> =
  {
    args: { onRetry: fn() },
    render: (args) => (
      <div className={column}>
        <Bubble variant="outline">
          <BubbleContent asChild>
            <button type="button" onClick={args.onRetry}>
              Retry sending this message
            </button>
          </BubbleContent>
        </Bubble>
      </div>
    ),
    play: async ({ canvasElement, args }) => {
      const canvas = within(canvasElement);
      const button = canvas.getByRole('button', {
        name: 'Retry sending this message',
      });

      await userEvent.click(button);
      await expect(args.onRetry).toHaveBeenCalledTimes(1);
    },
  };

export const KeyboardInteraction: StoryObj<
  BubbleProps & { onOpenRun: () => void }
> = {
  args: { onOpenRun: fn() },
  render: (args) => (
    <div className={column}>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" onClick={args.onOpenRun}>
            Open the failing run
          </button>
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Open the failing run' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onOpenRun).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    await expect(args.onOpenRun).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: StoryObj<BubbleProps & { onRetry: () => void }> = {
  args: { onRetry: fn() },
  render: (args) => (
    <div className={column}>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" disabled onClick={args.onRetry}>
            Retry sending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" aria-disabled="true">
            Resending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent asChild>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- the hrefless anchor is the case under test: an unnavigable body must not read as actionable */}
          <a>Thread unavailable</a>
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'Retry sending this message',
    });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onRetry).not.toHaveBeenCalled();

    // A dead body must not advertise itself with the actionable hover tint,
    // however it is deadened — `disabled`, `aria-disabled` (which Nexus
    // `Button` sets while loading), or an anchor with nowhere to go.
    const inert = [
      button,
      canvas.getByRole('button', { name: 'Resending this message' }),
      canvasElement.querySelector('a[data-bubble-part="content"]')!,
    ];

    for (const body of inert) {
      const bubble = bubbleOf(body);

      await expect(bubble.matches(hoverTintSelector(bubble))).toBe(false);
    }
  },
};

export const AsChild: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble variant="muted">
        <BubbleContent asChild>
          <p>A prose turn rendered as a real paragraph.</p>
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent asChild>
          <a href="#thread">Jump to the full thread</a>
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const paragraph = canvas.getByText(
      'A prose turn rendered as a real paragraph.'
    );
    await expect(paragraph.tagName).toBe('P');
    await expect(paragraph).toHaveAttribute('data-slot', 'bubble-content');

    const link = canvas.getByRole('link', { name: 'Jump to the full thread' });
    await expect(link).toHaveAttribute('href', '#thread');
    await expect(link).toHaveAttribute('data-slot', 'bubble-content');
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <div className={column}>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Delivery failed.</BubbleContent>
        <BubbleReactions>⚠️ 1</BubbleReactions>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bubble = canvasElement.querySelector('[data-slot="bubble"]')!;

    await expect(bubble).toHaveAttribute('data-slot', 'bubble');
    await expect(bubble).toHaveAttribute('data-variant', 'destructive');
    await expect(bubble).toHaveAttribute('data-align', 'end');

    await expect(
      bubble.querySelector('[data-slot="bubble-content"]')
    ).not.toBeNull();
    const pill = bubble.querySelector('[data-slot="bubble-reactions"]')!;

    await expect(pill).not.toBeNull();
    await expect(pill).toHaveAttribute('data-side', 'bottom');
    await expect(pill).toHaveAttribute('data-align', 'end');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongUnbrokenContent: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble>
        <BubbleContent>
          https://nexuslabs.example.com/observability/traces/0f3a9c1b-77de-4a02-9d31-2c8be5f10a44?span=render&amp;expand=all
        </BubbleContent>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>
          Supercalifragilisticexpialidociousantidisestablishmentarianismpneumonoultramicroscopicsilicovolcanoconiosis
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble-group"]'
    )!;
    const bubbles = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble"]'
    );

    for (const bubble of bubbles) {
      await expect(bubble.getBoundingClientRect().width).toBeLessThanOrEqual(
        group.getBoundingClientRect().width + 1
      );
      await expect(bubble.scrollWidth).toBeLessThanOrEqual(
        bubble.clientWidth + 1
      );
    }
  },
};

export const WithCodeBlock: Story = {
  render: () => (
    <div className={column}>
      <Bubble>
        <BubbleContent>
          <p className="nx:mb-2">
            Run{' '}
            <code className="nx:typography-code-inline">
              pnpm audit:contrast
            </code>{' '}
            before pushing:
          </p>
          <pre className="nx:rounded-md nx:bg-container nx:p-3 nx:typography-code-block nx:text-container-foreground">
            <code>
              pnpm --filter @nexus_ds/core audit:contrast --reporter=verbose
              --bail
            </code>
          </pre>
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bubble = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble"]'
    )!;
    const pre = bubble.querySelector<HTMLElement>('pre')!;

    await expect(getComputedStyle(pre).whiteSpace).toBe('pre-wrap');
    await expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth + 1);
    await expect(pre.getBoundingClientRect().right).toBeLessThanOrEqual(
      bubble.getBoundingClientRect().right + 1
    );
    await expect(bubble.scrollWidth).toBeLessThanOrEqual(
      bubble.clientWidth + 1
    );
  },
};

export const StackedConversation: Story = {
  render: () => (
    <BubbleGroup className={column}>
      <Bubble align="start">
        <BubbleContent>Can you take a look at the failing run?</BubbleContent>
      </Bubble>
      <Bubble align="start">
        <BubbleContent>It started after the token refactor.</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>Looking now.</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="primary">
        <BubbleContent>
          Found it — a semantic token was renamed without updating the registry.
        </BubbleContent>
        <BubbleReactions>🙌 2</BubbleReactions>
      </Bubble>
      <Bubble align="start">
        <BubbleContent>Nice catch.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const bubbles = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="bubble"]')
    );
    const pill = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    )!;
    const bubbleWithPill = pill.closest<HTMLElement>('[data-slot="bubble"]')!;
    const next = bubbles[bubbles.indexOf(bubbleWithPill) + 1]!;

    await expect(pill.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      next.getBoundingClientRect().top + 1
    );
  },
};

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- axe requires a
   scrollable region to be keyboard-reachable (scrollable-region-focusable),
   which is the behaviour this story exists to prove. */
export const InScrollContainer: Story = {
  render: () => (
    <div
      data-testid="scroller"
      role="region"
      aria-label="Conversation"
      tabIndex={0}
      className="nx:h-56 nx:w-full nx:max-w-md nx:overflow-y-auto nx:rounded-md nx:border-default nx:border-border-default nx:px-3 nx:py-4 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
    >
      <BubbleGroup>
        <Bubble align="start">
          <BubbleContent>
            First turn, pinned to the top of the scroller.
          </BubbleContent>
          <BubbleReactions side="top" align="start">
            👍 4
          </BubbleReactions>
        </Bubble>
        <Bubble align="end" variant="primary">
          <BubbleContent>Scrolling must not clip either pill.</BubbleContent>
        </Bubble>
        <Bubble align="start">
          <BubbleContent>
            The overhang is reserved by the bubble, so a scroll container crops
            nothing that a non-scrolling stack would show.
          </BubbleContent>
          <BubbleReactions side="bottom" align="end">
            🎉 2
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const scroller = within(canvasElement).getByTestId('scroller');
    const pills = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(2);

    // A pill overhangs the bubble, so the scroller must not gain a horizontal
    // scroll region — that would mean the inline edge is being cropped.
    await expect(scroller.scrollWidth).toBeLessThanOrEqual(
      scroller.clientWidth + 1
    );

    const scrollerBox = scroller.getBoundingClientRect();

    for (const pill of pills) {
      const pillBox = pill.getBoundingClientRect();

      // Inline edges stay inside the padding box on both sides.
      await expect(pillBox.left).toBeGreaterThanOrEqual(scrollerBox.left);
      await expect(pillBox.right).toBeLessThanOrEqual(scrollerBox.right);
    }

    // The top pill hangs above its own bubble yet still clears the scroller's
    // top edge, because the bubble reserved the 12px rather than the stack.
    const topPill = [...pills].find((pill) => pill.dataset.side === 'top')!;
    const topBubble = topPill.closest<HTMLElement>('[data-slot="bubble"]')!;

    await expect(topPill.getBoundingClientRect().top).toBeLessThan(
      topBubble.getBoundingClientRect().top
    );
    await expect(topPill.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      scrollerBox.top
    );
  },
};
/* eslint-enable jsx-a11y/no-noninteractive-tabindex */

// ============================================
// COMPOSITION
// ============================================

const receiptIconClassName =
  'nx:inline-flex nx:size-5 nx:shrink-0 nx:cursor-pointer nx:items-center nx:justify-center nx:rounded-sm nx:opacity-70 nx:transition-opacity nx:duration-faster nx:hover:opacity-100 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&_svg]:size-4';

export const WithTooltip: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <BubbleGroup className={column}>
        <Bubble
          align="end"
          variant="primary"
          className="nx:flex nx:items-end nx:gap-2"
        >
          <BubbleContent>Deployed the release candidate.</BubbleContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Delivery details"
                className={receiptIconClassName}
              >
                <CheckCheckIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>Read 09:15 &middot; 24 Aug 2026</TooltipContent>
          </Tooltip>
        </Bubble>
      </BubbleGroup>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button', { name: 'Delivery details' });

    await expect(
      document.querySelector('[data-slot="tooltip-content"]')
    ).toBeNull();

    await userEvent.hover(icon);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeInTheDocument();
    });

    await userEvent.unhover(icon);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeNull();
    });
  },
};

function MessageDetailsExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <BubbleGroup className={column}>
      <Bubble align="start" className="nx:flex nx:items-end nx:gap-2">
        <BubbleContent>Merged #666 into main.</BubbleContent>
        {/* Popover is click-driven by default, so hover intent is wired
            explicitly on both the trigger and the panel it opens. */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Message details"
              className={receiptIconClassName}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <InfoIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent
            aria-labelledby="bubble-popover-heading"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="nx:flex nx:flex-col nx:gap-1"
          >
            <p
              id="bubble-popover-heading"
              className="nx:typography-label-default"
            >
              Message details
            </p>
            <p className="nx:typography-body-small nx:text-muted-foreground">
              Sent 09:14 &middot; edited once &middot; seen by 3 people
            </p>
          </PopoverContent>
        </Popover>
      </Bubble>
    </BubbleGroup>
  );
}

export const WithPopover: Story = {
  render: () => <MessageDetailsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button', { name: 'Message details' });
    const body = within(document.body);

    await expect(icon).toHaveAttribute('aria-expanded', 'false');

    await userEvent.hover(icon);
    await waitFor(async () => {
      await expect(body.getByText('Message details')).toBeVisible();
    });

    await userEvent.unhover(icon);
    await waitFor(async () => {
      await expect(body.queryByText('Message details')).toBeNull();
    });
  },
};

function ShowMoreExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <BubbleGroup className={column}>
      <Bubble align="start">
        <BubbleContent>
          <Collapsible open={open} onOpenChange={setOpen}>
            <p>
              The token refactor renamed four semantic entries without updating
              the registry, so the theme engine fell back to primitives.
            </p>
            <CollapsibleContent className="nx:mt-2 nx:flex nx:flex-col nx:gap-2">
              <p>
                The APCA gate still passed because it reads resolved values, not
                registry membership &mdash; which is why the audit stayed green.
              </p>
              <p>
                Fix is to reroute the four entries and add a registry-membership
                assertion to the class-ref audit.
              </p>
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="nx:mt-2 nx:-ms-2.5">
                {open ? 'Show less' : 'Show more'}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}

export const ShowMore: Story = {
  render: () => <ShowMoreExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Show more' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/APCA gate still passed/)).toBeNull();

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(canvas.getByText(/APCA gate still passed/)).toBeVisible();
    });
    const collapseTrigger = canvas.getByRole('button', { name: 'Show less' });
    await expect(collapseTrigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(collapseTrigger);

    await waitFor(async () => {
      await expect(canvas.queryByText(/APCA gate still passed/)).toBeNull();
    });
    await expect(
      canvas.getByRole('button', { name: 'Show more' })
    ).toBeInTheDocument();
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className={column}>
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            {variant}
          </p>
          <BubbleGroup>
            <Bubble variant={variant} align="start">
              <BubbleContent>Aligned to the inline start.</BubbleContent>
            </Bubble>
            <Bubble variant={variant} align="end">
              <BubbleContent>Aligned to the inline end.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </div>
      ))}
    </div>
  ),
};
