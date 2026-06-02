import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '../lib/auth-api';

type SessionState = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
};

/**
 * The single source of session truth. The auth screens write the verified user
 * here on sign-in; the router's `beforeLoad` guards read it synchronously via
 * `useSession.getState()`. `persist` uses localStorage (synchronous), so the
 * store is hydrated before the first render — a guard never sees a stale `null`
 * on reload.
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: 'nexus-console-session' }
  )
);
