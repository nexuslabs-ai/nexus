import * as React from 'react';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';
import { toggleVariants } from '../toggle';

type ToolbarProps = React.ComponentProps<typeof ToolbarPrimitive.Root>;

/** Label the toolbar with aria-label or aria-labelledby. Controls wrap in DOM order. */
function Toolbar({
  className,
  orientation = 'horizontal',
  ...props
}: ToolbarProps) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'nx:flex nx:w-fit nx:max-w-full nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-0.5 nx:shadow-sm nx:data-[orientation=vertical]:w-fit nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    />
  );
}

type ToolbarButtonProps = React.ComponentProps<typeof ToolbarPrimitive.Button> &
  VariantProps<typeof buttonVariants>;

function ToolbarButton({
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ToolbarButtonProps) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

type ToolbarLinkProps = React.ComponentProps<typeof ToolbarPrimitive.Link> &
  VariantProps<typeof buttonVariants>;

function ToolbarLink({
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ToolbarLinkProps) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function ToolbarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5',
        className
      )}
      {...props}
    />
  );
}

type ToolbarToggleGroupProps = React.ComponentProps<
  typeof ToolbarPrimitive.ToggleGroup
>;

function ToolbarToggleGroup({ className, ...props }: ToolbarToggleGroupProps) {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      role={props.type === 'single' ? 'radiogroup' : 'group'}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    />
  );
}

type ToolbarToggleItemProps = React.ComponentProps<
  typeof ToolbarPrimitive.ToggleItem
> &
  Pick<VariantProps<typeof buttonVariants>, 'size'>;

function ToolbarToggleItem({
  className,
  size = 'sm',
  ...props
}: ToolbarToggleItemProps) {
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      data-size={size}
      className={cn(
        toggleVariants(),
        buttonVariants({ variant: 'ghost', size }),
        'nx:py-0 nx:data-[state=on]:bg-transparent nx:data-[state=on]:text-primary-subtle-foreground nx:data-[state=on]:[font-weight:var(--nx-typography-weight-bold)] nx:data-[state=on]:hover:bg-transparent nx:data-[state=on]:hover:text-primary-subtle-foreground nx:data-[state=on]:[&_svg]:stroke-[3]',
        className
      )}
      {...props}
    />
  );
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'nx:shrink-0 nx:bg-border-default nx:data-[orientation=vertical]:h-5 nx:data-[orientation=vertical]:w-px nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        className
      )}
      {...props}
    />
  );
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
};
export type {
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarProps,
  ToolbarToggleGroupProps,
  ToolbarToggleItemProps,
};
