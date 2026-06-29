import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * ItemGroup
 *
 * A vertical stack of related `Item`s, divided by `ItemSeparator`. No ARIA
 * `list` role is imposed — `Item` is also used standalone, so list/listitem
 * semantics are the consumer's to add when the grouping is truly a list.
 */
function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-group"
      className={cn('nx:group/item-group nx:flex nx:flex-col', className)}
      {...props}
    />
  );
}

/**
 * ItemSeparator
 *
 * A flush horizontal rule between items in an `ItemGroup`.
 */
function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('nx:my-0', className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  'nx:group/item nx:flex nx:flex-wrap nx:items-center nx:rounded-md nx:border-default nx:border-transparent nx:typography-body-default nx:transition-colors nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[a]:hover:bg-background-hover',
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
 * ItemProps
 *
 * Props for the Item component.
 */
interface ItemProps
  extends React.ComponentProps<'div'>, VariantProps<typeof itemVariants> {
  /**
   * Render as the child element via Radix Slot — e.g. an `<a>` or router link —
   * keeping the item styling.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Item
 *
 * A flexible list row — media (icon / image) + title + description + actions.
 * Compose with `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, and
 * `ItemActions`; group rows with `ItemGroup` divided by `ItemSeparator`. The
 * `outline` and `muted` variants give the row a visible surface; size `sm` is a
 * denser row. When rendered `asChild` as a link it gains hover + focus affordances.
 *
 * @example
 * ```tsx
 * <Item variant="outline">
 *   <ItemMedia variant="icon">
 *     <IconFile />
 *   </ItemMedia>
 *   <ItemContent>
 *     <ItemTitle>Report.pdf</ItemTitle>
 *     <ItemDescription>2.4 MB · edited 3d ago</ItemDescription>
 *   </ItemContent>
 *   <ItemActions>
 *     <Button size="sm" variant="outline">Open</Button>
 *   </ItemActions>
 * </Item>
 * ```
 */
function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ItemProps) {
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

const itemMediaVariants = cva(
  'nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:gap-2 nx:group-has-data-[slot=item-description]/item:translate-y-0.5 nx:group-has-data-[slot=item-description]/item:self-start nx:[&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        icon: 'nx:size-8 nx:rounded-sm nx:border-default nx:border-border-default nx:bg-muted nx:[&_svg]:size-4',
        image:
          'nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * ItemMediaProps
 *
 * Props for the ItemMedia component.
 */
interface ItemMediaProps
  extends React.ComponentProps<'div'>, VariantProps<typeof itemMediaVariants> {}

/**
 * ItemMedia
 *
 * The leading visual of an item. `icon` renders a muted rounded medallion;
 * `image` a square thumbnail that cover-fits its `<img>`; `default` is an
 * unstyled wrapper.
 */
function ItemMedia({
  className,
  variant = 'default',
  ...props
}: ItemMediaProps) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * ItemContent
 *
 * The middle column — title and description — that grows to fill the row.
 */
function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'nx:flex nx:flex-1 nx:flex-col nx:gap-1 nx:[&+[data-slot=item-content]]:flex-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * ItemTitle
 *
 * The item's primary label.
 */
function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
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
}

/**
 * ItemDescription
 *
 * Supporting copy beneath the title; clamps to two lines, anchors underlined.
 */
function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'nx:line-clamp-2 nx:typography-body-default nx:text-balance nx:text-muted-foreground nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * ItemActions
 *
 * The trailing controls of a row — typically one or two buttons.
 */
function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('nx:flex nx:items-center nx:gap-2', className)}
      {...props}
    />
  );
}

/**
 * ItemHeader
 *
 * A full-width row above the media/content — e.g. a label and a meta value.
 */
function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
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
}

/**
 * ItemFooter
 *
 * A full-width row below the media/content.
 */
function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
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
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  type ItemMediaProps,
  itemMediaVariants,
  type ItemProps,
  ItemSeparator,
  ItemTitle,
  itemVariants,
};
