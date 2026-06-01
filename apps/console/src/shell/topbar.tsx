import { Button, SidebarTrigger } from '@nexus/react';
import { IconMoon, IconSearch, IconSun } from '@tabler/icons-react';

import { useThemeContext } from '../app/theme-provider';

/**
 * App-shell top bar: sidebar toggle, a ⌘K search placeholder (the palette
 * lands in Phase 4), and a dark-mode quick-toggle wired to the root theme.
 */
export function Topbar() {
  const { theme, setTheme } = useThemeContext();

  return (
    <header className="nx:bg-background nx:border-border-default nx:flex nx:h-14 nx:items-center nx:gap-3 nx:border-b nx:px-4">
      <SidebarTrigger />

      <button
        type="button"
        disabled
        className="nx:border-border-default nx:bg-muted nx:text-muted-foreground nx:inline-flex nx:items-center nx:gap-2 nx:rounded-md nx:border nx:px-3 nx:py-1.5 nx:text-sm"
      >
        <IconSearch className="nx:size-4" />
        <span>Search…</span>
        <kbd className="nx:bg-background nx:ml-2 nx:rounded nx:px-1.5 nx:text-xs">
          ⌘K
        </kbd>
      </button>

      <div className="nx:flex-1" />

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
