import { beforeEach, describe, expect, it } from 'vitest';

import type { User } from '../lib/auth-api';

import { DEMO_SESSION_STORAGE_KEY, useSession } from './session';

const DEMO_USER: User = {
  id: 'demo@atlas.dev',
  name: 'Demo User',
  email: 'demo@atlas.dev',
};

function readStoredUser(): User | null {
  const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  if (!raw) return null;

  const stored = JSON.parse(raw) as { state?: { user?: User | null } };
  return stored.state?.user ?? null;
}

beforeEach(() => {
  useSession.setState({ user: null });
  window.localStorage.clear();
});

describe('useSession', () => {
  it('persists the demo user for the mock console session', () => {
    useSession.getState().signIn(DEMO_USER);

    expect(useSession.getState().user).toMatchObject(DEMO_USER);
    expect(readStoredUser()).toMatchObject(DEMO_USER);
  });

  it('removes script-readable demo session storage on sign out', () => {
    useSession.getState().signIn(DEMO_USER);

    expect(readStoredUser()).toMatchObject(DEMO_USER);

    useSession.getState().signOut();

    expect(useSession.getState().user).toBeNull();
    expect(window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY)).toBeNull();
  });
});
