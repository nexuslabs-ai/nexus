import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Input } from '../input';
import { Textarea } from '../textarea';

const inputGroupVariants = cva(
  [
    'nx:group/input-group nx:relative nx:flex nx:box-border nx:w-full nx:min-w-0 nx:items-center nx:rounded-md nx:border-0 nx:transition-colors nx:outline-none',
    // Size: an inline group matches standalone Input's height for the
    // control's data-size. `not-has-[>[data-align^=block]]` scopes this to
    // non-stacked layouts (no block addon) so the fixed-height rule and the
    // auto-height stacked case are mutually exclusive — they never both
    // match.
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=sm]]:h-8',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=default]]:h-10',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=lg]]:h-12',
    // The control fills the fixed-height frame without adding height (the
    // compound :has() selector outranks Input's own h-* by specificity).
    // Released in the stacked case, where the control keeps its own height.
    'nx:not-has-[>[data-align^=block]]:[&>input]:h-full',
    // Alignment: addons push the control's padding to make room.
    'nx:has-[>[data-align=inline-start]]:[&>input]:pl-2',
    'nx:has-[>[data-align=inline-end]]:[&>input]:pr-2',
    'nx:has-[>[data-align=block-start]]:flex-col nx:has-[>[data-align=block-start]]:[&>input]:pb-3',
    'nx:has-[>[data-align=block-end]]:flex-col nx:has-[>[data-align=block-end]]:[&>input]:pt-3',
    'nx:data-[disabled=true]:cursor-not-allowed nx:data-[disabled=true]:bg-disabled',
    // Focus: the group shows the ring when the inner control is focused
    // (the control suppresses its own outline).
    'nx:has-[[data-slot=input-group-control]:focus-visible]:outline-2 nx:has-[[data-slot=input-group-control]:focus-visible]:outline-focus-default nx:has-[[data-slot=input-group-control]:focus-visible]:outline-offset-(--focus-offset)',
    // Error: an invalid control reddens the border; an invalid focused
    // control switches the ring to the error colour (matches Input).
    'nx:has-[[data-slot][aria-invalid=true]]:border-border-error',
    'nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-focus-error',
  ],
  {
    variants: {
      variant: {
        default:
          'nx:border-border-default nx:bg-background nx:not-data-[disabled=true]:hover:bg-background-hover nx:data-[disabled=true]:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:not-data-[disabled=true]:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * InputGroupProps
 *
 * Props for the InputGroup component.
 */
interface InputGroupProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof inputGroupVariants> {}

/**
 * InputGroup
 *
 * Wraps an input (or textarea) with leading/trailing addons — icons, text,
 * buttons, or kbd hints — inside one framed field that shares a focus ring.
 * Place an `InputGroupInput` / `InputGroupTextarea` as the control and one or
 * more `InputGroupAddon`s (positioned with `align`) around it; the whole group
 * lights up when the control is focused, and reflects the control's invalid
 * state.
 *
 * The visible frame matches a standalone `Input`: an inline group takes the
 * control's `size` height. Stacked (block-aligned) groups stay auto-height.
 * Use `variant="borderless"` to remove the resting field stroke while keeping a
 * tonal control fill for resting affordance.
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
function InputGroup({ className, variant, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      data-variant={variant ?? 'default'}
      role="group"
      className={cn(inputGroupVariants({ variant, className }))}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  'nx:flex nx:h-auto nx:cursor-text nx:items-center nx:justify-start nx:gap-2 nx:py-1.5 nx:typography-label-default nx:text-muted-foreground nx:select-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&>kbd]:rounded-sm nx:[&>svg]:size-4',
  {
    variants: {
      align: {
        'inline-start':
          'nx:order-first nx:pl-3 nx:has-[>button]:-ml-2 nx:has-[>kbd]:-ml-1.5',
        'inline-end':
          'nx:order-last nx:pr-3 nx:has-[>button]:-mr-2 nx:has-[>kbd]:-mr-1.5',
        'block-start': 'nx:order-first nx:w-full nx:px-3 nx:pt-3',
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
  'nx:flex nx:items-center nx:py-0 nx:typography-label-default nx:shadow-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground',
  {
    variants: {
      size: {
        xs: 'nx:h-6 nx:gap-1 nx:rounded-sm nx:px-2 nx:has-[>svg]:px-2 nx:[&>svg]:size-3.5',
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
      data-slot="input-group-button"
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

/**
 * InputGroupTextProps
 *
 * Props for the InputGroupText component.
 */
interface InputGroupTextProps extends React.ComponentProps<'span'> {}

/**
 * InputGroupText
 *
 * Inline addon text — a unit, a label, a prefix.
 */
function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        'nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * InputGroupInputProps
 *
 * Props for the InputGroupInput component.
 */
interface InputGroupInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'variant'
> {}

/**
 * InputGroupInput
 *
 * The text input inside an `InputGroup` — borderless and transparent so the
 * group provides the frame and focus ring. Keeps `Input`'s per-size padding and
 * typography; the group supplies the height.
 */
function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'nx:flex-1 nx:rounded-none nx:border-0 nx:bg-transparent nx:enabled:hover:bg-transparent nx:focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * InputGroupTextareaProps
 *
 * Props for the InputGroupTextarea component.
 */
interface InputGroupTextareaProps extends Omit<
  React.ComponentProps<typeof Textarea>,
  'variant'
> {}

/**
 * InputGroupTextarea
 *
 * The textarea inside an `InputGroup` — borderless and transparent so the group
 * provides the frame and focus ring.
 */
function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'nx:flex-1 nx:resize-none nx:rounded-none nx:border-0 nx:bg-transparent nx:enabled:hover:bg-transparent nx:py-3 nx:shadow-none nx:focus-visible:outline-none',
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
  type InputGroupInputProps,
  type InputGroupProps,
  InputGroupText,
  InputGroupTextarea,
  type InputGroupTextareaProps,
  type InputGroupTextProps,
  inputGroupVariants,
};
