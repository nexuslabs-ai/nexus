import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Item, type ItemProps } from '../item';
import { Progress, type ProgressProps } from '../progress';

/**
 * AttachmentState
 *
 * The lifecycle of a single attachment, from an empty drop target through
 * upload and post-upload work to its resting state.
 */
type AttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done';

const ATTACHMENT_STATUS_TEXT: Record<AttachmentState, string> = {
  idle: '',
  uploading: 'Uploading',
  processing: 'Processing',
  error: 'Upload failed',
  done: 'Attached',
};

const attachmentVariants = cva(
  [
    'nx:group/attachment nx:relative nx:min-w-0',
    // Lift the trailing controls above AttachmentTrigger's full-card overlay.
    'nx:[&_[data-slot=item-actions]]:relative nx:[&_[data-slot=item-actions]]:z-20',
    // Item's title is w-fit, so it needs a full-width block to truncate.
    'nx:[&_[data-slot=item-title]]:block nx:[&_[data-slot=item-title]]:w-full nx:[&_[data-slot=item-title]]:truncate',
    'nx:data-[state=idle]:border-dashed',
    'nx:data-[state=error]:border-border-error',
    'nx:data-[state=error]:[&_[data-slot=item-description]]:text-error-subtle-foreground',
    'nx:data-[state=error]:[&_[data-slot=item-media]]:border-border-error nx:data-[state=error]:[&_[data-slot=item-media]]:bg-error-subtle nx:data-[state=error]:[&_[data-slot=item-media]]:text-error-subtle-foreground',
  ],
  {
    variants: {
      size: {
        default: 'nx:gap-2.5 nx:p-2.5',
        sm: 'nx:gap-2 nx:p-2',
      },
      orientation: {
        horizontal: 'nx:flex-nowrap nx:items-center',
        vertical: [
          'nx:w-32 nx:flex-col nx:items-stretch',
          'nx:[&_[data-slot=item-media]]:size-auto nx:[&_[data-slot=item-media]]:aspect-square nx:[&_[data-slot=item-media]]:w-full nx:[&_[data-slot=item-media]]:self-auto',
          'nx:[&_[data-slot=item-media]_svg]:size-8',
        ],
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
  extends Omit<ItemProps, 'asChild'>, VariantProps<typeof attachmentVariants> {
  /**
   * The attachment's lifecycle state. Drives the border treatment (dashed while
   * `idle`, error-coloured while `error`) and the text announced to assistive
   * tech.
   * @default 'done'
   */
  state?: AttachmentState;

  /**
   * Overrides the assistive-tech status text for the current `state` — pass a
   * localised string, or one that names the file.
   * @default a built-in phrase per state, e.g. 'Uploading'
   * @example
   * ```tsx
   * <Attachment state="uploading" statusLabel="Uploading report.pdf" />
   * ```
   */
  statusLabel?: string;
}

/**
 * Attachment
 *
 * A single file's preview — thumbnail or icon, name, size, and trailing
 * actions — with an upload lifecycle on top. Built on `Item`, so it composes
 * with `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, and
 * `ItemActions` rather than introducing a second set of row parts.
 *
 * `orientation="horizontal"` is a row for lists and upload queues;
 * `orientation="vertical"` is a fixed-width tile for composer strips, where the
 * media fills the card width. Group several with `AttachmentGroup`.
 *
 * The current `state` is announced through a visually hidden `role="status"`
 * region, so progress is never conveyed by animation alone.
 *
 * @example
 * ```tsx
 * <Attachment state="uploading">
 *   <ItemMedia variant="icon">
 *     <IconFile />
 *   </ItemMedia>
 *   <ItemContent>
 *     <ItemTitle>report.pdf</ItemTitle>
 *     <ItemDescription>2.4 MB</ItemDescription>
 *     <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
 *   </ItemContent>
 *   <ItemActions>
 *     <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
 *       <IconX />
 *     </Button>
 *   </ItemActions>
 * </Attachment>
 * ```
 */
function Attachment({
  className,
  children,
  state = 'done',
  statusLabel,
  orientation = 'horizontal',
  variant = 'outline',
  size = 'default',
  ...props
}: AttachmentProps) {
  return (
    <Item
      data-slot="attachment"
      data-state={state}
      data-orientation={orientation}
      variant={variant}
      size={size}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    >
      <span data-slot="attachment-status" role="status" className="nx:sr-only">
        {statusLabel ?? ATTACHMENT_STATUS_TEXT[state]}
      </span>
      {children}
    </Item>
  );
}

/**
 * AttachmentGroupProps
 *
 * Props for the AttachmentGroup component.
 */
type AttachmentGroupProps = React.ComponentProps<'div'>;

/**
 * AttachmentGroup
 *
 * A horizontally scrolling strip of attachments, snapping each card to the
 * start edge. Like `ItemGroup`, it imposes no `list` role — add
 * `role="list"` plus `role="listitem"` on the children when the grouping is
 * genuinely a list rather than a composer strip.
 */
function AttachmentGroup({ className, ...props }: AttachmentGroupProps) {
  return (
    <div
      data-slot="attachment-group"
      // A scrollable region with no focusable children must itself be
      // keyboard-focusable to scroll (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={cn(
        'nx:flex nx:min-w-0 nx:snap-x nx:gap-3 nx:overflow-x-auto nx:overscroll-x-contain nx:py-1',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:[outline-offset:-2px]',
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
type AttachmentProgressProps = ProgressProps;

/**
 * AttachmentProgress
 *
 * The upload progress bar for an in-flight attachment, sized to sit inside
 * `ItemContent` beneath the description. Pass `value` for a determinate upload
 * and omit it while the total is unknown. Give it an `aria-label` that names
 * the file — several attachments uploading at once are otherwise
 * indistinguishable to a screen reader.
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
   * Render as the child element via Radix Slot — e.g. an `<a>` opening the
   * file — keeping the full-card hit area.
   * @default false
   */
  asChild?: boolean;
}

/**
 * AttachmentTrigger
 *
 * Makes the whole card activate one action — opening or previewing the file —
 * by stretching an invisible control across it. Use this instead of rendering
 * the card itself as a link, so that buttons inside `ItemActions` stay valid
 * and independently clickable. Needs a text label, visually hidden if the card
 * already shows the file name.
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
        'nx:absolute nx:inset-0 nx:z-10 nx:cursor-pointer nx:rounded-[inherit] nx:outline-none',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        className
      )}
      {...props}
    />
  );
}

export {
  Attachment,
  AttachmentGroup,
  type AttachmentGroupProps,
  AttachmentProgress,
  type AttachmentProgressProps,
  type AttachmentProps,
  type AttachmentState,
  AttachmentTrigger,
  type AttachmentTriggerProps,
  attachmentVariants,
};
