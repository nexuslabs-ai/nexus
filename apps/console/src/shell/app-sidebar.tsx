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
  SidebarSeparator,
} from '@nexus/react';
import {
  IconComponents,
  IconLayoutGrid,
  IconLogout,
  IconPalette,
  IconRoute,
  IconUserCircle,
} from '@tabler/icons-react';
import {
  Link,
  useMatchRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';

import { useSession } from '../app/session';
import { useSidebarStore } from '../app/sidebar-store';

import { MODULE_ITEMS } from './modules';

const DESIGN_ITEMS = [
  { label: 'Reference', to: '/design/reference', icon: IconComponents },
  { label: 'Scenes', to: '/design/scenes', icon: IconLayoutGrid },
  { label: 'Appearance', to: '/design/appearance', icon: IconPalette },
  { label: 'Flows', to: '/design/flows', icon: IconRoute },
] as const;

/**
 * The Atlas app-shell sidebar: the wired Design System module plus the full
 * module IA. Built modules resolve to their own route (e.g. CRM → `/m/crm`);
 * the rest fall through to the shared `/m/$module` "coming soon" placeholder.
 */
export function AppSidebar() {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  // Workspace items highlight by pathname so it works whether a module resolves
  // to its own static route (e.g. /m/crm) or the dynamic /m/$module placeholder.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const sidebarMode = useSidebarStore((s) => s.mode);
  const showSectionLabels = sidebarMode === 'offcanvas';

  const handleSignOut = () => {
    signOut();
    navigate({ to: '/login' });
  };

  return (
    <Sidebar collapsible={sidebarMode}>
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
        <SidebarGroup
          role={showSectionLabels ? undefined : 'group'}
          aria-label={showSectionLabels ? undefined : 'Design System'}
        >
          {showSectionLabels && (
            <SidebarGroupLabel>Design System</SidebarGroupLabel>
          )}
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

        {!showSectionLabels && <SidebarSeparator />}

        <SidebarGroup
          role={showSectionLabels ? undefined : 'group'}
          aria-label={showSectionLabels ? undefined : 'Workspace'}
        >
          {showSectionLabels && (
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === `/m/${item.module}` ||
                  pathname.startsWith(`/m/${item.module}/`);
                return (
                  <SidebarMenuItem key={item.module}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      {/* Built modules link to their real static route; the rest
                          fall through to the dynamic /m/$module placeholder. */}
                      {'route' in item ? (
                        <Link to={item.route}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <Link to="/m/$module" params={{ module: item.module }}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      )}
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
