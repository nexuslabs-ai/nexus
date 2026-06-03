import { useEffect, useState } from 'react';

import { SidebarInset, SidebarProvider } from '@nexus/react';
import { Outlet } from '@tanstack/react-router';

import { AppSidebar } from '../shell/app-sidebar';
import { CommandPalette } from '../shell/command-palette';
import { Topbar } from '../shell/topbar';

/**
 * The authenticated app shell, rendered by the `_app` pathless layout route
 * (which guards it behind a session): collapsible sidebar + top bar with the
 * active module's content in the inset. Mounted once, so the sidebar and top
 * bar persist across navigations.
 */
export function RootLayout() {
  const [commandOpen, setCommandOpen] = useState(false);

  // ⌘K / Ctrl+K toggles the command palette from anywhere — a global keyboard
  // subscription, which is exactly what an effect is for.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar onSearchClick={() => setCommandOpen(true)} />
        {/* nx:text-foreground re-establishes the adaptive base text color for
            module content — without it, reused content that relies on inherited
            foreground (e.g. the typography showcase) renders black in dark mode. */}
        <main className="nx:text-foreground nx:min-w-0 nx:flex-1">
          <Outlet />
        </main>
      </SidebarInset>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
