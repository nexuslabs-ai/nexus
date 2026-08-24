import * as React from 'react';

import { cn } from '../../lib/utils';
import { Avatar } from '../avatar';

/**
 * MessageGroupProps
 *
 * Props for the MessageGroup component.
 */
interface MessageGroupProps extends React.ComponentProps<'div'> {
  /**
   * Announce turns as they arrive, for a live assistant or chat stream. Leave
   * it off for a static transcript, and for one that pages or virtualises.
   *
   * @default false
   * @example
   * ```tsx
   * <MessageGroup announce>{turns}</MessageGroup>
   * ```
   */
  announce?: boolean;
}

/**
 * MessageGroup
 *
 * A vertical stack of conversational turns. No ARIA `list` role is imposed —
 * `Message` is also used standalone, so list semantics are the consumer's to
 * add when the stack is genuinely one.
 */
function MessageGroup({
  className,
  announce = false,
  ...props
}: MessageGroupProps) {
  return (
    <div
      data-slot="message-group"
      role={announce ? 'log' : undefined}
      aria-relevant={announce ? 'additions' : undefined}
      className={cn(
        'nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * MessageProps
 *
 * Props for the Message component.
 */
interface MessageProps extends React.ComponentProps<'div'> {
  /**
   * Which side of the conversation the turn belongs to, and the only place it
   * is declared — `MessageContent` aligns its own children to match, so a
   * nested `Bubble` needs no `align` of its own.
   *
   * Logical, not physical: `end` reverses the row along the inline axis, so
   * the avatar rail moves to the left under `dir="rtl"` and to the right under
   * `dir="ltr"`.
   *
   * @default 'start'
   */
  align?: 'start' | 'end';
}

/**
 * Message
 *
 * The layout scaffold for one conversational turn — an avatar rail beside a
 * content column carrying header, body, and footer. Presentational only: it
 * holds no chat state, no speaker identity, and no scroll behaviour. The turn's
 * body is whatever is composed inside `MessageContent`, typically `Bubble` or
 * `Attachment`.
 *
 * The row itself carries no role; `MessageGroup`'s `announce` decides whether
 * the conversation is announced.
 *
 * @example
 * ```tsx
 * <MessageGroup>
 *   <Message>
 *     <MessageAvatar>
 *       <AvatarFallback>AB</AvatarFallback>
 *     </MessageAvatar>
 *     <MessageContent>
 *       <MessageHeader>Ana Bianchi</MessageHeader>
 *       <Bubble>
 *         <BubbleContent>Can you take a look at the failing run?</BubbleContent>
 *       </Bubble>
 *       <MessageFooter>09:14</MessageFooter>
 *     </MessageContent>
 *   </Message>
 * </MessageGroup>
 * ```
 */
function Message({ className, align = 'start', ...props }: MessageProps) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        'nx:group/message nx:flex nx:w-full nx:min-w-0 nx:gap-3 nx:data-[align=end]:flex-row-reverse',
        className
      )}
      {...props}
    />
  );
}

/**
 * MessageAvatarProps
 *
 * Props for the MessageAvatar component.
 */
interface MessageAvatarProps extends React.ComponentProps<typeof Avatar> {
  /**
   * Reserve the rail's width without painting anything. Use it on the
   * continuation turns of a consecutive run so their bodies stay aligned with
   * the first turn's, which shows the real avatar.
   *
   * @default false
   * @example
   * ```tsx
   * <MessageAvatar placeholder />
   * ```
   */
  placeholder?: boolean;
}

/**
 * MessageAvatar
 *
 * The turn's speaker portrait. Renders `Avatar`, so it takes `AvatarImage` and
 * `AvatarFallback` children and the full size and shape scale; it pins the
 * avatar to the top of the content column and defaults to the denser `sm` size.
 *
 * @example
 * ```tsx
 * <MessageAvatar>
 *   <AvatarImage src={user.avatarUrl} alt="" />
 *   <AvatarFallback>AB</AvatarFallback>
 * </MessageAvatar>
 * ```
 */
function MessageAvatar({
  className,
  size = 'sm',
  placeholder = false,
  ...props
}: MessageAvatarProps) {
  return (
    <Avatar
      data-slot="message-avatar"
      data-placeholder={placeholder || undefined}
      size={size}
      className={cn('nx:self-start', placeholder && 'nx:invisible', className)}
      {...props}
    />
  );
}

/**
 * MessageContentProps
 *
 * Props for the MessageContent component.
 */
interface MessageContentProps extends React.ComponentProps<'div'> {}

/**
 * MessageContent
 *
 * The column beside the avatar holding the turn's header, body, and footer.
 *
 * Under `align="end"` it aligns its own direct children to the inline end, so
 * the turn's side is set once on `Message` rather than repeated on the body.
 */
function MessageContent({ className, ...props }: MessageContentProps) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        'nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-1.5 nx:wrap-break-word nx:group-data-[align=end]/message:items-end',
        className
      )}
      {...props}
    />
  );
}

const messageMetaClassName =
  'nx:flex nx:min-w-0 nx:max-w-full nx:items-center nx:gap-2 nx:px-4 nx:typography-label-small nx:text-muted-foreground';

/**
 * MessageHeaderProps
 *
 * Props for the MessageHeader component.
 */
interface MessageHeaderProps extends React.ComponentProps<'div'> {}

/**
 * MessageHeader
 *
 * The metadata line above the turn — speaker name, timestamp, or role label.
 * Its inline padding matches `Bubble`'s, so the text sits flush with the body.
 */
function MessageHeader({ className, ...props }: MessageHeaderProps) {
  return (
    <div
      data-slot="message-header"
      className={cn(messageMetaClassName, className)}
      {...props}
    />
  );
}

/**
 * MessageFooterProps
 *
 * Props for the MessageFooter component.
 */
interface MessageFooterProps extends React.ComponentProps<'div'> {}

/**
 * MessageFooter
 *
 * The metadata line below the turn — delivery state, timestamp, or actions.
 */
function MessageFooter({ className, ...props }: MessageFooterProps) {
  return (
    <div
      data-slot="message-footer"
      className={cn(messageMetaClassName, className)}
      {...props}
    />
  );
}

export {
  Message,
  MessageAvatar,
  type MessageAvatarProps,
  MessageContent,
  type MessageContentProps,
  MessageFooter,
  type MessageFooterProps,
  MessageGroup,
  type MessageGroupProps,
  MessageHeader,
  type MessageHeaderProps,
  type MessageProps,
};
