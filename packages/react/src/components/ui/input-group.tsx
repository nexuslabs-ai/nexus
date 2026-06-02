import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * InputGroup
 *
 * Wraps an input (or textarea) with leading/trailing addons — icons, text,
 * buttons, or kbd hints — inside one bordered field that shares a focus ring.
 * Place an `InputGroupInput` / `InputGroupTextarea` as the control and one or
 * more `InputGroupAddon`s (positioned with `align`) around it; the whole group
 * lights up when the control is focused, and reflects the control's invalid
 * state.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon>
 *     <IconSearch />
 *   </InputGroupAddon>
 *   <InputGroupInput placeholder="Search…" />
 * </InputGroup>
 * ```
 */
function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        // nexus-allow-numeric: field-internal addon/control padding rhythm
        'nx:group/input-group nx:relative nx:flex nx:w-full nx:min-w-0 nx:items-center nx:rounded-md nx:border nx:border-border-default nx:shadow-xs nx:transition-[color,box-shadow] nx:outline-none',
        // Alignment: addons push the control's padding to make room.
        'nx:has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'nx:has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'nx:has-[>[data-align=block-start]]:flex-col nx:has-[>[data-align=block-start]]:[&>input]:pb-3',
        'nx:has-[>[data-align=block-end]]:flex-col nx:has-[>[data-align=block-end]]:[&>input]:pt-3',
        // Focus: the group shows the ring when the inner control is focused
        // (the control suppresses its own outline).
        'nx:has-[[data-slot=input-group-control]:focus-visible]:outline-2 nx:has-[[data-slot=input-group-control]:focus-visible]:outline-focus-default nx:has-[[data-slot=input-group-control]:focus-visible]:outline-offset-(--focus-offset)',
        // Error: an invalid inner control reddens the group border.
        'nx:has-[[data-slot][aria-invalid=true]]:border-border-error',
        className
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  // nexus-allow-numeric: addon inset rhythm
  'nx:flex nx:h-auto nx:cursor-text nx:items-center nx:justify-start nx:gap-2 nx:py-1.5 nx:typography-label-default nx:text-muted-foreground nx:select-none nx:group-data-[disabled=true]/input-group:opacity-50 nx:[&>kbd]:rounded-sm nx:[&>svg]:size-4',
  {
    variants: {
      align: {
        'inline-start':
          'nx:order-first nx:pl-3 nx:has-[>button]:ml-[-0.45rem] nx:has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'nx:order-last nx:pr-3 nx:has-[>button]:mr-[-0.45rem] nx:has-[>kbd]:mr-[-0.35rem]',
        // nexus-allow-numeric: stacked addon inset matches input padding
        'block-start': 'nx:order-first nx:w-full nx:px-3 nx:pt-3',
        // nexus-allow-numeric: stacked addon inset matches input padding
        'block-end': 'nx:order-last nx:w-full nx:px-3 nx:pb-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

/**
 * InputGroupAddonProps
 *
 * Props for the InputGroupAddon component.
 */
interface InputGroupAddonProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof inputGroupAddonVariants> {}

/**
 * InputGroupAddon
 *
 * A leading / trailing / stacked slot for icons, text, buttons, or kbd hints.
 * Position with `align` — inline (start / end) or stacked (block start / end).
 */
function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'nx:flex nx:items-center nx:text-sm nx:shadow-none',
  {
    variants: {
      size: {
        // nexus-allow-numeric: dense in-field button footprints
        xs: 'nx:h-6 nx:gap-1 nx:rounded-sm nx:px-2 nx:has-[>svg]:px-2 nx:[&>svg]:size-3.5',
        // nexus-allow-numeric: dense in-field button footprints
        sm: 'nx:h-8 nx:gap-1.5 nx:rounded-md nx:px-2.5 nx:has-[>svg]:px-2.5',
        'icon-xs': 'nx:size-6 nx:rounded-sm nx:p-0 nx:has-[>svg]:p-0',
        'icon-sm': 'nx:size-8 nx:p-0 nx:has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
);

/**
 * InputGroupButtonProps
 *
 * Props for the InputGroupButton component.
 */
interface InputGroupButtonProps
  extends
    Omit<React.ComponentProps<typeof Button>, 'size'>,
    VariantProps<typeof inputGroupButtonVariants> {}

/**
 * InputGroupButton
 *
 * A compact button sized to sit inside an `InputGroupAddon` — defaults to the
 * `ghost` variant and the `xs` in-field size.
 */
function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: InputGroupButtonProps) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

/**
 * InputGroupText
 *
 * Inline addon text — a unit, a label, a prefix.
 */
function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        // nexus-allow-numeric: inline addon gap
        'nx:flex nx:items-center nx:gap-2 nx:typography-body-small nx:text-muted-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * InputGroupInput
 *
 * The text input inside an `InputGroup` — borderless and transparent so the
 * group provides the frame and focus ring.
 */
function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'nx:flex-1 nx:rounded-none nx:border-0 nx:bg-transparent nx:shadow-none nx:focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * InputGroupTextarea
 *
 * The textarea inside an `InputGroup` — borderless and transparent so the group
 * provides the frame and focus ring.
 */
function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        // nexus-allow-numeric: textarea inset
        'nx:flex-1 nx:resize-none nx:rounded-none nx:border-0 nx:bg-transparent nx:py-3 nx:shadow-none nx:focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  type InputGroupAddonProps,
  inputGroupAddonVariants,
  InputGroupButton,
  type InputGroupButtonProps,
  inputGroupButtonVariants,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
