import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@nexus_ds/react';
import {
  IconBrandGithub,
  IconComponents,
  IconPalette,
} from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';

const CONSOLE_LINKS = [
  { to: '/explore', label: 'Token Explorer', icon: IconComponents },
  { to: '/preview', label: 'Preview', icon: IconPalette },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { isNarrow, setOpenNarrow } = useSidebar();
  const closeOnNavigate = () => {
    if (isNarrow) setOpenNarrow(false);
  };

  return (
    <Sidebar collapsible="offcanvas" aria-label="Console navigation">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link
                to="/explore"
                onClick={closeOnNavigate}
                className="nx:typography-heading-xsmall"
              >
                Nexus Console
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONSOLE_LINKS.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={to}
                        onClick={closeOnNavigate}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/settings/appearance'}
            >
              <Link
                to="/settings/appearance"
                onClick={closeOnNavigate}
                aria-current={
                  pathname === '/settings/appearance' ? 'page' : undefined
                }
              >
                <IconPalette aria-hidden="true" />
                <span>Console appearance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://github.com/nexuslabs-ai/nexus"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandGithub aria-hidden="true" />
                <span>Source</span>
                <span className="nx:sr-only"> (opens in a new tab)</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
