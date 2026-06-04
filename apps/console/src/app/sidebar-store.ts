import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Icon rail (collapses to icons) vs offcanvas (collapses to fully hidden). */
export type SidebarMode = 'icon' | 'offcanvas';

type SidebarState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
};

/**
 * Persists the app-shell sidebar's open state and collapse mode (icon rail vs
 * full offcanvas) across reloads. Controls `SidebarProvider`'s `open` /
 * `onOpenChange` and the `Sidebar` `collapsible` prop; the Appearance panel sets
 * the mode, and the rail toggle and `Cmd/Ctrl+B` shortcut flow through here.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set({ open }),
      mode: 'icon',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'nexus-console-sidebar' }
  )
);
