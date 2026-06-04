import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

/**
 * Persists the app-shell sidebar's expanded/collapsed state across reloads.
 * Wired into `SidebarProvider` as its controlled `open` / `onOpenChange`, so the
 * rail toggle and the `Cmd/Ctrl+B` shortcut flow through here too.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set({ open }),
    }),
    { name: 'nexus-console-sidebar' }
  )
);
