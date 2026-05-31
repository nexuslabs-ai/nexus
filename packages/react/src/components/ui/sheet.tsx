import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * Sheet
 *
 * Root component for the sheet — a panel that slides in from an edge of the
 * viewport. Built on Radix Dialog; controls open/close state.
 *
 * @example
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild>
 *     <Button>Open Sheet</Button>
 *   </SheetTrigger>
 *   <SheetContent side="right">
 *     <SheetHeader>
 *       <SheetTitle>Sheet Title</SheetTitle>
 *       <SheetDescription>Sheet description here.</SheetDescription>
 *     </SheetHeader>
 *     <SheetFooter>
 *       <Button>Save</Button>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 */
const Sheet = DialogPrimitive.Root;

/**
 * SheetTrigger
 *
 * Button that opens the sheet. Use `asChild` to render as your own component.
 */
const SheetTrigger = DialogPrimitive.Trigger;

/**
 * SheetPortal
 *
 * Portals the sheet content to document.body.
 */
const SheetPortal = DialogPrimitive.Portal;

/**
 * SheetClose
 *
 * Button that closes the sheet. Use `asChild` to render as your own component.
 */
const SheetClose = DialogPrimitive.Close;

/**
 * SheetOverlayProps
 *
 * Props for the SheetOverlay component.
 */
interface SheetOverlayProps extends React.ComponentProps<
  typeof DialogPrimitive.Overlay
> {}

/**
 * SheetOverlay
 *
 * Semi-transparent overlay behind the sheet content.
 */
function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
        'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * Per-side positioning and slide motion for the sheet panel. Each side pins the
 * panel to an edge and slides it fully on/off screen from that edge — the bare
 * `slide-*` utilities translate by 100% (the spacing-scaled `slide-*-N` forms
 * resolve to 0 under the Nexus spacing reset, so they would not move).
 */
const sheetContentVariants = cva(
  cn(
    'nx:fixed nx:z-modal nx:flex nx:flex-col nx:gap-container',
    'nx:bg-container nx:shadow-lg nx:ease-in-out',
    'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
    'nx:data-[state=open]:duration-500 nx:data-[state=closed]:duration-300'
  ),
  {
    variants: {
      side: {
        top: cn(
          'nx:inset-x-0 nx:top-0 nx:h-auto nx:border-b nx:border-border-default',
          'nx:data-[state=open]:slide-in-from-top nx:data-[state=closed]:slide-out-to-top'
        ),
        bottom: cn(
          'nx:inset-x-0 nx:bottom-0 nx:h-auto nx:border-t nx:border-border-default',
          'nx:data-[state=open]:slide-in-from-bottom nx:data-[state=closed]:slide-out-to-bottom'
        ),
        left: cn(
          'nx:inset-y-0 nx:left-0 nx:h-full nx:w-3/4 nx:border-r nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=open]:slide-in-from-left nx:data-[state=closed]:slide-out-to-left'
        ),
        right: cn(
          'nx:inset-y-0 nx:right-0 nx:h-full nx:w-3/4 nx:border-l nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=open]:slide-in-from-right nx:data-[state=closed]:slide-out-to-right'
        ),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

/**
 * SheetContentProps
 *
 * Props for the SheetContent component.
 */
interface SheetContentProps
  extends
    React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * SheetContent
 *
 * The sliding panel. Renders inside a portal with an overlay; the `side` prop
 * picks which edge it slides from (defaults to `right`).
 *
 * @example
 * ```tsx
 * <SheetContent side="left">
 *   <SheetHeader>
 *     <SheetTitle>Navigation</SheetTitle>
 *   </SheetHeader>
 * </SheetContent>
 * ```
 */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="sheet-close-button"
            className={cn(
              'nx:absolute nx:right-4 nx:top-4 nx:rounded-sm nx:opacity-70',
              'nx:transition-opacity',
              'nx:hover:opacity-100',
              'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
              'nx:disabled:pointer-events-none',
              'nx:data-[state=open]:bg-muted nx:data-[state=open]:text-muted-foreground'
            )}
          >
            <IconX className="nx:size-4" />
            <span className="nx:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

/**
 * SheetHeaderProps
 *
 * Props for the SheetHeader component.
 */
interface SheetHeaderProps extends React.ComponentProps<'div'> {}

/**
 * SheetHeader
 *
 * Container for sheet title and description. Provides consistent spacing.
 *
 * @example
 * ```tsx
 * <SheetHeader>
 *   <SheetTitle>Title</SheetTitle>
 *   <SheetDescription>Description</SheetDescription>
 * </SheetHeader>
 * ```
 */
function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        // nexus-allow-numeric: SheetHeader sub-element rhythm
        'nx:flex nx:flex-col nx:gap-1.5 nx:p-container',
        className
      )}
      {...props}
    />
  );
}

/**
 * SheetFooterProps
 *
 * Props for the SheetFooter component.
 */
interface SheetFooterProps extends React.ComponentProps<'div'> {}

/**
 * SheetFooter
 *
 * Container for sheet action buttons. Pinned to the bottom of the panel.
 *
 * @example
 * ```tsx
 * <SheetFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save</Button>
 * </SheetFooter>
 * ```
 */
function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        // nexus-allow-numeric: SheetFooter sub-element rhythm
        'nx:mt-auto nx:flex nx:flex-col nx:gap-2 nx:p-container',
        className
      )}
      {...props}
    />
  );
}

/**
 * SheetTitleProps
 *
 * Props for the SheetTitle component.
 */
interface SheetTitleProps extends React.ComponentProps<
  typeof DialogPrimitive.Title
> {}

/**
 * SheetTitle
 *
 * The title of the sheet. Should be used within SheetHeader.
 *
 * @example
 * ```tsx
 * <SheetTitle>Edit Profile</SheetTitle>
 * ```
 */
function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight',
        className
      )}
      {...props}
    />
  );
}

/**
 * SheetDescriptionProps
 *
 * Props for the SheetDescription component.
 */
interface SheetDescriptionProps extends React.ComponentProps<
  typeof DialogPrimitive.Description
> {}

/**
 * SheetDescription
 *
 * Supporting text that provides additional context for the sheet.
 *
 * @example
 * ```tsx
 * <SheetDescription>
 *   Make changes to your profile here. Click save when you're done.
 * </SheetDescription>
 * ```
 */
function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('nx:text-sm nx:text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  type SheetContentProps,
  sheetContentVariants,
  SheetDescription,
  type SheetDescriptionProps,
  SheetFooter,
  type SheetFooterProps,
  SheetHeader,
  type SheetHeaderProps,
  SheetOverlay,
  type SheetOverlayProps,
  SheetPortal,
  SheetTitle,
  type SheetTitleProps,
  SheetTrigger,
};
