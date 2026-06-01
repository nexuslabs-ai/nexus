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
} from '@nexus/react';
import {
  IconComponents,
  IconLayoutGrid,
  IconPalette,
  IconUserCircle,
} from '@tabler/icons-react';
import { Link, useMatchRoute } from '@tanstack/react-router';

import { MODULE_ITEMS } from './modules';

const DESIGN_ITEMS = [
  { label: 'Reference', to: '/design/reference', icon: IconComponents },
  { label: 'Scenes', to: '/design/scenes', icon: IconLayoutGrid },
  { label: 'Appearance', to: '/design/appearance', icon: IconPalette },
] as const;

/**
 * The Atlas app-shell sidebar: the wired Design System module plus the full
 * module IA, where unbuilt modules all route to the shared `/m/$module`
 * placeholder.
 */
export function AppSidebar() {
  const matchRoute = useMatchRoute();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/design/reference">
                <div className="nx:flex nx:size-8 nx:items-center nx:justify-center nx:rounded-lg nx:bg-primary-background">
                  <span className="nx:text-sm nx:font-bold nx:text-primary-foreground">
                    A
                  </span>
                </div>
                <span className="nx:font-semibold">Atlas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Design System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DESIGN_ITEMS.map(({ label, to, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={!!matchRoute({ to })}
                    tooltip={label}
                  >
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULE_ITEMS.map(({ label, module, icon: Icon }) => (
                <SidebarMenuItem key={module}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!matchRoute({ to: '/m/$module', params: { module } })
                    }
                    tooltip={label}
                  >
                    <Link to="/m/$module" params={{ module }}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Account">
              <IconUserCircle />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
