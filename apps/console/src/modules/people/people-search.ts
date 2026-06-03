import { z } from 'zod';

import {
  DEPARTMENTS,
  MEMBER_ROLES,
  MEMBER_STATUSES,
} from '../../lib/people-api';

/**
 * The People directory view contract: the zod schema that validates the
 * `/m/people` search params, and the single source for {@link PeopleView}. The
 * route and the toolbar both derive from this, so the URL shape can't drift.
 *
 * Three independent facets (role · department · status), each a multi-select.
 * `.default([])` keeps every param optional for `<Link to="/m/people">`; `.catch`
 * recovers a stale/invalid value instead of throwing a search error.
 */
export const peopleSearchSchema = z.object({
  role: z.array(z.enum(MEMBER_ROLES)).default([]).catch([]),
  department: z.array(z.enum(DEPARTMENTS)).default([]).catch([]),
  status: z.array(z.enum(MEMBER_STATUSES)).default([]).catch([]),
});

/** The shareable People view state — inferred from {@link peopleSearchSchema}. */
export type PeopleView = z.infer<typeof peopleSearchSchema>;
