import { Kbd, KbdGroup, SidebarTrigger } from '@nexus/react';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import { NexusThemeQuickControl } from '../modules/design-system/appearance';

import { NotificationsMenu } from './notifications-menu';

interface TopbarProps {
  /** Opens the ⌘K command palette — fired by the search button. */
  onSearchClick: () => void;
}

/**
 * App-shell top bar: sidebar toggle, the ⌘K search button that opens the
 * command palette, the notifications bell, and the package-owned appearance
 * quick-control wired to the shared root appearance provider.
 */
export function Topbar({ onSearchClick }: TopbarProps) {
  const navigate = useNavigate();

  return (
    <header className="nx:bg-background nx:border-border-default nx:flex nx:h-14 nx:items-center nx:gap-3 nx:border-b nx:px-4">
      <SidebarTrigger />

      <button
        type="button"
        onClick={onSearchClick}
        className="nx:border-border-default nx:bg-background nx:text-muted-foreground nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:inline-flex nx:items-center nx:gap-2 nx:rounded-md nx:border nx:px-3 nx:py-1.5 nx:typography-label-default nx:transition-colors nx:focus-visible:outline-2"
      >
        <IconSearch className="nx:size-4" />
        <span>Search…</span>
        <KbdGroup className="nx:ml-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <div className="nx:flex-1" />

      <NotificationsMenu />

      <NexusThemeQuickControl
        onCustomize={() => navigate({ to: '/design/appearance' })}
      />
    </header>
  );
}
