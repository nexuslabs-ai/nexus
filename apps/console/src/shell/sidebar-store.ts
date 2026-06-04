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
 *
 * The Nexus `Sidebar` only writes its open state to a `sidebar_state` cookie for
 * server-side restore and never reads it back — a client-only SPA like the
 * console has no server to do that, so we own the state here instead. `persist`
 * uses localStorage (synchronous), so it hydrates before first paint — the
 * sidebar opens in its saved state, with no expanded→collapsed flash.
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
