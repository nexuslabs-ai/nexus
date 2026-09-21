import { NexusThemeQuickControl, SidebarTrigger } from '@nexus_ds/react';
import { useNavigate } from '@tanstack/react-router';

export function Topbar() {
  const navigate = useNavigate();
  return (
    <header className="nx:bg-background nx:flex nx:items-center nx:gap-3 nx:px-6 nx:py-3">
      <SidebarTrigger />
      <span className="nx:typography-label-small nx:text-muted-foreground">
        Nexus Console
      </span>
      <div className="nx:flex-1" />
      <NexusThemeQuickControl
        onCustomize={() => navigate({ to: '/settings/appearance' })}
      />
    </header>
  );
}
