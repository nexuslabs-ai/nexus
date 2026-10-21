import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Separator } from '../separator/separator';

/**
 * Vertical stack of related `Item`s, divided by `ItemSeparator`. It adds no
 * list role, so add `role="list"` and `role="listitem"` if the group is a list.
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
 * Horizontal rule between items in an `ItemGroup`.
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
interface ItemMediaProps
  extends React.ComponentProps<'div'>, VariantProps<typeof itemMediaVariants> {}

/**
 * Leading visual of an item. `icon` adds a muted rounded tile, and `image`
 * crops its `<img>` to a square thumbnail.
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
 * Props for the ItemContent component.
 */
interface ItemContentProps extends React.ComponentProps<'div'> {}

/**
 * Column for the title and description. Grows to fill the row.
 */
function ItemContent({ className, ...props }: ItemContentProps) {
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
}

/**
 * Props for the ItemTitle component.
 */
interface ItemTitleProps extends React.ComponentProps<'div'> {}

/**
 * Primary label of the item.
 */
function ItemTitle({ className, ...props }: ItemTitleProps) {
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
 * Props for the ItemDescription component.
 */
interface ItemDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * Supporting text under the title. Cuts off after two lines and underlines
 * links.
 */
function ItemDescription({ className, ...props }: ItemDescriptionProps) {
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
}

/**
 * Props for the ItemActions component.
 */
interface ItemActionsProps extends React.ComponentProps<'div'> {}

/**
 * Trailing controls of the row, usually one or two buttons.
 */
function ItemActions({ className, ...props }: ItemActionsProps) {
  return (
    <div
      data-slot="item-actions"
      className={cn('nx:flex nx:items-center nx:gap-2', className)}
      {...props}
    />
  );
}

/**
 * Full-width row above the media and content, such as a label and a value.
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
 * Full-width row below the media and content.
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
