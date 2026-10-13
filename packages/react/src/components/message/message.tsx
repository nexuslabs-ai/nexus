import * as React from 'react';

import { cn } from '../../lib/utils';
import { Avatar } from '../avatar';

/**
 * Props for the MessageGroup component.
 */
interface MessageGroupProps extends React.ComponentProps<'div'> {
  /**
   * Announces new turns in a live chat. Leave it off for static, paged or
   * virtualised transcripts, and set `aria-busy` on a turn while its reply
   * streams.
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
 * Vertical stack of conversation turns. It adds no list role, so add list
 * roles if the stack is a list.
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
      className={cn(
        'nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the Message component.
 */
interface MessageProps extends React.ComponentProps<'div'> {
  /**
   * Side of the conversation the turn sits on, mirrored under `dir="rtl"`.
   * `MessageContent` aligns its children to match, so a `Bubble` needs no
   * `align`.
   *
   * @default 'start'
   */
  align?: 'start' | 'end';
}

/**
 * Layout for one conversation turn, with an avatar beside the header, body
 * and footer. Put the body, usually a `Bubble` or `Attachment`, in
 * `MessageContent`.
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
 * Props for the MessageAvatar component.
 */
interface MessageAvatarProps extends React.ComponentProps<typeof Avatar> {
  /**
   * Keeps the avatar's space but hides it. Use it on follow-up turns from the
   * same speaker so their bodies line up with the first turn.
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
 * Avatar of the speaker, pinned to the top of the turn. Takes the same
 * children and props as `Avatar`, and uses the `sm` size unless you set one.
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
 * Props for the MessageContent component.
 */
interface MessageContentProps extends React.ComponentProps<'div'> {}

/**
 * Column beside the avatar for the header, body and footer of the turn.
 * Aligns its children to the side set by `align` on `Message`.
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
  'nx:flex nx:max-w-full nx:items-center nx:gap-2 nx:px-4 nx:wrap-anywhere nx:typography-label-small nx:text-muted-foreground';

/**
 * Props for the MessageHeader component.
 */
interface MessageHeaderProps extends React.ComponentProps<'div'> {}

/**
 * Line above the turn for the speaker name, time or role.
 * Its text lines up with the text inside a `Bubble`.
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
 * Props for the MessageFooter component.
 */
interface MessageFooterProps extends React.ComponentProps<'div'> {}

/**
 * Line below the turn for delivery status, time or actions.
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
