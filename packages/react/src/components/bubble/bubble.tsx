import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * BubbleGroupProps
 *
 * Props for the BubbleGroup component.
 */
interface BubbleGroupProps extends React.ComponentProps<'div'> {}

/**
 * BubbleGroup
 *
 * A vertical stack of consecutive `Bubble`s. No ARIA `list` role is imposed —
 * `Bubble` is also used standalone, so log/list semantics are the consumer's to
 * add when the stack is genuinely one.
 */
function BubbleGroup({ className, ...props }: BubbleGroupProps) {
  return (
    <div
      data-slot="bubble-group"
      className={cn('nx:flex nx:w-full nx:flex-col nx:gap-4', className)}
      {...props}
    />
  );
}

const bubbleVariants = cva(
  [
    'nx:relative nx:w-fit nx:max-w-[min(80%,45rem)] nx:rounded-xl nx:border-default nx:border-transparent nx:typography-body-default nx:transition-colors nx:duration-faster',
    // The pill overhangs 12px, so the bubble reserves that 12px itself.
    'nx:has-[>[data-bubble-part=reactions][data-side=top]]:mt-3 nx:has-[>[data-bubble-part=reactions][data-side=bottom]]:mb-3',
  ],
  {
    variants: {
      variant: {
        primary:
          'nx:bg-primary-background nx:text-primary-foreground nx:has-[>[data-bubble-part=content]:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:hover:bg-primary-background-hover',
        muted:
          'nx:bg-muted nx:text-foreground nx:has-[>[data-bubble-part=content]:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:hover:bg-popover-active',
        outline:
          'nx:border-border-default nx:text-foreground nx:has-[>[data-bubble-part=content]:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:hover:bg-background-hover',
        ghost:
          'nx:text-foreground nx:has-[>[data-bubble-part=content]:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:hover:bg-background-hover',
        destructive:
          'nx:bg-error-subtle nx:text-error-subtle-foreground nx:has-[>[data-bubble-part=content]:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:hover:bg-error-subtle-hover',
      },
      align: {
        start: 'nx:me-auto',
        end: 'nx:ms-auto',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  }
);

/**
 * BubbleProps
 *
 * Props for the Bubble component.
 */
interface BubbleProps
  extends React.ComponentProps<'div'>, VariantProps<typeof bubbleVariants> {}

/**
 * Bubble
 *
 * A single conversational turn — a surface that carries one speaker's message.
 * Presentational only: it holds no chat state, no speaker identity, and no
 * timestamp logic. Compose it with `BubbleContent` for the message body and
 * `BubbleReactions` for a reaction pill; stack turns with `BubbleGroup`.
 *
 * `align` has no default, so a bubble sits wherever its parent puts it — the
 * natural start edge of a `BubbleGroup`, or an inline-end column that aligns
 * its own children. Set it to override that. It is logical, not physical, so
 * an overridden turn still flips end-to-end under `dir="rtl"` with no
 * direction provider.
 *
 * @example
 * ```tsx
 * <BubbleGroup>
 *   <Bubble>
 *     <BubbleContent>How do I rotate the signing key?</BubbleContent>
 *   </Bubble>
 *   <Bubble variant="primary" align="end">
 *     <BubbleContent>Run `nexus keys rotate` and redeploy.</BubbleContent>
 *   </Bubble>
 * </BubbleGroup>
 * ```
 */
function Bubble({
  className,
  variant = 'muted',
  align,
  ...props
}: BubbleProps) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant, align }), className)}
      {...props}
    />
  );
}

/**
 * BubbleContentProps
 *
 * Props for the BubbleContent component.
 */
interface BubbleContentProps extends React.ComponentProps<'div'> {
  /**
   * Render as the child element instead of a `div`, merging BubbleContent's
   * styles onto it. Use when the message body needs different semantics — a
   * `p` for prose, or an `a` / `button` when the whole turn is actionable.
   *
   * An interactive child takes the design-system focus ring, the pointer
   * cursor, and the surrounding `Bubble`'s hover tint. The tint is the turn
   * advertising itself as actionable, so it is withheld from a body that
   * cannot be actioned — an `a` with no `href`, a disabled `button`, or
   * anything carrying `aria-disabled`. It still owns its own accessible name.
   *
   * @default false
   * @example
   * ```tsx
   * <BubbleContent asChild>
   *   <button type="button">Retry this step</button>
   * </BubbleContent>
   * ```
   */
  asChild?: boolean;
}

/**
 * BubbleContent
 *
 * The message body, and the part that carries the bubble's padding — so when
 * `asChild` makes it an `a` or a `button`, the hit target, the hover tint, and
 * the focus ring all trace the whole surface instead of a box inset within it.
 *
 * Long words, URLs, and nested `pre` blocks wrap rather than widen the bubble.
 * Anchors that can navigate are underlined, whether the body itself is the
 * link or the link sits inside its text; an `a` with no `href` is not.
 */
function BubbleContent({
  className,
  asChild = false,
  ...props
}: BubbleContentProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="bubble-content"
      data-bubble-part="content"
      className={cn(
        'nx:block nx:min-w-0 nx:rounded-[inherit] nx:px-4 nx:py-3 nx:text-start nx:wrap-break-word nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:cursor-pointer nx:[&:is(a[href])]:underline nx:[&:is(a[href])]:underline-offset-4 nx:[&_a[href]]:underline nx:[&_a[href]]:underline-offset-4 nx:[&_pre]:whitespace-pre-wrap nx:[&_pre]:wrap-break-word',
        className
      )}
      {...props}
    />
  );
}

const bubbleReactionsVariants = cva(
  'nx:absolute nx:flex nx:w-fit nx:items-center nx:gap-1 nx:rounded-full nx:border-default nx:border-border-default nx:bg-popover nx:px-2 nx:py-0.5 nx:typography-label-small nx:text-popover-foreground nx:shadow-sm',
  {
    variants: {
      side: {
        top: 'nx:-top-3',
        bottom: 'nx:-bottom-3',
      },
      align: {
        start: 'nx:start-3',
        end: 'nx:end-3',
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'end',
    },
  }
);

/**
 * BubbleReactionsProps
 *
 * Props for the BubbleReactions component.
 */
interface BubbleReactionsProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof bubbleReactionsVariants> {}

/**
 * BubbleReactions
 *
 * A reaction pill overhanging one corner of the bubble. `side` picks the
 * horizontal edge; `align` picks the inline edge and is logical, so `start`
 * resolves to the right under `dir="rtl"`.
 *
 * @example
 * ```tsx
 * <Bubble align="end" variant="primary">
 *   <BubbleContent>Shipped it.</BubbleContent>
 *   <BubbleReactions side="bottom" align="end">🎉 2</BubbleReactions>
 * </Bubble>
 * ```
 */
function BubbleReactions({
  className,
  side = 'bottom',
  align = 'end',
  ...props
}: BubbleReactionsProps) {
  return (
    <div
      data-slot="bubble-reactions"
      data-bubble-part="reactions"
      data-side={side}
      data-align={align}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  );
}

export {
  Bubble,
  BubbleContent,
  type BubbleContentProps,
  BubbleGroup,
  type BubbleGroupProps,
  type BubbleProps,
  BubbleReactions,
  type BubbleReactionsProps,
  bubbleReactionsVariants,
  bubbleVariants,
};
