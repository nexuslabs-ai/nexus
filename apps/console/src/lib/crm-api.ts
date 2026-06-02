/**
 * CRM API client. Thin typed wrappers over the mock endpoints served by MSW
 * (`src/mocks/handlers.ts`) — there is no real backend. The Contacts table
 * fetches through these via TanStack Query.
 */

/** Lifecycle status of a contact — rendered as a status badge. */
export type ContactStatus = 'active' | 'lead' | 'churned';

export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: ContactStatus;
  /** Sales rep who owns the relationship — rendered as an avatar + name. */
  owner: string;
  /** Open opportunity value in USD. */
  value: number;
  /** ISO date (YYYY-MM-DD) of the last touchpoint. */
  lastContacted: string;
};

// Returns the server envelope (mirrors the wire shape, like the auth-api
// wrappers) so a future server-side `{ contacts, totalCount }` for paging is an
// additive change here, not a new return type.
export async function fetchContacts(): Promise<{ contacts: Contact[] }> {
  const res = await fetch('/api/crm/contacts');
  if (!res.ok) {
    throw new Error('Failed to load contacts. Please try again.');
  }
  return (await res.json()) as { contacts: Contact[] };
}

export type ActivityKind = 'created' | 'email' | 'status' | 'note';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  summary: string;
};

/** A contact plus its activity timeline — the record-detail payload. */
export type ContactDetail = Contact & { activity: ActivityItem[] };

export async function fetchContact(
  id: string
): Promise<{ contact: ContactDetail }> {
  const res = await fetch(`/api/crm/contacts/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load contact.');
  }
  return (await res.json()) as { contact: ContactDetail };
}

/** The editable fields of a contact — `id` and `lastContacted` are server-set. */
export type ContactInput = Omit<Contact, 'id' | 'lastContacted'>;

async function save(
  url: string,
  method: 'POST' | 'PATCH',
  input: ContactInput
): Promise<{ contact: Contact }> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error('Failed to save contact. Please try again.');
  }
  return (await res.json()) as { contact: Contact };
}

export const createContact = (input: ContactInput) =>
  save('/api/crm/contacts', 'POST', input);

export const updateContact = (id: string, input: ContactInput) =>
  save(`/api/crm/contacts/${id}`, 'PATCH', input);
