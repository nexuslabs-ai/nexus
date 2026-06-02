import type { ConversationDetail } from '../lib/inbox-api';

/**
 * Deterministic seed conversations for the Inbox module. Stored shape is the
 * full {@link ConversationDetail} (thread + messages); the list endpoint derives
 * each row's `preview` and `lastMessageAt` from the most recent message, so those
 * list-only fields aren't stored here. 8 threads span every status, both unread
 * states, and message counts from 1–3 so the list, badges, and thread all have
 * variety. Assignees reuse the CRM / Projects team for a consistent workspace;
 * customers are external. Dated into the recent past (newest ~Jun 1, matching the
 * CRM / Projects ceiling) so a reply sent now bumps its thread to the top.
 */
export const CONVERSATIONS: ConversationDetail[] = [
  {
    id: 'c-01',
    customer: 'Maya Okafor',
    customerEmail: 'maya.okafor@brightleaf.io',
    subject: "Can't export workspace as PDF",
    status: 'open',
    assignee: 'Ada Lovelace',
    unread: true,
    messages: [
      {
        id: 'c-01-m1',
        author: 'customer',
        authorName: 'Maya Okafor',
        body: "Hi — when I try to export my workspace to PDF the download just spins and never finishes. I'm on Chrome. Any ideas?",
        at: '2026-06-01T08:50:00Z',
      },
      {
        id: 'c-01-m2',
        author: 'agent',
        authorName: 'Ada Lovelace',
        body: 'Thanks for flagging, Maya. Roughly how many pages is the workspace? Very large exports can time out on the first attempt.',
        at: '2026-06-01T09:05:00Z',
      },
      {
        id: 'c-01-m3',
        author: 'customer',
        authorName: 'Maya Okafor',
        body: "It's about 120 pages with a lot of images. Smaller workspaces export fine.",
        at: '2026-06-01T09:15:00Z',
      },
    ],
  },
  {
    id: 'c-02',
    customer: 'Diego Ramirez',
    customerEmail: 'diego@nimbusapp.dev',
    subject: "Double charge on this month's invoice",
    status: 'open',
    assignee: 'Grace Hopper',
    unread: true,
    messages: [
      {
        id: 'c-02-m1',
        author: 'customer',
        authorName: 'Diego Ramirez',
        body: 'I was billed twice for the Pro plan this month — two identical charges on the 1st. Can you refund the duplicate?',
        at: '2026-06-01T08:40:00Z',
      },
    ],
  },
  {
    id: 'c-03',
    customer: 'Priya Nair',
    customerEmail: 'priya.nair@kestrel.co',
    subject: 'Feature request: dark mode for notification emails',
    status: 'pending',
    assignee: 'Alan Turing',
    unread: false,
    messages: [
      {
        id: 'c-03-m1',
        author: 'customer',
        authorName: 'Priya Nair',
        body: "Love the app's dark mode — any chance the notification emails could respect it too? They're blinding at night.",
        at: '2026-05-31T15:40:00Z',
      },
      {
        id: 'c-03-m2',
        author: 'agent',
        authorName: 'Alan Turing',
        body: "Great suggestion, Priya. I've passed it to the product team and linked your request to the tracking issue. I'll keep this pending while it's considered.",
        at: '2026-05-31T16:20:00Z',
      },
    ],
  },
  {
    id: 'c-04',
    customer: 'Tom Becker',
    customerEmail: 'tom.becker@harborline.com',
    subject: 'SSO login redirect loop',
    status: 'open',
    assignee: 'Katherine Johnson',
    unread: true,
    messages: [
      {
        id: 'c-04-m1',
        author: 'customer',
        authorName: 'Tom Becker',
        body: 'Since this morning, SSO sign-in bounces me back to the login page in a loop. Other team members see it too.',
        at: '2026-05-31T09:30:00Z',
      },
      {
        id: 'c-04-m2',
        author: 'agent',
        authorName: 'Katherine Johnson',
        body: 'Sorry about that, Tom. Did anything change on your identity provider recently — a new certificate or metadata update? That usually causes a redirect loop.',
        at: '2026-05-31T10:15:00Z',
      },
      {
        id: 'c-04-m3',
        author: 'customer',
        authorName: 'Tom Becker',
        body: 'Our IT team did rotate the SAML certificate yesterday. That might be it.',
        at: '2026-05-31T11:05:00Z',
      },
    ],
  },
  {
    id: 'c-05',
    customer: 'Sofia Rossi',
    customerEmail: 'sofia.rossi@lumenworks.io',
    subject: 'How do I invite teammates?',
    status: 'closed',
    assignee: 'Ada Lovelace',
    unread: false,
    messages: [
      {
        id: 'c-05-m1',
        author: 'customer',
        authorName: 'Sofia Rossi',
        body: "Quick one — where do I add teammates to my workspace? I can't find the option.",
        at: '2026-05-30T14:50:00Z',
      },
      {
        id: 'c-05-m2',
        author: 'agent',
        authorName: 'Ada Lovelace',
        body: "Happy to help! Open Settings → Members, then 'Invite people' in the top right. Paste their emails and pick a role — let me know if it doesn't show up.",
        at: '2026-05-30T15:30:00Z',
      },
    ],
  },
  {
    id: 'c-06',
    customer: 'Liam Walsh',
    customerEmail: 'liam@walshlabs.dev',
    subject: 'Webhook deliveries stopped at 2am',
    status: 'open',
    assignee: 'Grace Hopper',
    unread: true,
    messages: [
      {
        id: 'c-06-m1',
        author: 'customer',
        authorName: 'Liam Walsh',
        body: 'All our webhook deliveries stopped around 2am UTC. The endpoint is up and returns 200 to manual tests.',
        at: '2026-05-30T08:20:00Z',
      },
      {
        id: 'c-06-m2',
        author: 'agent',
        authorName: 'Grace Hopper',
        body: 'Thanks Liam — I can see retries queuing on our side. Are you seeing any signature-verification failures, or no requests at all?',
        at: '2026-05-30T09:10:00Z',
      },
      {
        id: 'c-06-m3',
        author: 'customer',
        authorName: 'Liam Walsh',
        body: 'No requests at all — the endpoint logs are completely silent since 02:03.',
        at: '2026-05-30T10:12:00Z',
      },
    ],
  },
  {
    id: 'c-07',
    customer: 'Nina Petrova',
    customerEmail: 'nina.petrova@solstice.team',
    subject: 'Refund for annual plan',
    status: 'pending',
    assignee: 'Alan Turing',
    unread: false,
    messages: [
      {
        id: 'c-07-m1',
        author: 'customer',
        authorName: 'Nina Petrova',
        body: 'I upgraded to the annual plan by mistake last week — I meant to stay monthly. Could I get this refunded?',
        at: '2026-05-28T13:40:00Z',
      },
      {
        id: 'c-07-m2',
        author: 'agent',
        authorName: 'Alan Turing',
        body: "Of course, Nina. You're within the 14-day window, so a full refund is fine. I've started it and I'm holding this pending until finance confirms — usually 3–5 business days.",
        at: '2026-05-28T14:45:00Z',
      },
    ],
  },
  {
    id: 'c-08',
    customer: 'Omar Haddad',
    customerEmail: 'omar.haddad@vantatech.io',
    subject: 'API rate limit — need a higher tier',
    status: 'closed',
    assignee: 'Katherine Johnson',
    unread: false,
    messages: [
      {
        id: 'c-08-m1',
        author: 'customer',
        authorName: 'Omar Haddad',
        body: "We're hitting the 1,000 req/min API limit during peak hours. What are the options for a higher tier?",
        at: '2026-05-27T11:30:00Z',
      },
      {
        id: 'c-08-m2',
        author: 'agent',
        authorName: 'Katherine Johnson',
        body: "Thanks Omar. The Scale plan lifts you to 10,000 req/min and adds burst headroom. I've emailed the details and a comparison — shout if you'd like a call to walk through it.",
        at: '2026-05-27T13:00:00Z',
      },
    ],
  },
];
