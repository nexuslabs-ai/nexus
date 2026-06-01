import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { ComingSoon } from '../modules/coming-soon';
import { AppearanceRoute } from '../modules/design-system/appearance-route';
import { ReferenceRoute } from '../modules/design-system/reference-route';
import { ScenesRoute } from '../modules/design-system/scenes-route';

import { RootLayout } from './root-layout';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/design/reference' });
  },
});

const referenceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design/reference',
  component: ReferenceRoute,
});

const scenesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design/scenes',
  component: ScenesRoute,
});

const appearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design/appearance',
  component: AppearanceRoute,
});

// One shared placeholder backs every not-yet-built module.
const moduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/m/$module',
  component: ComingSoon,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  referenceRoute,
  scenesRoute,
  appearanceRoute,
  moduleRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
