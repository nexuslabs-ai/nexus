import { delay, http, HttpResponse, type RequestHandler } from 'msw';

import type { User } from '../lib/auth-api';
import type { ActivityItem, Contact, ContactInput } from '../lib/crm-api';
import type { Issue, IssueInput } from '../lib/projects-api';

import { CONTACTS } from './crm-fixtures';
import { ISSUES } from './projects-fixtures';

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

/** Shift an ISO date (YYYY-MM-DD) back by `days`, returning the same format. */
function isoMinusDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * A deterministic activity timeline synthesised from the contact's own fields
 * (no stored events) — newest first, dated by offsets from the last touchpoint.
 */
function buildActivity(contact: Contact): ActivityItem[] {
  const { id, name, owner, status, lastContacted } = contact;
  return [
    {
      id: `${id}-a1`,
      kind: 'email',
      date: lastContacted,
      summary: `Logged an email with ${name}`,
    },
    {
      id: `${id}-a2`,
      kind: 'note',
      date: isoMinusDays(lastContacted, 9),
      summary: `${owner} added a note`,
    },
    {
      id: `${id}-a3`,
      kind: 'status',
      date: isoMinusDays(lastContacted, 34),
      summary: `Status set to ${status}`,
    },
    {
      id: `${id}-a4`,
      kind: 'created',
      date: isoMinusDays(lastContacted, 96),
      summary: `Created and assigned to ${owner}`,
    },
  ];
}

// In-memory CRM store, seeded from the fixtures. Create/edit mutate it so new
// and edited contacts persist across requests within a session (it resets on a
// full page reload — there is no real backend).
const store: Contact[] = CONTACTS.map((c) => ({ ...c }));

// In-memory Projects store (same session lifecycle as the CRM store). Records
// carry the long-form `description` the detail endpoint returns. New issues draw
// a fresh `ATL-` key from a running sequence seeded just past the fixtures.
type StoredIssue = Issue & { description: string };
const issuesStore: StoredIssue[] = ISSUES.map((i) => ({ ...i }));
let nextIssueSeq = 125;

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
    return HttpResponse.json({ contacts: store });
  }),

  // A single contact + its synthesised activity timeline (404 when unknown).
  http.get('/api/crm/contacts/:id', async ({ params }) => {
    await delay(300);
    const contact = store.find((c) => c.id === params.id);
    if (!contact) {
      return HttpResponse.json(
        { message: 'Contact not found.' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      contact: { ...contact, activity: buildActivity(contact) },
    });
  }),

  // Create: the server assigns the id and the last-contacted date (today).
  http.post('/api/crm/contacts', async ({ request }) => {
    await delay(300);
    const input = (await request.json()) as ContactInput;
    const contact: Contact = {
      ...input,
      id: crypto.randomUUID(),
      lastContacted: new Date().toISOString().slice(0, 10),
    };
    store.unshift(contact);
    return HttpResponse.json({ contact }, { status: 201 });
  }),

  // Edit: patch the mutable fields in place; id + lastContacted are preserved.
  http.patch('/api/crm/contacts/:id', async ({ params, request }) => {
    await delay(300);
    const contact = store.find((c) => c.id === params.id);
    if (!contact) {
      return HttpResponse.json(
        { message: 'Contact not found.' },
        { status: 404 }
      );
    }
    Object.assign(contact, (await request.json()) as ContactInput);
    return HttpResponse.json({ contact });
  }),

  // --- Projects ---
  // The full issue list; the DataTable sorts/filters/paginates client-side.
  http.get('/api/projects/issues', async () => {
    await delay(500);
    return HttpResponse.json({ issues: issuesStore });
  }),

  // A single issue incl. its long-form description (404 when unknown).
  http.get('/api/projects/issues/:id', async ({ params }) => {
    await delay(300);
    const issue = issuesStore.find((i) => i.id === params.id);
    if (!issue) {
      return HttpResponse.json(
        { message: 'Issue not found.' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ issue });
  }),

  // Create: the server assigns the id, the ATL- key, and the timestamps.
  http.post('/api/projects/issues', async ({ request }) => {
    await delay(300);
    const input = (await request.json()) as IssueInput;
    const today = new Date().toISOString().slice(0, 10);
    const issue: StoredIssue = {
      ...input,
      id: crypto.randomUUID(),
      key: `ATL-${nextIssueSeq++}`,
      createdAt: today,
      updatedAt: today,
    };
    issuesStore.unshift(issue);
    return HttpResponse.json({ issue }, { status: 201 });
  }),

  // Edit: patch the mutable fields in place + bump updatedAt; id/key/createdAt
  // are preserved.
  http.patch('/api/projects/issues/:id', async ({ params, request }) => {
    await delay(300);
    const issue = issuesStore.find((i) => i.id === params.id);
    if (!issue) {
      return HttpResponse.json(
        { message: 'Issue not found.' },
        { status: 404 }
      );
    }
    Object.assign(issue, (await request.json()) as IssueInput);
    issue.updatedAt = new Date().toISOString().slice(0, 10);
    return HttpResponse.json({ issue });
  }),
];
