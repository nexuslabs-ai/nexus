import { z } from 'zod';

import { CONTACT_STATUSES } from '../../lib/crm-api';

/**
 * The Contacts list view contract: the zod schema that validates the `/m/crm`
 * search params, and the single source for {@link ContactsView}. The route, the
 * toolbar, and the saved-views store all derive from this — so the URL shape and
 * the persisted shape can't drift.
 *
 * `.default` keeps each param optional for `<Link to="/m/crm">` (callers needn't
 * pass `search`); `.catch` recovers a stale/invalid value (e.g. `?view=foo`)
 * instead of throwing a search error.
 */
export const contactsSearchSchema = z.object({
  view: z.enum(['table', 'board']).default('table').catch('table'),
  status: z.array(z.enum(CONTACT_STATUSES)).default([]).catch([]),
});

/** The shareable Contacts view state — inferred from {@link contactsSearchSchema}. */
export type ContactsView = z.infer<typeof contactsSearchSchema>;
