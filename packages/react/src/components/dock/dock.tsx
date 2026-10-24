'use client';

import * as React from 'react';

import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { Popover, PopoverAnchor } from '../popover/popover';
import { Toolbar, ToolbarButton } from '../toolbar/toolbar';

type DockContextValue = {
  value: string;
  open: boolean;
  hasPanel: boolean;
  panelId: string;
  sideOffset: number;
  root: React.RefObject<HTMLDivElement | null>;
  active: React.RefObject<HTMLButtonElement | null>;
  select: (value: string) => void;
  setOpen: (open: boolean) => void;
  setPanelHeight: (height: number) => void;
};

const DockContext = React.createContext<DockContextValue | null>(null);

function useDock() {
  const context = React.useContext(DockContext);
  if (!context) throw new Error('Dock parts must be rendered inside Dock.');
  return context;
}

interface DockProps extends Omit<React.ComponentProps<'div'>, 'defaultValue'> {
  /** The selected tool. The caller owns the selection and its panel content. */
  value: string;
  onValueChange: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional DockPanel containing the selected tool's controls. */
  panel?: React.ReactNode;
}

/** A horizontal tool dock. Its parent owns placement; arrows move focus and Enter selects. */
function Dock({
  value,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  panel,
  children,
  className,
  ref,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...props
}: DockProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const active = React.useRef<HTMLButtonElement>(null);
  const surface = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, root);
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const [panelHeight, setPanelHeight] = React.useState(0);
  const panelId = React.useId();
  const [activeAvailable, setActiveAvailable] = React.useState(false);
  const [sideOffset, setSideOffset] = React.useState(16);
  const hasPanel = panel != null && panel !== false;
  const open = hasPanel && activeAvailable && (openProp ?? localOpen);

  function setOpen(next: boolean) {
    if (openProp === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  }

  function select(next: string) {
    onValueChange(next);
    if (hasPanel) setOpen(next === value ? !open : true);
  }

  React.useLayoutEffect(() => {
    const dock = root.current;
    const background = surface.current;
    if (!dock || !background) return;
    const bar = dock.querySelector<HTMLElement>('[data-slot="dock-bar"]');
    if (!bar) return;
    function measure() {
      if (!dock || !background) return;
      const button = dock.querySelector<HTMLButtonElement>(
        '[data-slot="dock-item"][data-state="active"]:not(:disabled)'
      );
      active.current = button;
      setActiveAvailable(Boolean(button));
      if (!button) {
        background.style.opacity = '0';
        return;
      }
      const bar = button.parentElement;
      if (!bar) return;
      const padding = parseFloat(getComputedStyle(bar).paddingLeft);
      const left = button.offsetLeft - padding;
      const right = button.offsetLeft + button.offsetWidth + padding;
      if (left < bar.scrollLeft) bar.scrollLeft = left;
      else if (right > bar.scrollLeft + bar.clientWidth)
        bar.scrollLeft = right - bar.clientWidth;
      const bounds = button.getBoundingClientRect();
      const origin = dock.getBoundingClientRect();
      const inset = bounds.top - origin.top - dock.clientTop;
      const gap = parseFloat(getComputedStyle(bar).paddingTop) * 2;
      setSideOffset(gap);
      const top = open ? inset - gap - panelHeight : inset;
      background.style.left = `${bounds.left - origin.left - dock.clientLeft}px`;
      background.style.top = `${top}px`;
      background.style.width = `${bounds.width}px`;
      background.style.height = `${bounds.height + inset - top}px`;
      background.style.opacity = '1';
    }
    measure();
    let frame = 0;
    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(dock);
    if (active.current) observer.observe(active.current);
    const mutations = new MutationObserver(measure);
    mutations.observe(dock, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-state', 'disabled'],
    });
    bar.addEventListener('scroll', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      bar.removeEventListener('scroll', measure);
    };
  }, [value, open, panelHeight, children]);

  const context = {
    value,
    open,
    hasPanel,
    panelId,
    sideOffset,
    root,
    active,
    select,
    setOpen,
    setPanelHeight,
  };

  return (
    <DockContext.Provider value={context}>
      <Popover open={open} onOpenChange={setOpen}>
        <div
          {...props}
          ref={composedRef}
          data-slot="dock"
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'nx:relative nx:isolate nx:w-fit nx:max-w-full nx:min-w-0 nx:[&>[data-radix-popper-content-wrapper]]:transition-transform nx:[&>[data-radix-popper-content-wrapper]]:duration-default nx:[&>[data-radix-popper-content-wrapper]]:ease-move',
            className
          )}
        >
          <Toolbar
            data-slot="dock-bar"
            aria-label={label}
            aria-labelledby={labelledBy}
            className="nx:relative nx:box-border nx:h-[calc(var(--nx-spacing-16)+var(--nx-spacing-2))] nx:w-fit nx:max-w-full nx:flex-nowrap nx:gap-1 nx:overflow-x-auto nx:rounded-[calc(var(--nx-radius-4xl)+var(--nx-radius-2xl))] nx:border-border-hairline nx:bg-container nx:p-2 nx:shadow-xl nx:inset-shadow-[0_var(--nx-borderwidth-default)_0_var(--nx-color-border-hairline)] nx:[scrollbar-width:none]"
          >
            {children}
          </Toolbar>
          <div
            ref={surface}
            data-slot="dock-surface"
            data-state={open ? 'open' : 'closed'}
            aria-hidden="true"
            className="nx:pointer-events-none nx:absolute nx:z-10 nx:box-border nx:rounded-4xl nx:data-[state=open]:rounded-t-[calc(var(--nx-radius-3xl)+var(--nx-radius-md))] nx:border-default nx:border-border-hairline nx:bg-popover nx:opacity-0 nx:shadow-xl nx:inset-shadow-[0_var(--nx-borderwidth-default)_0_var(--nx-color-border-hairline)] nx:transition-[left,top,width,height,border-radius] nx:duration-default nx:ease-move"
          />
          <PopoverAnchor
            virtualRef={active as React.RefObject<HTMLButtonElement>}
          />
          {panel}
        </div>
      </Popover>
    </DockContext.Provider>
  );
}

interface DockItemProps extends Omit<
  React.ComponentProps<typeof ToolbarButton>,
  'value' | 'variant' | 'size'
> {
  value: string;
  'aria-label': string;
}

/** A tool button. Supply an icon and DockLabel, or compose a button with asChild. */
function DockItem({
  value,
  className,
  onClick,
  onKeyDown,
  ...props
}: DockItemProps) {
  const dock = useDock();
  const selected = value === dock.value;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) dock.select(value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'ArrowUp' || !dock.hasPanel)
      return;
    event.preventDefault();
    if (selected) dock.setOpen(true);
    else dock.select(value);
  }

  return (
    <ToolbarButton
      {...props}
      data-slot="dock-item"
      data-state={selected ? 'active' : 'inactive'}
      aria-pressed={selected}
      aria-haspopup={dock.hasPanel ? 'dialog' : undefined}
      aria-expanded={dock.hasPanel ? selected && dock.open : undefined}
      aria-controls={
        dock.hasPanel && selected && dock.open
          ? dock.panelId
          : props['aria-controls']
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'nx:group/dock-item nx:relative nx:z-20 nx:h-full nx:min-w-12 nx:w-16 nx:shrink nx:grow-0 nx:gap-2 nx:rounded-4xl nx:border-0 nx:px-2 nx:py-0 nx:typography-label-default nx:text-muted-foreground nx:shadow-none nx:active:scale-100 nx:[&_svg]:size-[calc(var(--nx-spacing-6)+var(--nx-spacing-1)/2)] nx:[&_svg]:stroke-[1.6] nx:hover:bg-transparent nx:active:bg-transparent nx:focus-visible:bg-transparent nx:before:absolute nx:before:-z-10 nx:before:size-12 nx:before:rounded-2xl nx:before:bg-container-hover nx:before:opacity-0 nx:before:transition-opacity nx:before:duration-fast nx:data-[state=inactive]:hover:before:opacity-100 nx:data-[state=inactive]:focus-visible:before:opacity-100 nx:data-[state=active]:w-[calc(var(--nx-spacing-64)+var(--nx-spacing-6))] nx:data-[state=active]:min-w-56 nx:data-[state=active]:bg-transparent nx:data-[state=active]:text-popover-foreground nx:disabled:text-disabled-foreground',
        className
      )}
    />
  );
}

/** Only the selected tool's label is visible; every DockItem still needs an accessible name. */
function DockLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      {...props}
      data-slot="dock-label"
      aria-hidden="true"
      className={cn(
        'nx:hidden nx:min-w-0 nx:truncate nx:group-data-[state=active]/dock-item:block',
        className
      )}
    />
  );
}

interface DockPanelProps extends Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  | 'title'
  | 'side'
  | 'sideOffset'
  | 'align'
  | 'avoidCollisions'
  | 'asChild'
  | 'forceMount'
> {
  title: string;
}

/** Controls above the active tool. Width follows the pill; overflow stays inside the panel. */
function DockPanel({
  title,
  children,
  className,
  ref,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  ...props
}: DockPanelProps) {
  const dock = useDock();
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, setContent);
  const restoreFocus = React.useRef(true);
  const titleId = React.useId();
  const { setPanelHeight } = dock;

  React.useLayoutEffect(() => {
    if (!content) return;
    function measure() {
      if (!content) return;
      setPanelHeight(content.getBoundingClientRect().height);
    }
    measure();
    let frame = 0;
    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(content);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [content, setPanelHeight]);

  function handleOpenAutoFocus(event: Event) {
    restoreFocus.current = true;
    onOpenAutoFocus?.(event);
  }

  function handleCloseAutoFocus(event: Event) {
    onCloseAutoFocus?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (restoreFocus.current)
      dock.active.current?.focus({ preventScroll: true });
  }

  const handleInteractOutside: NonNullable<
    DockPanelProps['onInteractOutside']
  > = (event) => {
    onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (dock.root.current?.contains(event.target as Node)) {
      event.preventDefault();
      return;
    }
    restoreFocus.current = false;
  };

  return (
    <PopoverPrimitive.Portal container={dock.root.current}>
      <PopoverPrimitive.Content
        {...props}
        ref={composedRef}
        id={dock.panelId}
        data-slot="dock-panel"
        aria-labelledby={titleId}
        side="top"
        sideOffset={dock.sideOffset}
        align="center"
        avoidCollisions={false}
        onOpenAutoFocus={handleOpenAutoFocus}
        onCloseAutoFocus={handleCloseAutoFocus}
        onInteractOutside={handleInteractOutside}
        className={cn(
          'nx:z-popover nx:box-border nx:w-[var(--radix-popover-trigger-width)] nx:max-h-[var(--radix-popover-content-available-height)] nx:min-h-0 nx:overflow-y-auto nx:overscroll-contain nx:bg-transparent nx:p-5 nx:text-popover-foreground nx:typography-body-default nx:outline-none nx:transition-opacity nx:duration-fast nx:starting:opacity-0 nx:data-[state=closed]:pointer-events-none nx:data-[state=closed]:opacity-0 nx:data-[state=closed]:animate-overlay-presence-exit',
          className
        )}
      >
        <div
          data-slot="dock-panel-header"
          className="nx:mb-8 nx:flex nx:items-center nx:justify-between nx:gap-2"
        >
          <h2
            id={titleId}
            data-slot="dock-panel-title"
            className="nx:m-0 nx:min-w-0 nx:typography-label-default nx:break-words"
          >
            {title}
          </h2>
          <PopoverPrimitive.Close asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Close controls"
              className="nx:size-6 nx:rounded-4xl nx:bg-container nx:[&_svg]:size-3.5"
            >
              <IconX />
            </Button>
          </PopoverPrimitive.Close>
        </div>
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

export {
  Dock,
  DockItem,
  type DockItemProps,
  DockLabel,
  DockPanel,
  type DockPanelProps,
  type DockProps,
};
