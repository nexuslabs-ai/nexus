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
type SheetOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>;

/**
 * Dimmed layer behind the sheet.
 */
const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SheetOverlayProps>
>(function SheetOverlay(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetOverlayProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Per-side positioning and slide motion for the sheet panel. Each side pins the
 * panel to an edge and slides it fully on/off screen from that edge — the bare
 * `slide-*` utilities translate by 100% (the spacing-scaled `slide-*-N` forms
 * resolve to 0 under the nxds spacing reset, so they would not move).
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
   */
  showCloseButton?: boolean;
}

/**
 * The sliding panel, rendered in a portal with an overlay. `side` picks the
 * edge it slides from.
 */
const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SheetContentProps>
>(function SheetContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    side = 'right',
    showCloseButton = true,
    ...props
  }: React.PropsWithoutRef<SheetContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SheetHeader.
 */
type SheetHeaderProps = React.ComponentProps<'div'>;

/**
 * Holds the title and description.
 */
const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SheetHeaderProps>
>(function SheetHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SheetBody.
 */
type SheetBodyProps = React.ComponentProps<'div'>;

/**
 * Main content between the header and footer. Its side padding matches
 * SheetHeader and SheetFooter.
 */
const SheetBody = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SheetBodyProps>
>(function SheetBody(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetBodyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="sheet-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      tabIndex={0}
      {...props}
    />
  );
});

/**
 * Props for SheetFooter.
 */
type SheetFooterProps = React.ComponentProps<'div'>;

/**
 * Holds the action buttons, pinned to the bottom of the panel.
 */
const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SheetFooterProps>
>(function SheetFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SheetTitle.
 */
type SheetTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

/**
 * Title of the sheet. Place it inside SheetHeader.
 */
const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.PropsWithoutRef<SheetTitleProps>
>(function SheetTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetTitleProps> & {
    ref?: React.ForwardedRef<HTMLHeadingElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('nx:m-0 nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
});

/**
 * Props for SheetDescription.
 */
type SheetDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

/**
 * Supporting text under the title.
 */
const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<SheetDescriptionProps>
>(function SheetDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SheetDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

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
