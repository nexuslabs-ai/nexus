import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Separator } from '@/components/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/sheet';
import { Skeleton } from '@/components/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip';
import { useIsNarrow } from '@/hooks/use-narrow';
import { IconLayoutSidebar } from '@/lib/icons';
import { cn } from '@/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/** Whether the event target is a text-entry element (input, textarea, or contenteditable). */
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}

/**
 * SidebarContextProps
 *
 * Shape of the context shared by `SidebarProvider` with every sidebar part.
 */
interface SidebarContextProps {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/**
 * useSidebar
 *
 * Reads the sidebar context (open state, mobile state, and the toggle helper).
 * Must be called within a `SidebarProvider`; throws otherwise.
 *
 * @example
 * ```tsx
 * const { state, toggleSidebar } = useSidebar();
 * ```
 */
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

/**
 * SidebarProviderProps
 *
 * Props for the SidebarProvider component.
 */
interface SidebarProviderProps extends React.ComponentProps<'div'> {
  /**
   * Whether the sidebar starts open when uncontrolled.
   *
   * When uncontrolled, the provider persists the open state to a `sidebar_state`
   * cookie. It does not read the cookie back — restore across reloads by reading
   * it server-side and passing the result here.
   * @default true
   * @example
   * ```tsx
   * // Server Component (e.g. Next.js app/layout.tsx)
   * const store = await cookies();
   * const defaultOpen = store.get('sidebar_state')?.value !== 'false';
   * return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>;
   * ```
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state. Pair with `onOpenChange` to control externally.
   */
  open?: boolean;
  /**
   * Called when the open state changes (in controlled mode).
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * SidebarProvider
 *
 * Owns the sidebar's open state, the `Ctrl/Cmd+B` keyboard shortcut, and cookie
 * persistence. Wrap your app shell in it; every sidebar part reads its context.
 * Renders a `TooltipProvider` so collapsed-icon tooltips work out of the box.
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <Sidebar>…</Sidebar>
 *   <SidebarInset>…</SidebarInset>
 * </SidebarProvider>
 * ```
 */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsNarrow();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Internal open state; openProp/setOpenProp take over when controlled.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
        return;
      }

      _setOpen(openState);
      // Persist non-sensitive uncontrolled open state for server-side restore.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((value) => !value)
      : setOpen((value) => !value);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT) return;
      if (!event.metaKey && !event.ctrlKey) return;
      // Don't hijack Cmd/Ctrl+B (native bold) while typing in an editor.
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Drives data-state="expanded" | "collapsed" for the styling hooks below.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'nx:group/sidebar-wrapper nx:flex nx:min-h-svh nx:w-full nx:has-data-[variant=inset]:bg-nav-background',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/**
 * SidebarProps
 *
 * Props for the Sidebar component.
 */
interface SidebarProps extends React.ComponentProps<'div'> {
  /**
   * Which edge the sidebar docks to.
   * @default 'left'
   */
  side?: 'left' | 'right';
  /**
   * Visual treatment: flush `sidebar`, detached `floating`, or `inset` (pairs
   * with `SidebarInset` for a card-like main region).
   * @default 'sidebar'
   */
  variant?: 'sidebar' | 'floating' | 'inset';
  /**
   * Collapse behaviour: slide `offcanvas`, shrink to an `icon` rail, or `none`.
   * @default 'offcanvas'
   */
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

/**
 * Sidebar
 *
 * The sidebar panel. In the Narrow tier (below `lg`) it renders as a Sheet
 * drawer; at or above `lg` it docks to the chosen `side` and collapses per the
 * `collapsible` mode.
 *
 * @example
 * ```tsx
 * <Sidebar collapsible="icon">
 *   <SidebarContent>…</SidebarContent>
 * </Sidebar>
 * ```
 */
function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  style,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'nx:flex nx:h-full nx:w-(--sidebar-width) nx:flex-col nx:bg-nav-background nx:text-nav-foreground',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-slot="sidebar"
          data-mobile="true"
          side={side}
          showCloseButton={false}
          className={cn(
            'nx:w-(--sidebar-width) nx:bg-nav-background nx:p-0 nx:text-nav-foreground',
            className
          )}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          <SheetHeader className="nx:sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="nx:flex nx:h-full nx:w-full nx:flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="nx:group nx:peer nx:hidden nx:text-nav-foreground nx:lg:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Handles the sidebar gap on desktop. */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'nx:relative nx:w-(--sidebar-width) nx:bg-transparent nx:transition-[width] nx:duration-default nx:ease-linear',
          'nx:group-data-[collapsible=offcanvas]:w-0',
          'nx:group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'nx:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
            : 'nx:group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'nx:fixed nx:inset-y-0 nx:z-sticky nx:hidden nx:h-svh nx:w-(--sidebar-width) nx:transition-[left,right,width] nx:duration-default nx:ease-linear nx:lg:flex',
          side === 'left'
            ? 'nx:left-0 nx:group-data-[collapsible=offcanvas]:-left-(--sidebar-width)'
            : 'nx:right-0 nx:group-data-[collapsible=offcanvas]:-right-(--sidebar-width)',
          // Floating and inset variants gain padding around the panel; the
          // +1rem in the icon-collapse width below matches this inset.
          (variant === 'floating' || variant === 'inset') && 'nx:p-2',
          variant === 'floating' || variant === 'inset'
            ? 'nx:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]'
            : 'nx:group-data-[collapsible=icon]:w-(--sidebar-width-icon) nx:group-data-[side=left]:border-r-default nx:group-data-[side=right]:border-l-default nx:border-nav-border',
          className
        )}
        style={style}
        {...props}
      >
        <div
          data-slot="sidebar-inner"
          className="nx:flex nx:h-full nx:w-full nx:flex-col nx:bg-nav-background nx:group-data-[variant=floating]:rounded-lg nx:group-data-[variant=floating]:border-default nx:group-data-[variant=floating]:border-nav-border nx:group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * SidebarTriggerProps
 *
 * Props for the SidebarTrigger component.
 */
interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {}

/**
 * SidebarTrigger
 *
 * Icon button that toggles the sidebar. Place it in your top bar or sidebar
 * header. Also reachable via `Ctrl/Cmd+B`.
 */
function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    toggleSidebar();
  };

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('nx:size-7 nx:pointer-coarse:after:-inset-2', className)}
      onClick={handleClick}
      {...props}
    >
      <IconLayoutSidebar />
      <span className="nx:sr-only">Toggle Sidebar</span>
    </Button>
  );
}

/**
 * SidebarRailProps
 *
 * Props for the SidebarRail component.
 */
interface SidebarRailProps extends React.ComponentProps<'button'> {}

/**
 * SidebarRail
 *
 * Thin hit-target along the sidebar's inner edge that toggles it on click —
 * a quick affordance for collapsing/expanding without leaving the panel.
 */
function SidebarRail({ className, ...props }: SidebarRailProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'nx:absolute nx:inset-y-0 nx:z-sticky nx:hidden nx:w-4 nx:-translate-x-1/2 nx:transition-all nx:ease-linear nx:group-data-[side=left]:-right-4 nx:group-data-[side=right]:left-0 nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-0.5 nx:hover:after:bg-nav-border nx:lg:flex',
        'nx:in-data-[side=left]:cursor-w-resize nx:in-data-[side=right]:cursor-e-resize',
        'nx:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize nx:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'nx:group-data-[collapsible=offcanvas]:translate-x-0 nx:group-data-[collapsible=offcanvas]:after:left-full nx:hover:group-data-[collapsible=offcanvas]:bg-nav-background',
        'nx:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        'nx:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarInsetProps
 *
 * Props for the SidebarInset component.
 */
interface SidebarInsetProps extends React.ComponentProps<'main'> {}

/**
 * SidebarInset
 *
 * The main content region beside the sidebar. With `variant="inset"` it floats
 * as a rounded card; otherwise it fills the remaining width. `min-w-0` lets a
 * wide child (e.g. a data table) scroll inside its own container instead of
 * forcing the inset — and the page — wider than the viewport.
 */
function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'nx:relative nx:flex nx:w-full nx:min-w-0 nx:flex-1 nx:flex-col nx:bg-background',
        'nx:lg:peer-data-[variant=inset]:m-2 nx:lg:peer-data-[variant=inset]:ml-0 nx:lg:peer-data-[variant=inset]:rounded-xl nx:lg:peer-data-[variant=inset]:shadow-sm nx:lg:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarInputProps
 *
 * Props for the SidebarInput component.
 */
interface SidebarInputProps extends React.ComponentProps<typeof Input> {}

/**
 * SidebarInput
 *
 * An `Input` pre-styled to sit inside the sidebar (e.g. a filter field).
 */
function SidebarInput({ className, ...props }: SidebarInputProps) {
  return (
    <Input
      data-slot="sidebar-input"
      className={cn(
        'nx:h-8 nx:w-full nx:bg-background nx:pointer-coarse:min-h-11',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarHeaderProps
 *
 * Props for the SidebarHeader component.
 */
interface SidebarHeaderProps extends React.ComponentProps<'div'> {}

/**
 * SidebarHeader
 *
 * Top region of the sidebar — typically the brand mark or a workspace switcher.
 */
function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', className)}
      {...props}
    />
  );
}

/**
 * SidebarFooterProps
 *
 * Props for the SidebarFooter component.
 */
interface SidebarFooterProps extends React.ComponentProps<'div'> {}

/**
 * SidebarFooter
 *
 * Bottom region of the sidebar — typically a user menu or sign-out control.
 */
function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', className)}
      {...props}
    />
  );
}

/**
 * SidebarSeparatorProps
 *
 * Props for the SidebarSeparator component.
 */
interface SidebarSeparatorProps extends React.ComponentProps<
  typeof Separator
> {}

/**
 * SidebarSeparator
 *
 * A `Separator` inset to align with the sidebar's content padding.
 */
function SidebarSeparator({ className, ...props }: SidebarSeparatorProps) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={cn(
        'nx:mx-2 nx:data-[orientation=horizontal]:w-auto nx:bg-nav-border',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarContentProps
 *
 * Props for the SidebarContent component.
 */
interface SidebarContentProps extends React.ComponentProps<'nav'> {}

/**
 * SidebarContent
 *
 * The sidebar's scrollable nav region holding its groups and menus. Renders as a
 * `<nav>` landmark, named via `aria-label` (default "Sidebar"), so assistive tech
 * can jump to it — pass a distinct `aria-label` when a page has more than one
 * navigation. Hides overflow when collapsed to the icon rail.
 */
function SidebarContent({
  className,
  'aria-label': ariaLabel = 'Sidebar',
  'aria-labelledby': ariaLabelledby,
  ...props
}: SidebarContentProps) {
  return (
    <nav
      data-slot="sidebar-content"
      // A labelledby reference, when given, names the landmark — so suppress the
      // default string label rather than emitting both on the <nav> (issue #418).
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        'nx:flex nx:min-h-0 nx:flex-1 nx:flex-col nx:gap-2 nx:overflow-auto nx:group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarGroupProps
 *
 * Props for the SidebarGroup component.
 */
interface SidebarGroupProps extends React.ComponentProps<'div'> {}

/**
 * SidebarGroup
 *
 * A labelled section of the sidebar, grouping related menu items.
 */
function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(
        'nx:relative nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:p-2',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarGroupLabelProps
 *
 * Props for the SidebarGroupLabel component.
 */
interface SidebarGroupLabelProps extends React.ComponentProps<'div'> {
  /**
   * Render as the child element via Radix `Slot` (e.g. an accessible heading).
   * @default false
   */
  asChild?: boolean;
}

/**
 * SidebarGroupLabel
 *
 * The heading above a `SidebarGroup`. Fades out when the sidebar collapses to
 * the icon rail.
 */
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      className={cn(
        'nx:flex nx:h-8 nx:shrink-0 nx:items-center nx:rounded-md nx:px-2 nx:typography-label-small nx:text-nav-muted-foreground nx:transition-[margin,opacity] nx:duration-default nx:ease-linear nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:group-data-[collapsible=icon]:-mt-8 nx:group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarGroupActionProps
 *
 * Props for the SidebarGroupAction component.
 */
interface SidebarGroupActionProps extends React.ComponentProps<'button'> {
  /**
   * Render as the child element via Radix `Slot`.
   * @default false
   */
  asChild?: boolean;
}

/**
 * SidebarGroupAction
 *
 * A small action button pinned to a group's top-right (e.g. "add" next to a
 * group label). Hidden when collapsed to the icon rail.
 */
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: SidebarGroupActionProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      className={cn(
        'nx:absolute nx:top-3.5 nx:right-3 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:p-0 nx:text-nav-foreground nx:transition-transform nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        // Enlarges the hit area on touch viewports.
        'nx:after:absolute nx:after:-inset-2 nx:lg:after:hidden',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarGroupContentProps
 *
 * Props for the SidebarGroupContent component.
 */
interface SidebarGroupContentProps extends React.ComponentProps<'div'> {}

/**
 * SidebarGroupContent
 *
 * Wrapper for the body of a `SidebarGroup` (usually a `SidebarMenu`).
 */
function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn('nx:w-full nx:typography-body-default', className)}
      {...props}
    />
  );
}

/**
 * SidebarMenuProps
 *
 * Props for the SidebarMenu component.
 */
interface SidebarMenuProps extends React.ComponentProps<'ul'> {}

/**
 * SidebarMenu
 *
 * The `<ul>` holding a group's navigation items.
 */
function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn(
        'nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-px',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuItemProps
 *
 * Props for the SidebarMenuItem component.
 */
interface SidebarMenuItemProps extends React.ComponentProps<'li'> {}

/**
 * SidebarMenuItem
 *
 * A single `<li>` in a `SidebarMenu`; wraps a `SidebarMenuButton` plus optional
 * action/badge/sub-menu.
 */
function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn('nx:group/menu-item nx:relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  cn(
    'nx:peer/menu-button nx:flex nx:w-full nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:p-2 nx:text-left nx:text-nav-muted-foreground nx:transition-[width,height,padding]',
    'nx:group-has-data-[slot=sidebar-menu-action]/menu-item:pr-8 nx:group-data-[collapsible=icon]:size-8',
    'nx:group-data-[collapsible=icon]:justify-center nx:group-data-[collapsible=icon]:[&>span]:sr-only nx:group-data-[collapsible=icon]:[&>svg:not(:first-child)]:hidden',
    'nx:hover:bg-nav-item-hover nx:active:bg-nav-item-active',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground',
    'nx:data-[active=true]:bg-nav-item-active nx:data-[active=true]:text-nav-foreground',
    'nx:data-[state=open]:hover:bg-nav-item-hover',
    'nx:[&>span:last-child]:truncate nx:[&>svg]:size-4 nx:[&>svg]:shrink-0'
  ),
  {
    variants: {
      variant: {
        default: 'nx:hover:bg-nav-item-hover',
        outline:
          'nx:border-default nx:border-nav-border nx:bg-background nx:hover:bg-nav-item-hover',
      },
      size: {
        default:
          'nx:h-8 nx:typography-body-default nx:group-data-[collapsible=icon]:p-2',
        sm: 'nx:h-7 nx:typography-body-small nx:group-data-[collapsible=icon]:p-2',
        lg: 'nx:h-12 nx:typography-body-default nx:group-data-[collapsible=icon]:p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * SidebarMenuButtonProps
 *
 * Props for the SidebarMenuButton component.
 */
interface SidebarMenuButtonProps
  extends
    React.ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  /**
   * Render as the child element via Radix `Slot` (e.g. an `<a>` or router link).
   * @default false
   */
  asChild?: boolean;
  /**
   * Marks the item as the current page; styles it as selected.
   * @default false
   */
  isActive?: boolean;
  /**
   * Tooltip shown only when the sidebar is collapsed to the icon rail. Pass a
   * string for label-only, or `TooltipContent` props for full control.
   */
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

/**
 * SidebarMenuButton
 *
 * The primary clickable nav item. When the sidebar collapses to icons, an
 * optional `tooltip` surfaces the label on hover.
 *
 * @example
 * ```tsx
 * <SidebarMenuButton isActive tooltip="Inbox">
 *   <IconInbox /> <span>Inbox</span>
 * </SidebarMenuButton>
 * ```
 */
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-variant={variant}
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  const tooltipProps =
    typeof tooltip === 'string' ? { children: tooltip } : tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltipProps}
      />
    </Tooltip>
  );
}

/**
 * SidebarMenuActionProps
 *
 * Props for the SidebarMenuAction component.
 */
interface SidebarMenuActionProps extends React.ComponentProps<'button'> {
  /**
   * Render as the child element via Radix `Slot`.
   * @default false
   */
  asChild?: boolean;
  /**
   * Reveal the action only on hover/focus of the menu item (vs. always shown).
   * @default false
   */
  showOnHover?: boolean;
}

/**
 * SidebarMenuAction
 *
 * A secondary action pinned to a menu item's right edge (e.g. a "more" button).
 */
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      className={cn(
        'nx:absolute nx:top-1.5 nx:right-1 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:p-0 nx:text-nav-foreground nx:transition-transform nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        // Enlarges the hit area on touch viewports.
        'nx:after:absolute nx:after:-inset-2 nx:lg:after:hidden',
        'nx:peer-data-[size=sm]/menu-button:top-1',
        'nx:peer-data-[size=default]/menu-button:top-1.5',
        'nx:peer-data-[size=lg]/menu-button:top-2.5',
        'nx:group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'nx:group-focus-within/menu-item:opacity-100 nx:group-hover/menu-item:opacity-100 nx:data-[state=open]:opacity-100 nx:lg:opacity-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuBadgeProps
 *
 * Props for the SidebarMenuBadge component.
 */
interface SidebarMenuBadgeProps extends React.ComponentProps<'div'> {}

/**
 * SidebarMenuBadge
 *
 * A count or status pill aligned to a menu item's right edge.
 */
function SidebarMenuBadge({ className, ...props }: SidebarMenuBadgeProps) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        'nx:pointer-events-none nx:absolute nx:right-1 nx:flex nx:h-5 nx:min-w-5 nx:items-center nx:justify-center nx:rounded-md nx:px-1 nx:typography-label-small nx:text-nav-foreground nx:tabular-nums nx:select-none',
        'nx:peer-data-[size=sm]/menu-button:top-1',
        'nx:peer-data-[size=default]/menu-button:top-1.5',
        'nx:peer-data-[size=lg]/menu-button:top-2.5',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuSkeletonProps
 *
 * Props for the SidebarMenuSkeleton component.
 */
interface SidebarMenuSkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Render a leading icon-sized skeleton block alongside the text bar.
   * @default false
   */
  showIcon?: boolean;
}

/**
 * SidebarMenuSkeleton
 *
 * Loading placeholder for a menu row. Render a cluster while nav data loads.
 */
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: SidebarMenuSkeletonProps) {
  // Vary the text-bar width (50–90%) so a stack of skeletons looks organic.
  // Seed from the SSR-stable useId() — Math.random() here would differ between
  // server and client and trip a hydration mismatch.
  const id = React.useId();
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const width = `${50 + (seed % 41)}%`;

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      className={cn(
        'nx:flex nx:h-8 nx:items-center nx:gap-2 nx:rounded-md nx:px-2',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Skeleton
          data-slot="sidebar-menu-skeleton-icon"
          className="nx:size-4 nx:rounded-md"
        />
      )}
      <Skeleton
        data-slot="sidebar-menu-skeleton-text"
        className="nx:h-4 nx:max-w-(--skeleton-width) nx:flex-1"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

/**
 * SidebarMenuSubProps
 *
 * Props for the SidebarMenuSub component.
 */
interface SidebarMenuSubProps extends React.ComponentProps<'ul'> {}

/**
 * SidebarMenuSub
 *
 * The `<ul>` for a nested submenu, drawn with a left guide rule. Hidden when
 * collapsed to the icon rail.
 */
function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        'nx:ml-3.5 nx:flex nx:min-w-0 nx:translate-x-px nx:flex-col nx:gap-px nx:border-l-default nx:border-nav-border nx:pl-2.5 nx:py-0.5',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuSubItemProps
 *
 * Props for the SidebarMenuSubItem component.
 */
interface SidebarMenuSubItemProps extends React.ComponentProps<'li'> {}

/**
 * SidebarMenuSubItem
 *
 * A single `<li>` within a `SidebarMenuSub`.
 */
function SidebarMenuSubItem({ className, ...props }: SidebarMenuSubItemProps) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn('nx:group/menu-sub-item nx:relative', className)}
      {...props}
    />
  );
}

/**
 * SidebarMenuSubButtonProps
 *
 * Props for the SidebarMenuSubButton component.
 */
interface SidebarMenuSubButtonProps extends React.ComponentProps<'a'> {
  /**
   * Render as the child element via Radix `Slot` (e.g. a router link).
   * @default false
   */
  asChild?: boolean;
  /**
   * Text size of the sub-item.
   * @default 'md'
   */
  size?: 'sm' | 'md';
  /**
   * Marks the sub-item as the current page; styles it as selected.
   * @default false
   */
  isActive?: boolean;
}

/**
 * SidebarMenuSubButton
 *
 * A clickable item inside a submenu, rendered as an `<a>` by default.
 */
function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'nx:flex nx:h-7 nx:min-w-0 nx:-translate-x-px nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:px-2 nx:text-nav-muted-foreground nx:outline-hidden nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:active:bg-nav-item-active nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground nx:[&>span:last-child]:truncate nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:data-[active=true]:bg-nav-item-active nx:data-[active=true]:text-nav-foreground',
        size === 'sm' && 'nx:typography-body-small',
        size === 'md' && 'nx:typography-body-default',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  type SidebarContentProps,
  SidebarFooter,
  type SidebarFooterProps,
  SidebarGroup,
  SidebarGroupAction,
  type SidebarGroupActionProps,
  SidebarGroupContent,
  type SidebarGroupContentProps,
  SidebarGroupLabel,
  type SidebarGroupLabelProps,
  type SidebarGroupProps,
  SidebarHeader,
  type SidebarHeaderProps,
  SidebarInput,
  type SidebarInputProps,
  SidebarInset,
  type SidebarInsetProps,
  SidebarMenu,
  SidebarMenuAction,
  type SidebarMenuActionProps,
  SidebarMenuBadge,
  type SidebarMenuBadgeProps,
  SidebarMenuButton,
  type SidebarMenuButtonProps,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
  type SidebarMenuItemProps,
  type SidebarMenuProps,
  SidebarMenuSkeleton,
  type SidebarMenuSkeletonProps,
  SidebarMenuSub,
  SidebarMenuSubButton,
  type SidebarMenuSubButtonProps,
  SidebarMenuSubItem,
  type SidebarMenuSubItemProps,
  type SidebarMenuSubProps,
  type SidebarProps,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarRail,
  type SidebarRailProps,
  SidebarSeparator,
  type SidebarSeparatorProps,
  SidebarTrigger,
  type SidebarTriggerProps,
  useSidebar,
};
