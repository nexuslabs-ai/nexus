import { Toaster } from '@nexus_ds/react';
import { Outlet } from '@tanstack/react-router';

/**
 * The thin root rendered by the root route. It holds only app-wide chrome that
 * must sit above BOTH the authenticated shell and the auth screens — currently
 * just the toast portal — plus an <Outlet> for whichever pathless layout (the
 * authenticated `_app` shell or the shell-less `_auth` screens) matches.
 */
export function Root() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
