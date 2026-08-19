import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import {
  Item,
  ItemActions,
  ItemMedia,
  type ItemMediaProps,
  type ItemProps,
  ItemTitle,
} from '../item';
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

/** States whose progress is worth announcing; settled cards stay silent. */
const ANNOUNCED_STATES: ReadonlySet<AttachmentState> = new Set([
  'uploading',
  'processing',
  'error',
]);

const attachmentVariants = cva(
  [
    // isolate: AttachmentTrigger and AttachmentActions stack inside the card,
    // so the card must be their stacking context rather than the page.
    'nx:group/attachment nx:relative nx:isolate nx:min-w-0',
    'nx:data-[state=idle]:border-dashed',
    'nx:data-[state=error]:border-border-error',
    'nx:data-[state=error]:[&_[data-slot=item-description]]:text-error-subtle-foreground',
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
   * The attachment's lifecycle state. Drives the border treatment (dashed while
   * `idle`, error-coloured while `error`) and the text announced to assistive
   * tech.
   * @default 'done'
   */
  state?: AttachmentState;

  /**
   * Overrides the assistive-tech status text for the current `state` — pass a
   * localised string, or one that names the file. Ignored while the attachment
   * is settled (`idle` / `done`), which announces nothing.
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
 * actions — with an upload lifecycle on top. Built on `Item`, and composed with
 * `AttachmentMedia`, `ItemContent`, `AttachmentTitle`, `ItemDescription`, and
 * `AttachmentActions`.
 *
 * The card is pinned to `Item`'s `outline` variant: the `idle` dashed border and
 * the `error` border are the state signal, and both need a visible border to
 * paint on.
 *
 * `orientation="horizontal"` is a row for lists and upload queues;
 * `orientation="vertical"` is a fixed-width tile for composer strips, where the
 * media fills the card width. Group several with `AttachmentGroup`.
 *
 * While uploading, processing, or failed, the current `state` is announced
 * through a visually hidden `role="status"` region, so progress is never
 * conveyed by animation alone.
 *
 * @example
 * ```tsx
 * <Attachment state="uploading">
 *   <AttachmentMedia variant="icon">
 *     <IconFile />
 *   </AttachmentMedia>
 *   <ItemContent>
 *     <AttachmentTitle>report.pdf</AttachmentTitle>
 *     <ItemDescription>2.4 MB</ItemDescription>
 *     <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
 *   </ItemContent>
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
  return (
    <Item
      data-slot="attachment"
      data-state={state}
      data-orientation={orientation}
      variant="outline"
      size={size}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    >
      {ANNOUNCED_STATES.has(state) && (
        <span
          data-slot="attachment-status"
          role="status"
          className="nx:sr-only"
        >
          {statusLabel ?? ATTACHMENT_STATUS_TEXT[state]}
        </span>
      )}
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
 * AttachmentMedia
 *
 * The attachment's thumbnail or file-type icon. Adds the Attachment-specific
 * behaviour on top of `ItemMedia`: in a vertical tile it fills the card width
 * as a square, and it picks up the error tint when the card has failed.
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
        'nx:group-data-[state=error]/attachment:border-border-error nx:group-data-[state=error]/attachment:bg-error-subtle nx:group-data-[state=error]/attachment:text-error-subtle-foreground',
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
interface AttachmentTitleProps extends React.ComponentProps<typeof ItemTitle> {
  /**
   * A badge or status icon pinned after the file name. It keeps `ItemTitle`'s
   * `gap-2` spacing and its own width while the name truncates beside it.
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
 * AttachmentTitle
 *
 * The file name. Truncates to one line — file names are long and the card is
 * narrow — while `trailing` content keeps its full width beside it.
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
      {trailing}
    </ItemTitle>
  );
}

/**
 * AttachmentActionsProps
 *
 * Props for the AttachmentActions component.
 */
type AttachmentActionsProps = React.ComponentProps<typeof ItemActions>;

/**
 * AttachmentActions
 *
 * The trailing controls of an attachment — typically a remove or retry button.
 * Lifts itself above `AttachmentTrigger`'s full-card overlay so its buttons stay
 * independently clickable.
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

/**
 * AttachmentGroupProps
 *
 * Props for the AttachmentGroup component.
 */
interface AttachmentGroupProps extends Omit<
  React.ComponentProps<'div'>,
  'aria-label'
> {
  /**
   * Names the strip for assistive tech. Required: the strip is a tab stop, and
   * a focusable region with no accessible name announces nothing.
   *
   * @example
   * ```tsx
   * <AttachmentGroup aria-label="Attached files" />
   * ```
   */
  'aria-label': string;
}

/**
 * AttachmentGroup
 *
 * A horizontally scrolling strip of attachments, snapping each card to the
 * start edge. Like `ItemGroup`, it imposes no `list` role — add
 * `role="list"` plus `role="listitem"` on the children when the grouping is
 * genuinely a list rather than a composer strip.
 *
 * The strip is itself keyboard-focusable so it can be scrolled by keyboard, and
 * it takes a required `aria-label`.
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
 * the card itself as a link, so that buttons inside `AttachmentActions` stay
 * valid and independently clickable. Needs a text label, visually hidden if the
 * card already shows the file name.
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
  AttachmentActions,
  type AttachmentActionsProps,
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
