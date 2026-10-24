import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * BubbleGroupProps
 *
 * Props for the BubbleGroup component.
 */
type BubbleGroupProps = React.ComponentProps<'div'>;

/**
 * Vertical stack of consecutive bubbles. It adds no list role, so add list or log semantics when the stack needs them.
 */
const BubbleGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<BubbleGroupProps>
>(function BubbleGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<BubbleGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="bubble-group"
      className={cn('nx:flex nx:w-full nx:flex-col nx:gap-4', className)}
      {...props}
    />
  );
});

const bubbleVariants = cva(
  [
    'nx:relative nx:w-fit nx:max-w-[min(80%,45rem)] nx:rounded-xl nx:border-default nx:border-transparent nx:typography-body-default',
    'nx:has-[>[data-bubble-part=reactions][data-side=top]]:mt-3 nx:has-[>[data-bubble-part=reactions][data-side=bottom]]:mb-3',
  ],
  {
    variants: {
      variant: {
        primary: 'nx:bg-primary-background nx:text-primary-foreground',
        muted: 'nx:bg-muted nx:text-foreground',
        outline: 'nx:border-border-default nx:text-foreground',
        ghost: 'nx:text-foreground',
        destructive: 'nx:bg-error-subtle nx:text-error-subtle-foreground',
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
type BubbleProps = React.ComponentProps<'div'> &
  VariantProps<typeof bubbleVariants>;

/**
 * One message in a conversation. It holds no chat state, speaker or timestamp.
 * Put the text in `BubbleContent` and stack turns with `BubbleGroup`.
 *
 * With `BubbleReactions`, use a flex or grid parent such as `BubbleGroup`, so facing reaction pills don't touch.
 *
 * `align` has no default, so the parent sets the position. `align` is logical, so `end` flips under `dir="rtl"`.
 */
const Bubble = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<BubbleProps>
>(function Bubble(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'muted',
    align,
    ...props
  }: React.PropsWithoutRef<BubbleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant, align }), className)}
      {...props}
    />
  );
});

/**
 * BubbleContentProps
 *
 * Props for the BubbleContent component.
 */
interface BubbleContentProps extends React.ComponentProps<'div'> {
  /**
   * Renders the child element instead, such as `p`, `a` or `button`.
   * An actionable child gets the focus ring and pointer cursor.
   */
  asChild?: boolean;
}

/**
 * Message body. It holds the padding, so an `a` or `button` body fills the whole bubble.
 * Long words, URLs and `pre` blocks wrap. Links with an `href` are underlined.
 * To restyle links or `pre` blocks, use the `!` modifier, such as `nx:no-underline!`.
 */
const BubbleContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<BubbleContentProps>
>(function BubbleContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    asChild = false,
    ...props
  }: React.PropsWithoutRef<BubbleContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="bubble-content"
      className={cn(
        'nx:m-0 nx:block nx:min-w-0 nx:rounded-[inherit] nx:border-0 nx:bg-transparent nx:px-4 nx:py-3 nx:[font:inherit] nx:text-inherit nx:no-underline nx:text-start nx:wrap-break-word nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:cursor-pointer nx:[&:is(a[href]),&_:where(a[href])]:underline nx:[&_:where(a[href])]:text-inherit nx:[&:is(a[href]),&_:where(a[href])]:underline-offset-4 nx:[&_:where(pre)]:whitespace-pre-wrap nx:[&_:where(pre)]:wrap-break-word',
        className
      )}
      {...props}
    />
  );
});

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
type BubbleReactionsProps = React.ComponentProps<'div'> &
  VariantProps<typeof bubbleReactionsVariants>;

/**
 * Reaction pill overhanging a corner of the bubble. `side` picks top or bottom.
 * `align` is logical, so `start` sits on the right under `dir="rtl"`.
 */
const BubbleReactions = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<BubbleReactionsProps>
>(function BubbleReactions(propsWithoutRef, forwardedRef) {
  const {
    className,
    side = 'bottom',
    align = 'end',
    ...props
  }: React.PropsWithoutRef<BubbleReactionsProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
