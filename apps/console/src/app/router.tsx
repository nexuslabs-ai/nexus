import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';

import { AppearanceRoute } from '../modules/design-system/appearance-route';
import { validateExploreSearch } from '../modules/tokens/catalog';

import { NotFound } from './not-found';
import { RootLayout } from './root-layout';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/explore' });
  },
});
const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  validateSearch: validateExploreSearch,
  component: lazyRouteComponent(
    () => import('../modules/tokens/explore-route'),
    'ExploreRoute'
  ),
});
const appearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/appearance',
  component: AppearanceRoute,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, exploreRoute, appearanceRoute]),
  scrollRestoration: true,
  basepath: import.meta.env.BASE_URL,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
