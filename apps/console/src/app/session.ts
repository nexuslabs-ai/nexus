import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '../lib/auth-api';

export const DEMO_SESSION_STORAGE_KEY = 'nexus-console-session';

type SessionState = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
};

function clearDemoSessionStorage() {
  try {
    window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // localStorage can fail in privacy modes; in-memory sign-out still succeeds.
  }
}

/**
 * Demo-only session state for the mock console. The auth screens write the
 * mock-verified user here on sign-in; route guards read it synchronously via
 * `useSession.getState()`. Production auth must use server-issued HttpOnly
 * cookies instead of script-readable storage.
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => {
        set({ user: null });
        clearDemoSessionStorage();
      },
    }),
    { name: DEMO_SESSION_STORAGE_KEY }
  )
);
