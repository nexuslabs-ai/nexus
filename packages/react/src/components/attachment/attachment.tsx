import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import {
  Item,
  ItemActions,
  type ItemActionsProps,
  ItemContent,
  type ItemContentProps,
  ItemDescription,
  type ItemDescriptionProps,
  ItemMedia,
  type ItemMediaProps,
  type ItemProps,
  ItemTitle,
  type ItemTitleProps,
} from '../item/item';
import { Progress, type ProgressProps } from '../progress/progress';

/**
 * Upload lifecycle of one attachment, from empty drop target to done.
 */
type AttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done';

/**
 * Announced states only — a settled card (`idle` / `done`) stays silent, so it
 * has no entry here and the live region renders empty.
 */
const ATTACHMENT_STATUS_TEXT: Partial<Record<AttachmentState, string>> = {
  uploading: 'Uploading',
  processing: 'Processing',
  error: 'Upload failed',
};

const attachmentVariants = cva(
  [
    // isolate: AttachmentTrigger and AttachmentActions stack inside the card,
    // so the card must be their stacking context rather than the page.
    'nx:group/attachment nx:relative nx:isolate nx:min-w-0',
    'nx:data-[state=idle]:border-dashed',
    'nx:data-[state=error]:border-error-border',
  ],
  {
    variants: {
      size: {
        default: 'nx:gap-2.5 nx:p-2.5',
        sm: 'nx:gap-2 nx:p-2',
      },
      orientation: {
        horizontal: 'nx:flex-nowrap nx:items-center',
        vertical: 'nx:w-32 nx:flex-col nx:items-stretch',
      },
    },
    defaultVariants: {
      size: 'default',
      orientation: 'horizontal',
    },
  }
);

/**
 * AttachmentProps
 *
 * Props for the Attachment component.
 */
interface AttachmentProps
  extends
    Omit<ItemProps, 'asChild' | 'variant'>,
    VariantProps<typeof attachmentVariants> {
  /**
   * Upload state. Screen readers announce in-progress and error states, and `idle` or `error` change the border.
   * @default 'done'
   */
  state?: AttachmentState;

  /**
   * Replaces the built-in status text, such as 'Uploading'. Ignored while `idle` or `done`.
   * @example
   * ```tsx
   * <Attachment state="uploading" statusLabel="Uploading report.pdf" />
   * ```
   */
  statusLabel?: string;
}

/**
 * One file with its preview, name, size, actions and upload state.
 * `orientation="horizontal"` is a row for lists. `orientation="vertical"` is a fixed-width tile for composer strips.
 * Screen readers announce the state while uploading, processing or failed.
 *
 * @example
 * ```tsx
 * <Attachment state="uploading">
 *   <AttachmentMedia variant="icon">
 *     <IconFile />
 *   </AttachmentMedia>
 *   <AttachmentContent>
 *     <AttachmentTitle>report.pdf</AttachmentTitle>
 *     <AttachmentDescription>2.4 MB</AttachmentDescription>
 *     <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
 *   </AttachmentContent>
 *   <AttachmentActions>
 *     <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
 *       <IconX />
 *     </Button>
 *   </AttachmentActions>
 * </Attachment>
 * ```
 */
function Attachment({
  className,
  children,
  state = 'done',
  statusLabel,
  orientation = 'horizontal',
  size = 'default',
  ...props
}: AttachmentProps) {
  const statusText = ATTACHMENT_STATUS_TEXT[state];

  return (
    <Item
      data-slot="attachment"
      data-state={state}
      data-orientation={orientation}
      variant="outline"
      // Item sets data-variant from its own prop; Attachment pins the variant
      // and exposes none, so the hook would advertise an API that isn't there.
      data-variant={undefined}
      size={size}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    >
      {/*
        The region stays mounted and empty while settled: a live region
        inserted together with its text is not reliably announced.
      */}
      <span data-slot="attachment-status" role="status" className="nx:sr-only">
        {statusText ? (statusLabel ?? statusText) : ''}
      </span>
      {children}
    </Item>
  );
}

/**
 * AttachmentMediaProps
 *
 * Props for the AttachmentMedia component.
 */
interface AttachmentMediaProps extends ItemMediaProps {}

/**
 * Thumbnail or file-type icon. Fills a vertical tile as a square and takes the error color on `error`.
 */
function AttachmentMedia({ className, ...props }: AttachmentMediaProps) {
  return (
    <ItemMedia
      data-slot="attachment-media"
      className={cn(
        // translate-y-0 cancels ItemMedia's row nudge, which is meant for a
        // media atom beside a description, not a full-width thumbnail.
        'nx:group-data-[orientation=vertical]/attachment:size-auto nx:group-data-[orientation=vertical]/attachment:aspect-square nx:group-data-[orientation=vertical]/attachment:w-full nx:group-data-[orientation=vertical]/attachment:translate-y-0 nx:group-data-[orientation=vertical]/attachment:self-auto',
        'nx:group-data-[orientation=vertical]/attachment:[&_svg]:size-8',
        'nx:group-data-[state=error]/attachment:border-error-border nx:group-data-[state=error]/attachment:bg-error-subtle nx:group-data-[state=error]/attachment:text-error-subtle-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * AttachmentTitleProps
 *
 * Props for the AttachmentTitle component.
 */
interface AttachmentTitleProps extends ItemTitleProps {
  /**
   * Badge or status icon after the file name. Keeps its width while the name truncates.
   *
   * @example
   * ```tsx
   * <AttachmentTitle trailing={<IconCircleCheckFilled />}>
   *   report.pdf
   * </AttachmentTitle>
   * ```
   */
  trailing?: React.ReactNode;
}

/**
 * File name, truncated to one line.
 */
function AttachmentTitle({
  className,
  children,
  trailing,
  ...props
}: AttachmentTitleProps) {
  return (
    <ItemTitle
      data-slot="attachment-title"
      className={cn('nx:w-full nx:min-w-0', className)}
      {...props}
    >
      <span className="nx:min-w-0 nx:truncate">{children}</span>
      {trailing ? <span className="nx:shrink-0">{trailing}</span> : null}
    </ItemTitle>
  );
}

/**
 * AttachmentContentProps
 *
 * Props for the AttachmentContent component.
 */
interface AttachmentContentProps extends ItemContentProps {}

/**
 * Middle column for the title, description and progress.
 */
function AttachmentContent(props: AttachmentContentProps) {
  return <ItemContent data-slot="attachment-content" {...props} />;
}

/**
 * AttachmentDescriptionProps
 *
 * Props for the AttachmentDescription component.
 */
interface AttachmentDescriptionProps extends ItemDescriptionProps {}

/**
 * Line under the file name, such as size or an error reason. Takes the error color on `error`.
 */
function AttachmentDescription({
  className,
  ...props
}: AttachmentDescriptionProps) {
  return (
    <ItemDescription
      data-slot="attachment-description"
      className={cn(
        'nx:group-data-[state=error]/attachment:text-error-subtle-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * AttachmentActionsProps
 *
 * Props for the AttachmentActions component.
 */
interface AttachmentActionsProps extends ItemActionsProps {}

/**
 * Trailing controls, such as remove or retry. They stay clickable above `AttachmentTrigger`.
 */
function AttachmentActions({ className, ...props }: AttachmentActionsProps) {
  return (
    <ItemActions
      data-slot="attachment-actions"
      className={cn('nx:relative nx:z-20', className)}
      {...props}
    />
  );
}

type AttachmentGroupLabel =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

/**
 * AttachmentGroupProps
 *
 * Props for AttachmentGroup. The strip is a tab stop, so pass exactly one of `aria-label` or `aria-labelledby`.
 * Use `aria-labelledby` when a visible heading names the strip.
 *
 * @example
 * ```tsx
 * <AttachmentGroup aria-label="Attached files" />
 * <AttachmentGroup aria-labelledby="composer-files-heading" />
 * ```
 */
type AttachmentGroupProps = Omit<
  React.ComponentProps<'div'>,
  'aria-label' | 'aria-labelledby'
> &
  AttachmentGroupLabel;

/**
 * Horizontally scrolling strip of attachments. It is focusable for keyboard scrolling and needs `aria-label` or `aria-labelledby`.
 * For a real list, pass `role="list"` and give each child `role="listitem"`.
 */
function AttachmentGroup({ className, ...props }: AttachmentGroupProps) {
  return (
    <div
      data-slot="attachment-group"
      role="group"
      // A scrollable region with no focusable children must itself be
      // keyboard-focusable to scroll (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={cn(
        'nx:flex nx:min-w-0 nx:snap-x nx:gap-3 nx:overflow-x-auto nx:overscroll-x-contain nx:py-1',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:*:data-[slot=attachment]:flex-none nx:*:data-[slot=attachment]:snap-start',
        className
      )}
      {...props}
    />
  );
}

/**
 * AttachmentProgressProps
 *
 * Props for the AttachmentProgress component.
 */
interface AttachmentProgressProps extends ProgressProps {}

/**
 * Upload progress bar for `AttachmentContent`. Omit `value` while the total is unknown.
 * Give it an `aria-label` that names the file, so screen readers can tell uploads apart.
 */
function AttachmentProgress({
  className,
  'aria-label': ariaLabel = 'Upload progress',
  ...props
}: AttachmentProgressProps) {
  return (
    <Progress
      data-slot="attachment-progress"
      aria-label={ariaLabel}
      className={cn('nx:mt-1 nx:h-1', className)}
      {...props}
    />
  );
}

/**
 * AttachmentTriggerProps
 *
 * Props for the AttachmentTrigger component.
 */
interface AttachmentTriggerProps extends React.ComponentProps<'button'> {
  /**
   * Renders the child element instead, such as an `<a>` that opens the file.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Makes the whole card open or preview the file. Use it instead of a link around the card, so `AttachmentActions` stay clickable.
 * Give it a text label, visually hidden if the card shows the file name.
 *
 * @example
 * ```tsx
 * <AttachmentTrigger asChild>
 *   <a href={url}>
 *     <span className="nx:sr-only">Open report.pdf</span>
 *   </a>
 * </AttachmentTrigger>
 * ```
 */
function AttachmentTrigger({
  className,
  asChild = false,
  type,
  ...props
}: AttachmentTriggerProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="attachment-trigger"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(
        'nx:absolute nx:inset-0 nx:z-10 nx:cursor-pointer nx:rounded-[inherit] nx:border-0 nx:bg-transparent nx:p-0 nx:no-underline',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        className
      )}
      {...props}
    />
  );
}

export {
  Attachment,
  AttachmentActions,
  type AttachmentActionsProps,
  AttachmentContent,
  type AttachmentContentProps,
  AttachmentDescription,
  type AttachmentDescriptionProps,
  AttachmentGroup,
  type AttachmentGroupProps,
  AttachmentMedia,
  type AttachmentMediaProps,
  AttachmentProgress,
  type AttachmentProgressProps,
  type AttachmentProps,
  type AttachmentState,
  AttachmentTitle,
  type AttachmentTitleProps,
  AttachmentTrigger,
  type AttachmentTriggerProps,
  attachmentVariants,
};
