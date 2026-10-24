import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Separator } from '../separator/separator';

/**
 * Vertical stack of related `Item`s, divided by `ItemSeparator`. It adds no
 * list role, so add `role="list"` and `role="listitem"` if the group is a list.
 */
const ItemGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ItemGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-group"
      className={cn('nx:group/item-group nx:flex nx:flex-col', className)}
      {...props}
    />
  );
});

/**
 * Horizontal rule between items in an `ItemGroup`.
 */
const ItemSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<typeof Separator>>
>(function ItemSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<typeof Separator>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('nx:my-0', className)}
      {...props}
    />
  );
});

const itemVariants = cva(
  'nx:text-inherit nx:no-underline nx:group/item nx:flex nx:flex-wrap nx:items-center nx:rounded-md nx:border-default nx:border-transparent nx:typography-body-default nx:transition-control nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[a]:hover:bg-background-hover',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        outline: 'nx:border-border-default',
        muted: 'nx:bg-muted',
      },
      size: {
        default: 'nx:gap-4 nx:p-4',
        sm: 'nx:gap-2.5 nx:px-4 nx:py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Props for the Item component.
 */
interface ItemProps
  extends React.ComponentProps<'div'>, VariantProps<typeof itemVariants> {
  /**
   * Renders the child element, such as a link, with the item styling. A link
   * child gets hover styles with no extra classes.
   */
  asChild?: boolean;
}

/**
 * Row with media, a title, a description and actions. Build it from
 * `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription` and `ItemActions`.
 */
const Item = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<ItemProps>>(
  function Item(propsWithoutRef, forwardedRef) {
    const {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    }: React.PropsWithoutRef<ItemProps> & {
      ref?: React.ForwardedRef<HTMLDivElement>;
    } = forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        data-slot="item"
        data-variant={variant}
        data-size={size}
        className={cn(itemVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

const itemMediaVariants = cva(
  'nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:gap-2 nx:group-has-[[data-item-part=description]]/item:translate-y-0.5 nx:group-has-[[data-item-part=description]]/item:self-start nx:[&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        icon: 'nx:size-8 nx:rounded-sm nx:border-default nx:border-border-default nx:bg-muted nx:[&_svg]:size-4',
        image:
          'nx:relative nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Props for the ItemMedia component.
 */
type ItemMediaProps = React.ComponentProps<'div'> &
  VariantProps<typeof itemMediaVariants>;

/**
 * Leading visual of an item. `icon` adds a muted rounded tile, and `image`
 * crops its `<img>` to a square thumbnail.
 */
const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ItemMediaProps>
>(function ItemMedia(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<ItemMediaProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Props for the ItemContent component.
 */
type ItemContentProps = React.ComponentProps<'div'>;

/**
 * Column for the title and description. Grows to fill the row.
 */
const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ItemContentProps>
>(function ItemContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ItemContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-content"
      // Structural hook: wrappers rename data-slot, so Item's CSS keys off this.
      data-item-part="content"
      className={cn(
        // min-w-0 lets the column shrink past its content so a title can truncate.
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-1 nx:[&+[data-item-part=content]]:flex-none',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the ItemTitle component.
 */
type ItemTitleProps = React.ComponentProps<'div'>;

/**
 * Primary label of the item.
 */
const ItemTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ItemTitleProps>
>(function ItemTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ItemTitleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-title"
      className={cn(
        'nx:flex nx:w-fit nx:items-center nx:gap-2 nx:typography-label-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the ItemDescription component.
 */
type ItemDescriptionProps = React.ComponentProps<'p'>;

/**
 * Supporting text under the title. Cuts off after two lines and underlines
 * links.
 */
const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<ItemDescriptionProps>
>(function ItemDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ItemDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <p
      data-slot="item-description"
      // Structural hook — see ItemContent.
      data-item-part="description"
      className={cn(
        'nx:m-0 nx:line-clamp-2 nx:typography-body-default nx:text-balance nx:text-muted-foreground nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the ItemActions component.
 */
type ItemActionsProps = React.ComponentProps<'div'>;

/**
 * Trailing controls of the row, usually one or two buttons.
 */
const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ItemActionsProps>
>(function ItemActions(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ItemActionsProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-actions"
      className={cn('nx:flex nx:items-center nx:gap-2', className)}
      {...props}
    />
  );
});

/**
 * Full-width row above the media and content, such as a label and a value.
 */
const ItemHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ItemHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-header"
      className={cn(
        'nx:flex nx:basis-full nx:items-center nx:justify-between nx:gap-2',
        className
      )}
      {...props}
    />
  );
});

/**
 * Full-width row below the media and content.
 */
const ItemFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ItemFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'nx:flex nx:basis-full nx:items-center nx:justify-between nx:gap-2',
        className
      )}
      {...props}
    />
  );
});

export {
  Item,
  ItemActions,
  type ItemActionsProps,
  ItemContent,
  type ItemContentProps,
  ItemDescription,
  type ItemDescriptionProps,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  type ItemMediaProps,
  itemMediaVariants,
  type ItemProps,
  ItemSeparator,
  ItemTitle,
  type ItemTitleProps,
  itemVariants,
};
