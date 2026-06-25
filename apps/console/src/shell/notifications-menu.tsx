import { useState } from 'react';

import {
  Badge,
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Skeleton,
} from '@nexus/react';
import {
  IconAt,
  IconBell,
  IconChecks,
  IconCreditCard,
  IconInfoCircle,
  IconMessageCircle,
  IconUserCheck,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { formatDateTime } from '../lib/format';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
  notificationKeys,
  type NotificationKind,
} from '../lib/notifications-api';

type NotificationsData = { notifications: Notification[] };

/** One leading icon per kind — single-sourced so the row never inlines a switch. */
const KIND_ICON: Record<NotificationKind, typeof IconBell> = {
  mention: IconAt,
  assignment: IconUserCheck,
  comment: IconMessageCircle,
  system: IconInfoCircle,
  billing: IconCreditCard,
};

/**
 * The topbar notifications bell + panel: a Popover (self-managing its open
 * state, mirroring the CRM saved-views menu) over the app-activity feed. The
 * bell carries an unread-count badge; tapping a notification — or "Mark all
 * read" — marks it read. Clicking does not navigate: the ⌘K palette owns
 * cross-module jumps, and this feed is distinct from the Inbox module's
 * per-conversation unread.
 */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: notificationKeys.list,
    queryFn: fetchNotifications,
  });
  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Optimistically flip `read` so the dot + bell count clear on tap, not after
  // the PATCH-then-refetch round trip (~800ms); roll back on error, reconcile on
  // settle. (The CRM kanban's optimistic-mutation shape.)
  const markReadInCache = (matches: (n: Notification) => boolean) =>
    queryClient.setQueryData<NotificationsData>(notificationKeys.list, (old) =>
      old
        ? {
            notifications: old.notifications.map((n) =>
              matches(n) ? { ...n, read: true } : n
            ),
          }
        : old
    );

  const snapshot = async () => {
    await queryClient.cancelQueries({ queryKey: notificationKeys.list });
    return queryClient.getQueryData<NotificationsData>(notificationKeys.list);
  };
  const rollback = (ctx?: { prev?: NotificationsData }) => {
    if (ctx?.prev) queryClient.setQueryData(notificationKeys.list, ctx.prev);
  };
  const reconcile = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      const prev = await snapshot();
      markReadInCache((n) => n.id === id);
      return { prev };
    },
    onError: (_e, _id, ctx) => rollback(ctx),
    onSettled: reconcile,
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      const prev = await snapshot();
      markReadInCache(() => true);
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx),
    onSettled: reconcile,
  });

  // mark-read is idempotent, so the `n.read` guard + the optimistic write are
  // enough — we don't gate on `markOne.isPending`, which would silently drop a
  // tap on a second row while the first row's PATCH is still in flight.
  const handleMarkRead = (n: Notification) => {
    if (n.read) return;
    markOne.mutate(n.id);
  };

  const handleMarkAll = () => {
    if (unreadCount === 0 || markAll.isPending) return;
    markAll.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="nx:relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <IconBell />
          {unreadCount > 0 && (
            <Badge
              isNumber
              variant="error"
              aria-hidden
              className="nx:absolute nx:-right-1 nx:-top-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="nx:w-80 nx:p-0">
        <div className="nx:flex nx:items-center nx:justify-between nx:py-2 nx:pl-3 nx:pr-2">
          <p className="nx:typography-label-small nx:text-muted-foreground">
            Notifications
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || markAll.isPending}
          >
            <IconChecks className="nx:size-4" />
            Mark all read
          </Button>
        </div>
        <Separator />

        {isPending && <NotificationsSkeleton />}
        {/* Only on a cold-load failure — `data` is retained on a background
            refetch error (each mark-read invalidates), so gating on `!data`
            keeps the stale list instead of stacking an error above it. */}
        {isError && !data && <NotificationsError />}
        {data && (
          <ul className="nx:max-h-96 nx:overflow-y-auto nx:p-1">
            {data.notifications.map((n) => {
              const KindIcon = KIND_ICON[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n)}
                    className="nx:hover:bg-background-hover nx:flex nx:w-full nx:items-start nx:gap-3 nx:rounded-md nx:px-3 nx:py-2 nx:text-left nx:transition-colors"
                  >
                    <KindIcon className="nx:text-muted-foreground nx:mt-0.5 nx:size-4 nx:shrink-0" />
                    <span className="nx:min-w-0 nx:flex-1">
                      <span
                        className={cn(
                          'nx:block nx:typography-label-default',
                          !n.read && 'nx:font-medium'
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="nx:text-muted-foreground nx:block nx:truncate nx:typography-label-default">
                        {n.body}
                      </span>
                      <span className="nx:text-muted-foreground nx:mt-0.5 nx:block nx:typography-label-small">
                        {formatDateTime(n.at)}
                      </span>
                    </span>
                    {!n.read && (
                      <span
                        aria-hidden
                        className="nx:bg-primary-background nx:mt-1.5 nx:size-2 nx:shrink-0 nx:rounded-full"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="nx:space-y-3 nx:p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="nx:flex nx:items-start nx:gap-3">
          <Skeleton className="nx:size-4 nx:shrink-0 nx:rounded-full" />
          <div className="nx:flex-1 nx:space-y-1">
            <Skeleton className="nx:h-3 nx:w-3/4" />
            <Skeleton className="nx:h-3 nx:w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsError() {
  return (
    <p className="nx:text-error-foreground nx:px-3 nx:py-6 nx:text-center nx:typography-body-default">
      Couldn’t load notifications. Please try again.
    </p>
  );
}
