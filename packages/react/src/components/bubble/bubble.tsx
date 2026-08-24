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
  'nx:group/bubble nx:relative nx:w-fit nx:max-w-[min(80%,45rem)] nx:rounded-xl nx:border-default nx:border-transparent nx:px-4 nx:py-3 nx:typography-body-default nx:transition-colors nx:duration-faster',
  {
    variants: {
      variant: {
        primary:
          'nx:bg-primary-background nx:text-primary-foreground nx:has-[a]:hover:bg-primary-background-hover nx:has-[button]:hover:bg-primary-background-hover',
        muted:
          'nx:bg-muted nx:text-foreground nx:has-[a]:hover:bg-container-active nx:has-[button]:hover:bg-container-active',
        outline:
          'nx:border-border-default nx:text-foreground nx:has-[a]:hover:bg-background-hover nx:has-[button]:hover:bg-background-hover',
        ghost:
          'nx:text-foreground nx:has-[a]:hover:bg-background-hover nx:has-[button]:hover:bg-background-hover',
        destructive:
          'nx:bg-error-subtle nx:text-error-subtle-foreground nx:has-[a]:hover:bg-error-subtle-hover nx:has-[button]:hover:bg-error-subtle-hover',
      },
      align: {
        start: 'nx:me-auto',
        end: 'nx:ms-auto',
      },
    },
    defaultVariants: {
      variant: 'muted',
      align: 'start',
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
 * `align` is logical, not physical — a stream flips end-to-end under
 * `dir="rtl"` with no direction provider and no per-call-site overrides.
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
  align = 'start',
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
   * cursor, and the surrounding `Bubble`'s hover tint. It still owns its own
   * accessible name.
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
 * The message body. Long words, URLs, and nested `pre` blocks wrap rather than
 * widen the bubble. Anchors are underlined whether the body itself is the
 * link or the link sits inside its text.
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
      className={cn(
        'nx:block nx:min-w-0 nx:rounded-[inherit] nx:text-start nx:wrap-break-word nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&:is(a,button)]:cursor-pointer nx:[&:is(a)]:underline nx:[&:is(a)]:underline-offset-4 nx:[&_a]:underline nx:[&_a]:underline-offset-4 nx:[&_pre]:whitespace-pre-wrap nx:[&_pre]:wrap-break-word',
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
