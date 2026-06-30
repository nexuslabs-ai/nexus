import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { overlayCloseButtonClassName } from '@/components/ui/overlay-layout/overlay-layout';
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
        'nx:data-[state=open]:duration-slower nx:data-[state=open]:ease-enter',
        'nx:data-[state=closed]:duration-slow nx:data-[state=closed]:ease-exit',
        'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
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
    'nx:fixed nx:z-modal nx:flex nx:flex-col nx:overflow-y-auto',
    'nx:bg-container nx:shadow-lg',
    'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
    'nx:data-[state=open]:duration-slower nx:data-[state=open]:ease-enter',
    'nx:data-[state=closed]:duration-slow nx:data-[state=closed]:ease-exit',
    'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
    'nx:motion-reduce:data-[state=open]:duration-0 nx:motion-reduce:data-[state=closed]:duration-0'
  ),
  {
    variants: {
      side: {
        top: cn(
          'nx:inset-x-0 nx:top-0 nx:h-auto nx:max-h-svh nx:border-b-default nx:border-border-default',
          'nx:data-[state=open]:slide-in-from-top nx:data-[state=closed]:slide-out-to-top'
        ),
        bottom: cn(
          'nx:inset-x-0 nx:bottom-0 nx:h-auto nx:max-h-svh nx:border-t-default nx:border-border-default',
          'nx:data-[state=open]:slide-in-from-bottom nx:data-[state=closed]:slide-out-to-bottom'
        ),
        left: cn(
          'nx:left-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-r-default nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=open]:slide-in-from-left nx:data-[state=closed]:slide-out-to-left'
        ),
        right: cn(
          'nx:right-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-l-default nx:border-border-default nx:sm:max-w-sm',
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
            className={overlayCloseButtonClassName}
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
      className={cn('nx:flex nx:flex-col nx:gap-1 nx:p-6', className)}
      {...props}
    />
  );
}

/**
 * SheetBodyProps
 *
 * Props for the SheetBody component.
 */
interface SheetBodyProps extends React.ComponentProps<'div'> {}

/**
 * SheetBody
 *
 * Container for the sheet's main content between the header and footer. Insets
 * its content horizontally to match SheetHeader and SheetFooter; vertical
 * separation comes from the header's and footer's padding.
 *
 * @example
 * ```tsx
 * <SheetBody>
 *   <p>Main content.</p>
 * </SheetBody>
 * ```
 */
function SheetBody({ className, ...props }: SheetBodyProps) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('nx:px-6', className)}
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
        'nx:mt-auto nx:flex nx:flex-col nx:gap-2 nx:p-6',
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
      className={cn('nx:typography-heading-xsmall', className)}
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
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBody,
  type SheetBodyProps,
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
