import {
  createNexusAppearanceSnapshotFromCookie,
  DEFAULT_COOKIE_KEY,
} from '@nexus/core';
import { NexusAppearanceScript } from '@nexus/react/appearance/server';
import { cookies } from 'next/headers';

import { AppearanceFixtureClient } from './AppearanceFixtureClient';

export const dynamic = 'force-dynamic';

export default async function AppearanceSsrFixturePage() {
  const cookieStore = await cookies();
  const snapshot = createNexusAppearanceSnapshotFromCookie(
    cookieStore.get(DEFAULT_COOKIE_KEY)?.value
  );

  return (
    <>
      <NexusAppearanceScript storageKey={false} defaultState={snapshot.state} />
      <section
        data-nexus-appearance-fixture=""
        className="nx:mx-auto nx:max-w-4xl nx:space-y-6 nx:px-6 nx:py-12"
      >
        <div className="nx:space-y-2">
          <p className="nx:typography-label-default nx:text-muted-foreground">
            SSR Appearance Fixture
          </p>
          <h1 className="nx:typography-heading-large">
            Server cookie, package script, client provider
          </h1>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            This route proves the public package can paint from a server-derived
            appearance state before the client provider hydrates.
          </p>
        </div>
        <AppearanceFixtureClient defaultState={snapshot.state}>
          <div
            data-nexus-appearance-fixture-marker=""
            className="nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:rounded-xl nx:border nx:p-5 nx:shadow-lg"
          >
            <p className="nx:typography-label-default">Rendered content</p>
            <p className="nx:typography-body-small nx:text-muted-foreground">
              The package first-paint script is emitted before this marker.
            </p>
          </div>
        </AppearanceFixtureClient>
      </section>
    </>
  );
}
