import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { z } from 'zod';

import { ForgotRoute } from '../modules/auth/forgot-route';
import { LoginRoute } from '../modules/auth/login-route';
import { SignupRoute } from '../modules/auth/signup-route';
import { VerifyRoute } from '../modules/auth/verify-route';
import { ComingSoon } from '../modules/coming-soon';
import { ContactDetailRoute } from '../modules/crm/contact-detail-route';
import { ContactsRoute } from '../modules/crm/contacts-route';
import { contactsSearchSchema } from '../modules/crm/contacts-search';
import { AppearanceRoute } from '../modules/design-system/appearance-route';
import { ReferenceRoute } from '../modules/design-system/reference-route';
import { ScenesRoute } from '../modules/design-system/scenes-route';
import { InboxRoute } from '../modules/inbox/inbox-route';
import { IssueDetailRoute } from '../modules/projects/issue-detail-route';
import { IssuesRoute } from '../modules/projects/issues-route';

import { AuthLayout } from './auth-layout';
import { NotFound } from './not-found';
import { Root } from './root';
import { RootLayout } from './root-layout';
import { useSession } from './session';

const rootRoute = createRootRoute({ component: Root });

// Pathless layout route: the authenticated app shell. Its guard bounces
// unauthenticated visitors to /login before any child route loads.
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: RootLayout,
  beforeLoad: () => {
    if (!useSession.getState().user) {
      throw redirect({ to: '/login' });
    }
  },
});

// Pathless layout route: the shell-less auth screens. The mirror guard sends an
// already-authenticated visitor to the app home instead of a login form.
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: AuthLayout,
  beforeLoad: () => {
    if (useSession.getState().user) {
      throw redirect({ to: '/' });
    }
  },
});

// --- Authenticated app routes (children of appRoute) ---

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/design/reference' });
  },
});

const referenceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/design/reference',
  component: ReferenceRoute,
});

const scenesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/design/scenes',
  component: ScenesRoute,
});

const appearanceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/design/appearance',
  component: AppearanceRoute,
});

// CRM Contacts (Phase 2a). The static `/m/crm` path outranks the dynamic
// `/m/$module` placeholder below, so the real module wins over "coming soon".
const crmContactsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/crm',
  validateSearch: contactsSearchSchema,
  component: ContactsRoute,
});

const crmContactDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/crm/$id',
  component: ContactDetailRoute,
});

// Projects / Issues (Phase 3a). Static `/m/projects` outranks `/m/$module`.
const projectsIssuesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/projects',
  component: IssuesRoute,
});

const projectsIssueDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/projects/$id',
  component: IssueDetailRoute,
});

// Inbox (Phase 3b). Static `/m/inbox` outranks `/m/$module`. The open
// conversation rides in `?c` — absent shows the empty pane; an unknown id
// surfaces the thread's error state.
const inboxRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/inbox',
  validateSearch: z.object({ c: z.string().optional() }),
  component: InboxRoute,
});

// One shared placeholder backs every not-yet-built module.
const moduleRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/m/$module',
  component: ComingSoon,
});

// --- Auth routes (children of authRoute) ---

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: LoginRoute,
});

const signupRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/signup',
  component: SignupRoute,
});

// `email` is carried from the login/signup step. Validated loose (optional) so a
// stray hit doesn't throw a search error — beforeLoad redirects to /login when
// it's absent. `VerifyRoute` reads it back via `getRouteApi('/auth/verify')`.
const verifyRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/verify',
  validateSearch: z.object({ email: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.email) {
      throw redirect({ to: '/login' });
    }
  },
  component: VerifyRoute,
});

const forgotRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/forgot',
  component: ForgotRoute,
});

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([
    indexRoute,
    referenceRoute,
    scenesRoute,
    appearanceRoute,
    crmContactsRoute,
    crmContactDetailRoute,
    projectsIssuesRoute,
    projectsIssueDetailRoute,
    inboxRoute,
    moduleRoute,
  ]),
  authRoute.addChildren([loginRoute, signupRoute, verifyRoute, forgotRoute]),
]);

// `NotFound` renders under the thin root (outside both layouts), so it carries
// its own base tokens — see its file comment.
export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
