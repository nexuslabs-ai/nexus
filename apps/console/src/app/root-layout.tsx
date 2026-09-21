import { Button, SidebarInset, SidebarProvider } from '@nexus_ds/react';
import { Outlet } from '@tanstack/react-router';

import { AppSidebar } from '../shell/app-sidebar';
import { Topbar } from '../shell/topbar';

export function RootLayout() {
  return (
    <SidebarProvider>
      <Button
        asChild
        variant="outline"
        className="nx:sr-only nx:focus:not-sr-only nx:focus:fixed nx:focus:left-4 nx:focus:top-4 nx:focus:z-max"
      >
        <a href="#console-content">Skip to content</a>
      </Button>
      <AppSidebar />
      <SidebarInset className="nx:min-w-0">
        <Topbar />
        <div
          id="console-content"
          tabIndex={-1}
          className="nx:typography-body-default nx:text-foreground nx:min-w-0 nx:flex-1 nx:p-6 nx:lg:p-12"
        >
          <div className="nx:mx-auto nx:w-full nx:max-w-6xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
