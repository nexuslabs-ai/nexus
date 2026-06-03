import { delay, http, HttpResponse, type RequestHandler } from 'msw';

import type { User } from '../lib/auth-api';
import type {
  BillingOverview,
  Invoice,
  PlanSelection,
} from '../lib/billing-api';
import type { ActivityItem, Contact, ContactInput } from '../lib/crm-api';
import type {
  Conversation,
  ConversationDetail,
  ConversationStatus,
} from '../lib/inbox-api';
import type { Member, MemberDetail, MemberInput } from '../lib/people-api';
import type { Issue, IssueInput } from '../lib/projects-api';

import { BILLING_OVERVIEW, INVOICES } from './billing-fixtures';
import { CONTACTS } from './crm-fixtures';
import { CONVERSATIONS } from './inbox-fixtures';
import { MEMBERS } from './people-fixtures';
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
let nextIssueSeq = 125; // one past the last fixture key (ATL-124)

// In-memory Inbox store (same session lifecycle). Holds the full thread; the
// list endpoint projects each to its lean preview shape, the detail endpoint
// returns the messages. The messages array is copied so replies don't mutate the
// shared fixture.
const conversationsStore: ConversationDetail[] = CONVERSATIONS.map((c) => ({
  ...c,
  messages: c.messages.map((m) => ({ ...m })),
}));

// In-memory Billing store (same session lifecycle). The subscription mutates
// (change plan / cancel / reactivate); usage, the card, and invoices are read-only.
const billing: BillingOverview = {
  subscription: { ...BILLING_OVERVIEW.subscription },
  usage: BILLING_OVERVIEW.usage.map((u) => ({ ...u })),
  paymentMethod: { ...BILLING_OVERVIEW.paymentMethod },
};
const invoicesStore: Invoice[] = INVOICES.map((i) => ({ ...i }));

// In-memory People store (same session lifecycle). Holds the full member record
// incl. `bio`; the list endpoint projects each to its lean table row, the detail
// endpoint returns the full record.
const membersStore: MemberDetail[] = MEMBERS.map((m) => ({ ...m }));

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
  // The issue list returns the `Issue` shape only — `description` is detail-only,
  // so it's projected away here. The DataTable sorts/filters/paginates client-side.
  http.get('/api/projects/issues', async () => {
    await delay(500);
    const issues: Issue[] = issuesStore.map(
      ({
        id,
        key,
        title,
        status,
        priority,
        assignee,
        createdAt,
        updatedAt,
      }) => ({
        id,
        key,
        title,
        status,
        priority,
        assignee,
        createdAt,
        updatedAt,
      })
    );
    return HttpResponse.json({ issues });
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

  // --- Inbox ---
  // The conversation list returns the lean `Conversation` shape: base fields plus
  // a `preview` + `lastMessageAt` derived from the most recent message. The
  // messages, customer email, and assignee are detail-only, so they're projected
  // away here. Sorted newest-first by that last-message time.
  http.get('/api/inbox/conversations', async () => {
    await delay(500);
    const conversations: Conversation[] = conversationsStore
      .map(({ id, customer, subject, status, unread, messages }) => {
        const last = messages[messages.length - 1];
        return {
          id,
          customer,
          subject,
          status,
          unread,
          preview: last?.body ?? '',
          lastMessageAt: last?.at ?? '',
        };
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    return HttpResponse.json({ conversations });
  }),

  // A single conversation incl. its full message thread (404 when unknown).
  http.get('/api/inbox/conversations/:id', async ({ params }) => {
    await delay(300);
    const conversation = conversationsStore.find((c) => c.id === params.id);
    if (!conversation) {
      return HttpResponse.json(
        { message: 'Conversation not found.' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ conversation });
  }),

  // Reply: append an agent message (signed by the assignee), clear the unread
  // flag, and return the updated thread.
  http.post(
    '/api/inbox/conversations/:id/reply',
    async ({ params, request }) => {
      await delay(300);
      const conversation = conversationsStore.find((c) => c.id === params.id);
      if (!conversation) {
        return HttpResponse.json(
          { message: 'Conversation not found.' },
          { status: 404 }
        );
      }
      const { body } = (await request.json()) as { body: string };
      conversation.messages.push({
        id: crypto.randomUUID(),
        author: 'agent',
        authorName: conversation.assignee,
        body,
        at: new Date().toISOString(),
      });
      conversation.unread = false;
      return HttpResponse.json({ conversation });
    }
  ),

  // Status change: set the lifecycle status in place, return the thread.
  http.patch(
    '/api/inbox/conversations/:id/status',
    async ({ params, request }) => {
      await delay(300);
      const conversation = conversationsStore.find((c) => c.id === params.id);
      if (!conversation) {
        return HttpResponse.json(
          { message: 'Conversation not found.' },
          { status: 404 }
        );
      }
      const { status } = (await request.json()) as {
        status: ConversationStatus;
      };
      conversation.status = status;
      return HttpResponse.json({ conversation });
    }
  ),

  // --- Billing ---
  // The overview: current subscription + usage meters + the card on file.
  http.get('/api/billing', async () => {
    await delay(500);
    return HttpResponse.json(billing);
  }),

  // Past invoices (the transactions table). Read-only; newest first.
  http.get('/api/billing/invoices', async () => {
    await delay(400);
    return HttpResponse.json({ invoices: invoicesStore });
  }),

  // Change tier and/or cycle — also clears a pending cancellation.
  http.patch('/api/billing/subscription', async ({ request }) => {
    await delay(300);
    const { tier, cycle } = (await request.json()) as PlanSelection;
    billing.subscription.tier = tier;
    billing.subscription.cycle = cycle;
    billing.subscription.status = 'active';
    return HttpResponse.json({ subscription: billing.subscription });
  }),

  // Cancel: wind down at period end — stays active until renewsAt.
  http.post('/api/billing/cancel', async () => {
    await delay(300);
    billing.subscription.status = 'canceling';
    return HttpResponse.json({ subscription: billing.subscription });
  }),

  // Reactivate: undo a pending cancellation.
  http.post('/api/billing/reactivate', async () => {
    await delay(300);
    billing.subscription.status = 'active';
    return HttpResponse.json({ subscription: billing.subscription });
  }),

  // --- People (team directory) ---

  // The directory list — each member projected to its lean table row (no `bio`).
  http.get('/api/people/members', async () => {
    await delay(500);
    const members: Member[] = membersStore.map(
      ({ id, name, email, title, role, department, status, joinedAt }) => ({
        id,
        name,
        email,
        title,
        role,
        department,
        status,
        joinedAt,
      })
    );
    return HttpResponse.json({ members });
  }),

  // A single member incl. profile-only fields (404 when unknown).
  http.get('/api/people/members/:id', async ({ params }) => {
    await delay(300);
    const member = membersStore.find((m) => m.id === params.id);
    if (!member) {
      return HttpResponse.json(
        { message: 'Member not found.' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ member });
  }),

  // Invite: a new member is always `invited` (server-authoritative) and joins
  // today — the create form never sets status.
  http.post('/api/people/members', async ({ request }) => {
    await delay(300);
    const input = (await request.json()) as MemberInput;
    const member: MemberDetail = {
      ...input,
      id: crypto.randomUUID(),
      status: 'invited',
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    membersStore.unshift(member);
    return HttpResponse.json({ member }, { status: 201 });
  }),

  // Edit: apply the editable fields (incl. status — suspend / reactivate live here).
  http.patch('/api/people/members/:id', async ({ params, request }) => {
    await delay(300);
    const member = membersStore.find((m) => m.id === params.id);
    if (!member) {
      return HttpResponse.json(
        { message: 'Member not found.' },
        { status: 404 }
      );
    }
    Object.assign(member, (await request.json()) as MemberInput);
    return HttpResponse.json({ member });
  }),
];
