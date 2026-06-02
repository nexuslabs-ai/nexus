import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  IconLogout,
  IconPalette,
  IconUserCircle,
} from '@tabler/icons-react';
import { Link, useMatchRoute, useNavigate } from '@tanstack/react-router';

import { useSession } from '../app/session';

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
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);

  const handleSignOut = () => {
    signOut();
    navigate({ to: '/login' });
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Account">
                  <IconUserCircle />
                  <span>{user?.name ?? 'Account'}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="nx:w-56">
                {user && (
                  <>
                    <DropdownMenuLabel className="nx:flex nx:flex-col">
                      <span>{user.name}</span>
                      <span className="nx:text-muted-foreground nx:text-xs nx:font-normal">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onSelect={handleSignOut}>
                  <IconLogout />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
