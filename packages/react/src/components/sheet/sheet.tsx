import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  overlayBodyClassName,
  overlayCloseButtonClassName,
  overlayPanelTransitionClassName,
  overlayScrimTransitionClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root of a panel that slides in from an edge of the viewport. Holds the open
 * state.
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
 * Opens the sheet. Set `asChild` to render your own element.
 */
const SheetTrigger = DialogPrimitive.Trigger;

/**
 * Renders the sheet content into `document.body`.
 */
const SheetPortal = DialogPrimitive.Portal;

/**
 * Closes the sheet. Set `asChild` to render your own element.
 */
const SheetClose = DialogPrimitive.Close;

/**
 * Props for SheetOverlay.
 */
interface SheetOverlayProps extends React.ComponentProps<
  typeof DialogPrimitive.Overlay
> {}

/**
 * Dimmed layer behind the sheet.
 */
function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        overlayScrimTransitionClassName,
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
    'nx:fixed nx:z-modal nx:flex nx:flex-col nx:overflow-hidden',
    'nx:bg-container nx:shadow-lg',
    overlayPanelTransitionClassName
  ),
  {
    variants: {
      side: {
        top: cn(
          'nx:inset-x-0 nx:top-0 nx:h-auto nx:max-h-svh nx:border-b-default nx:border-border-default',
          'nx:data-[state=closed]:-translate-y-full'
        ),
        bottom: cn(
          'nx:inset-x-0 nx:bottom-0 nx:h-auto nx:max-h-svh nx:border-t-default nx:border-border-default',
          'nx:data-[state=closed]:translate-y-full'
        ),
        left: cn(
          'nx:left-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-r-default nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=closed]:-translate-x-full'
        ),
        right: cn(
          'nx:right-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-l-default nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=closed]:translate-x-full'
        ),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

/**
 * Props for SheetContent.
 */
interface SheetContentProps
  extends
    React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  /**
   * Shows the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * The sliding panel, rendered in a portal with an overlay. `side` picks the
 * edge it slides from.
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
 * Props for SheetHeader.
 */
interface SheetHeaderProps extends React.ComponentProps<'div'> {}

/**
 * Holds the title and description.
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
        'nx:flex nx:shrink-0 nx:flex-col nx:gap-1 nx:p-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for SheetBody.
 */
interface SheetBodyProps extends React.ComponentProps<'div'> {}

/**
 * Main content between the header and footer. Its side padding matches
 * SheetHeader and SheetFooter.
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
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...props}
    />
  );
}

/**
 * Props for SheetFooter.
 */
interface SheetFooterProps extends React.ComponentProps<'div'> {}

/**
 * Holds the action buttons, pinned to the bottom of the panel.
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
        'nx:mt-auto nx:flex nx:shrink-0 nx:flex-col nx:gap-2 nx:p-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for SheetTitle.
 */
interface SheetTitleProps extends React.ComponentProps<
  typeof DialogPrimitive.Title
> {}

/**
 * Title of the sheet. Place it inside SheetHeader.
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
 * Props for SheetDescription.
 */
interface SheetDescriptionProps extends React.ComponentProps<
  typeof DialogPrimitive.Description
> {}

/**
 * Supporting text under the title.
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
