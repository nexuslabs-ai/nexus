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

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch('/api/crm/contacts');
  if (!res.ok) {
    throw new Error('Failed to load contacts. Please try again.');
  }
  const data = (await res.json()) as { contacts: Contact[] };
  return data.contacts;
}
