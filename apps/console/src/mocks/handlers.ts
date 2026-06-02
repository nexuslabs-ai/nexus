import { delay, http, HttpResponse, type RequestHandler } from 'msw';

import type { User } from '../lib/auth-api';

import { CONTACTS } from './crm-fixtures';

/** The fixed demo OTP — shown as a hint on the verify screen. */
const OTP_CODE = '123456';

/** Derive a stable demo user from an email — the mock has no real user table. */
function userFromEmail(email: string): User {
  const [localPart = ''] = email.split('@');
  const name = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return { id: email.toLowerCase(), name: name || 'Atlas User', email };
}

type LoginBody = { email?: string; password?: string };
type SignupBody = { name?: string; email?: string; password?: string };
type VerifyBody = { email?: string; code?: string };

/**
 * MSW request handlers — there is no real backend. Auth is a two-step flow: a
 * credentials check (login/signup) hands the email to the OTP step, which is
 * what actually authenticates and returns the user. CRM handlers follow.
 */
export const handlers: RequestHandler[] = [
  // Credentials check — no real validation (any email + an 8+ char password
  // passes); the OTP step below is the only actual auth gate. Proceeds to OTP.
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as LoginBody;
    if (!email || !password || password.length < 8) {
      return HttpResponse.json(
        { message: 'Incorrect email or password.' },
        { status: 401 }
      );
    }
    return HttpResponse.json({ email });
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const { name, email, password } = (await request.json()) as SignupBody;
    if (!name || !email || !password || password.length < 8) {
      return HttpResponse.json(
        { message: 'Please complete every field (password 8+ characters).' },
        { status: 400 }
      );
    }
    return HttpResponse.json({ email });
  }),

  // OTP step: the fixed demo code authenticates and returns the user.
  http.post('/api/auth/verify-otp', async ({ request }) => {
    const { email, code } = (await request.json()) as VerifyBody;
    if (!email || code !== OTP_CODE) {
      return HttpResponse.json(
        { message: 'That code is not valid. Try 123456.' },
        { status: 401 }
      );
    }
    return HttpResponse.json({ user: userFromEmail(email) });
  }),

  // Always acknowledge — never reveal whether an account exists for the email.
  http.post('/api/auth/forgot', async () => HttpResponse.json({ ok: true })),

  // --- CRM ---
  // Returns the full contact list; the DataTable sorts/filters/paginates
  // client-side. The short delay lets the loading Skeleton render in the demo.
  http.get('/api/crm/contacts', async () => {
    await delay(500);
    return HttpResponse.json({ contacts: CONTACTS });
  }),
];
