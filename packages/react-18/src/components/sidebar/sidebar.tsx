'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { useIsNarrow } from '../../hooks/use-narrow';
import { IconLayoutSidebar } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Separator } from '../separator/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../sheet/sheet';
import { Skeleton } from '../skeleton/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_NARROW = '18rem';
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
 * Shape of the context shared by `SidebarProvider` with every sidebar part.
 */
interface SidebarContextProps {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  openNarrow: boolean;
  setOpenNarrow: (open: boolean) => void;
  isNarrow: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/**
 * Reads the sidebar state and the `toggleSidebar` helper. Call it inside a
 * `SidebarProvider`, or it throws.
 */
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

/**
 * Props for SidebarProvider.
 */
interface SidebarProviderProps extends React.ComponentProps<'div'> {
  /**
   * Opens the sidebar on first render when uncontrolled. The open state is saved
   * to a `sidebar_state` cookie. Read that cookie on the server and pass it here
   * to restore it.
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state. Pair it with `onOpenChange`.
   */
  open?: boolean;
  /**
   * Called when the open state changes in controlled mode.
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Holds the open state and the `Ctrl/Cmd+B` shortcut. Wrap your app shell in
 * it. It includes a `TooltipProvider` for collapsed-icon tooltips.
 */
const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarProviderProps>
>(function SidebarProvider(propsWithoutRef, forwardedRef) {
  const {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }: React.PropsWithoutRef<SidebarProviderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const isNarrow = useIsNarrow();
  const [openNarrow, setOpenNarrow] = React.useState(false);

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
    return isNarrow
      ? setOpenNarrow((value) => !value)
      : setOpen((value) => !value);
  }, [isNarrow, setOpen, setOpenNarrow]);

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
      isNarrow,
      openNarrow,
      setOpenNarrow,
      toggleSidebar,
    }),
    [state, open, setOpen, isNarrow, openNarrow, setOpenNarrow, toggleSidebar]
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
});

/**
 * Props for Sidebar.
 */
interface SidebarProps extends React.ComponentProps<'div'> {
  /**
   * Edge the sidebar docks to.
   */
  side?: 'left' | 'right';
  /**
   * Visual style. `inset` pairs with `SidebarInset` to show the main region as a
   * card.
   */
  variant?: 'sidebar' | 'floating' | 'inset';
  /**
   * How it collapses: slides off screen, shrinks to an icon rail, or never.
   */
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

/**
 * The sidebar panel. Below `md` it opens as a Sheet. From `md` up it docks to
 * `side` and collapses as `collapsible` sets.
 */
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarProps>
>(function Sidebar(propsWithoutRef, forwardedRef) {
  const {
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    className,
    style,
    children,
    ...props
  }: React.PropsWithoutRef<SidebarProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const { isNarrow, state, openNarrow, setOpenNarrow } = useSidebar();

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

  if (isNarrow) {
    return (
      <Sheet open={openNarrow} onOpenChange={setOpenNarrow}>
        <SheetContent
          data-slot="sidebar"
          data-narrow="true"
          side={side}
          className={cn(
            'nx:inset-y-2 nx:h-auto nx:w-(--sidebar-width) nx:max-w-[calc(100vw-1rem)] nx:rounded-lg nx:border-default nx:border-nav-border nx:bg-nav-background nx:p-0 nx:text-nav-foreground',
            side === 'left'
              ? 'nx:left-2 nx:data-[state=closed]:-translate-x-[calc(100%+0.5rem)]'
              : 'nx:right-2 nx:data-[state=closed]:translate-x-[calc(100%+0.5rem)]',
            className
          )}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_NARROW,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          <SheetHeader className="nx:sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>
              Displays the narrow-tier sidebar.
            </SheetDescription>
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
      className="nx:group nx:peer nx:hidden nx:text-nav-foreground nx:md:block"
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
          'nx:fixed nx:inset-y-0 nx:z-sticky nx:hidden nx:h-svh nx:w-(--sidebar-width) nx:transition-[left,right,width] nx:duration-default nx:ease-linear nx:md:flex',
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
});

/**
 * Props for SidebarTrigger.
 */
type SidebarTriggerProps = React.ComponentProps<typeof Button>;

/**
 * Icon button that opens and closes the sidebar. Place it in your top bar or
 * sidebar header.
 */
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SidebarTriggerProps>
>(function SidebarTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    onClick,
    ...props
  }: React.PropsWithoutRef<SidebarTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
      className={cn('nx:size-7', className)}
      onClick={handleClick}
      {...props}
    >
      <IconLayoutSidebar />
      <span className="nx:sr-only">Toggle Sidebar</span>
    </Button>
  );
});

/**
 * Props for SidebarRail.
 */
type SidebarRailProps = React.ComponentProps<'button'>;

/**
 * Thin strip on the sidebar's inner edge that toggles the sidebar on click.
 */
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SidebarRailProps>
>(function SidebarRail(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarRailProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'nx:absolute nx:inset-y-0 nx:z-sticky nx:hidden nx:w-4 nx:border-0 nx:bg-transparent nx:p-0 nx:-translate-x-1/2 nx:transition-[left,right,translate,background-color] nx:duration-fast nx:ease-linear nx:group-data-[side=left]:-right-4 nx:group-data-[side=right]:left-0 nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-0.5 nx:hover:after:bg-nav-border nx:md:flex',
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
});

/**
 * Props for SidebarInset.
 */
type SidebarInsetProps = React.ComponentProps<'main'>;

/**
 * Main content region beside the sidebar. With `variant="inset"` it shows as a
 * rounded card. Wide children such as tables scroll inside it.
 */
const SidebarInset = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<SidebarInsetProps>
>(function SidebarInset(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarInsetProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'nx:relative nx:flex nx:w-full nx:min-w-0 nx:flex-1 nx:flex-col nx:bg-background',
        'nx:md:peer-data-[variant=inset]:m-2 nx:md:peer-data-[variant=inset]:ml-0 nx:md:peer-data-[variant=inset]:rounded-xl nx:md:peer-data-[variant=inset]:shadow-sm nx:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarInput.
 */
type SidebarInputProps = React.ComponentProps<typeof Input>;

/**
 * `Input` styled for the sidebar, such as a filter field.
 */
const SidebarInput = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<SidebarInputProps>
>(function SidebarInput(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarInputProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Input
      data-slot="sidebar-input"
      className={cn(
        'nx:h-8 nx:w-full nx:bg-background nx:autofill-bg-background',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarHeader.
 */
type SidebarHeaderProps = React.ComponentProps<'div'>;

/**
 * Top of the sidebar, for a logo or a workspace switcher.
 */
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarHeaderProps>
>(function SidebarHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="sidebar-header"
      className={cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', className)}
      {...props}
    />
  );
});

/**
 * Props for SidebarFooter.
 */
type SidebarFooterProps = React.ComponentProps<'div'>;

/**
 * Bottom of the sidebar, for a user menu or sign-out button.
 */
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarFooterProps>
>(function SidebarFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', className)}
      {...props}
    />
  );
});

/**
 * Props for SidebarSeparator.
 */
type SidebarSeparatorProps = React.ComponentProps<typeof Separator>;

/**
 * `Separator` inset to line up with the sidebar's content.
 */
const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarSeparatorProps>
>(function SidebarSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SidebarContent.
 */
type SidebarContentProps = React.ComponentProps<'nav'>;

/**
 * Scrollable `<nav>` landmark that holds the groups and menus. Its `aria-label`
 * defaults to "Sidebar". Give each `<nav>` on a page a distinct `aria-label`.
 */
const SidebarContent = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<SidebarContentProps>
>(function SidebarContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    'aria-label': ariaLabel = 'Sidebar',
    'aria-labelledby': ariaLabelledby,
    ...props
  }: React.PropsWithoutRef<SidebarContentProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SidebarGroup.
 */
type SidebarGroupProps = React.ComponentProps<'div'>;

/**
 * Labelled section that groups related menu items.
 */
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarGroupProps>
>(function SidebarGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SidebarGroupLabel.
 */
interface SidebarGroupLabelProps extends React.ComponentProps<'div'> {
  /**
   * Renders the child element instead, such as a heading.
   */
  asChild?: boolean;
}

/**
 * Heading of a `SidebarGroup`. Fades out on the icon rail.
 */
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarGroupLabelProps>
>(function SidebarGroupLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    asChild = false,
    ...props
  }: React.PropsWithoutRef<SidebarGroupLabelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      className={cn(
        'nx:flex nx:h-8 nx:shrink-0 nx:items-center nx:rounded-md nx:px-2 nx:typography-label-small nx:text-nav-muted-foreground nx:transition-[margin,opacity] nx:duration-default nx:ease-linear nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:group-data-[collapsible=icon]:-mt-8 nx:group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarGroupAction.
 */
interface SidebarGroupActionProps extends React.ComponentProps<'button'> {
  /**
   * Renders the child element instead.
   */
  asChild?: boolean;
}

/**
 * Small button at a group's top-right, such as "Add". Hidden on the icon rail.
 */
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SidebarGroupActionProps>
>(function SidebarGroupAction(propsWithoutRef, forwardedRef) {
  const {
    className,
    asChild = false,
    ...props
  }: React.PropsWithoutRef<SidebarGroupActionProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      className={cn(
        'nx:absolute nx:top-3.5 nx:right-3 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-nav-foreground nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarGroupContent.
 */
type SidebarGroupContentProps = React.ComponentProps<'div'>;

/**
 * Body of a `SidebarGroup`, usually a `SidebarMenu`.
 */
const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarGroupContentProps>
>(function SidebarGroupContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarGroupContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn('nx:w-full nx:typography-body-default', className)}
      {...props}
    />
  );
});

/**
 * Props for SidebarMenu.
 */
type SidebarMenuProps = React.ComponentProps<'ul'>;

/**
 * `<ul>` that holds a group's nav items.
 */
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.PropsWithoutRef<SidebarMenuProps>
>(function SidebarMenu(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuProps> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn(
        'nx:m-0 nx:flex nx:w-full nx:min-w-0 nx:list-none nx:flex-col nx:gap-px nx:p-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarMenuItem.
 */
type SidebarMenuItemProps = React.ComponentProps<'li'>;

/**
 * One `<li>` in a `SidebarMenu`. Holds a `SidebarMenuButton` and an optional
 * action, badge or submenu.
 */
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<SidebarMenuItemProps>
>(function SidebarMenuItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuItemProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn('nx:group/menu-item nx:relative', className)}
      {...props}
    />
  );
});

const sidebarMenuButtonVariants = cva(
  cn(
    'nx:peer/menu-button nx:flex nx:w-full nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:border-0 nx:bg-transparent nx:p-2 nx:text-left nx:text-nav-muted-foreground nx:no-underline nx:transition-[width,height,padding] nx:duration-fast',
    'nx:group-has-data-[slot=sidebar-menu-action]/menu-item:pr-8 nx:group-data-[collapsible=icon]:size-8',
    'nx:group-data-[collapsible=icon]:justify-center nx:group-data-[collapsible=icon]:[&>span]:sr-only nx:group-data-[collapsible=icon]:[&>svg:not(:first-child)]:hidden',
    'nx:hover:bg-nav-item-hover nx:active:bg-nav-item-active',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
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
          'nx:border-default nx:border-nav-border nx:bg-nav-background nx:hover:bg-nav-item-hover',
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
 * Props for SidebarMenuButton.
 */
interface SidebarMenuButtonProps
  extends
    React.ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  /**
   * Renders the child element instead, such as a router link.
   */
  asChild?: boolean;
  /**
   * Marks the item as the current page.
   */
  isActive?: boolean;
  /**
   * Tooltip shown only on the icon rail. A string or `TooltipContent` props.
   */
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

/**
 * Main clickable nav item. On the icon rail, `tooltip` shows the label on
 * hover.
 */
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SidebarMenuButtonProps>
>(function SidebarMenuButton(propsWithoutRef, forwardedRef) {
  const {
    asChild = false,
    isActive = false,
    variant = 'default',
    size = 'default',
    tooltip,
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'button';
  const { isNarrow, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-variant={variant}
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
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
        hidden={state !== 'collapsed' || isNarrow}
        {...tooltipProps}
      />
    </Tooltip>
  );
});

/**
 * Props for SidebarMenuAction.
 */
interface SidebarMenuActionProps extends React.ComponentProps<'button'> {
  /**
   * Renders the child element instead.
   */
  asChild?: boolean;
  /**
   * Shows the action only on hover or focus of the menu item.
   */
  showOnHover?: boolean;
}

/**
 * Secondary button on a menu item's right edge, such as "More".
 */
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SidebarMenuActionProps>
>(function SidebarMenuAction(propsWithoutRef, forwardedRef) {
  const {
    className,
    asChild = false,
    showOnHover = false,
    ...props
  }: React.PropsWithoutRef<SidebarMenuActionProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      className={cn(
        'nx:absolute nx:top-1.5 nx:right-1 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-nav-foreground nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:peer-data-[size=sm]/menu-button:top-1',
        'nx:peer-data-[size=default]/menu-button:top-1.5',
        'nx:peer-data-[size=lg]/menu-button:top-2.5',
        'nx:group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'nx:group-focus-within/menu-item:opacity-100 nx:group-hover/menu-item:opacity-100 nx:data-[state=open]:opacity-100 nx:md:opacity-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarMenuBadge.
 */
type SidebarMenuBadgeProps = React.ComponentProps<'div'>;

/**
 * Count or status pill on a menu item's right edge.
 */
const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarMenuBadgeProps>
>(function SidebarMenuBadge(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuBadgeProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SidebarMenuSkeleton.
 */
interface SidebarMenuSkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Adds an icon-sized block before the text bar.
   */
  showIcon?: boolean;
}

/**
 * Placeholder for a menu row while nav data loads.
 */
const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SidebarMenuSkeletonProps>
>(function SidebarMenuSkeleton(propsWithoutRef, forwardedRef) {
  const {
    className,
    showIcon = false,
    ...props
  }: React.PropsWithoutRef<SidebarMenuSkeletonProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SidebarMenuSub.
 */
type SidebarMenuSubProps = React.ComponentProps<'ul'>;

/**
 * `<ul>` for a nested submenu, with a guide line on the left. Hidden on the
 * icon rail.
 */
const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.PropsWithoutRef<SidebarMenuSubProps>
>(function SidebarMenuSub(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuSubProps> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        'nx:my-0 nx:mr-0 nx:ml-3.5 nx:flex nx:min-w-0 nx:list-none nx:translate-x-px nx:flex-col nx:gap-px nx:border-l-default nx:border-nav-border nx:pl-2.5 nx:py-0.5',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for SidebarMenuSubItem.
 */
type SidebarMenuSubItemProps = React.ComponentProps<'li'>;

/**
 * One `<li>` in a `SidebarMenuSub`.
 */
const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<SidebarMenuSubItemProps>
>(function SidebarMenuSubItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuSubItemProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn('nx:group/menu-sub-item nx:relative', className)}
      {...props}
    />
  );
});

/**
 * Props for SidebarMenuSubButton.
 */
interface SidebarMenuSubButtonProps extends React.ComponentProps<'a'> {
  /**
   * Renders the child element instead, such as a router link.
   */
  asChild?: boolean;
  /**
   * Text size of the sub-item.
   */
  size?: 'sm' | 'md';
  /**
   * Marks the sub-item as the current page.
   */
  isActive?: boolean;
}

/**
 * Clickable item in a submenu. Renders an `<a>` by default.
 */
const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<SidebarMenuSubButtonProps>
>(function SidebarMenuSubButton(propsWithoutRef, forwardedRef) {
  const {
    asChild = false,
    size = 'md',
    isActive = false,
    className,
    ...props
  }: React.PropsWithoutRef<SidebarMenuSubButtonProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'nx:flex nx:h-7 nx:min-w-0 nx:-translate-x-px nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:px-2 nx:text-nav-muted-foreground nx:no-underline nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:active:bg-nav-item-active nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground nx:[&>span:last-child]:truncate nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:data-[active=true]:bg-nav-item-active nx:data-[active=true]:text-nav-foreground',
        size === 'sm' && 'nx:typography-body-small',
        size === 'md' && 'nx:typography-body-default',
        'nx:group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});

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
