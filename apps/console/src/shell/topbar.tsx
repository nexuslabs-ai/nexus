import { Button, Kbd, KbdGroup, SidebarTrigger } from '@nexus/react';
import { IconMoon, IconSearch, IconSun } from '@tabler/icons-react';

import { useThemeContext } from '../app/theme-provider';

import { NotificationsMenu } from './notifications-menu';
import { ThemeQuickControl } from './theme-quick-control';

interface TopbarProps {
  /** Opens the ⌘K command palette — fired by the search button. */
  onSearchClick: () => void;
}

/**
 * App-shell top bar: sidebar toggle, the ⌘K search button that opens the
 * command palette, the notifications bell, and a dark-mode quick-toggle wired
 * to the root theme.
 */
export function Topbar({ onSearchClick }: TopbarProps) {
  const { theme, setTheme } = useThemeContext();

  return (
    <header className="nx:bg-background nx:border-border-default nx:flex nx:h-14 nx:items-center nx:gap-3 nx:border-b nx:px-4">
      <SidebarTrigger />

      <button
        type="button"
        onClick={onSearchClick}
        className="nx:border-border-default nx:bg-background nx:text-muted-foreground nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:inline-flex nx:items-center nx:gap-2 nx:rounded-md nx:border nx:px-3 nx:py-1.5 nx:text-sm nx:transition-colors nx:focus-visible:outline-2"
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

      <ThemeQuickControl />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme((t) => ({ ...t, dark: !t.dark }))}
        aria-label={
          theme.dark ? 'Switch to light theme' : 'Switch to dark theme'
        }
      >
        {theme.dark ? <IconSun /> : <IconMoon />}
      </Button>
    </header>
  );
}
