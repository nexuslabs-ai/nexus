/**
 * People (team directory) API client. Thin typed wrappers over the mock
 * endpoints served by MSW (`src/mocks/handlers.ts`) — there is no real backend.
 * Mirrors the CRM record-loop shape: `as const` enums, a single query-key
 * object, and fetch/save fns.
 *
 * List/detail split (the CRM/Inbox discipline): the table fetches the lean
 * {@link Member}; the profile page fetches {@link MemberDetail}, which adds the
 * long-form `bio` that has no place in a table row.
 */

/** Workspace roles — single source for {@link MemberRole}, the facet, and the form. */
export const MEMBER_ROLES = ['owner', 'admin', 'member', 'guest'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Departments — used as both the value and the label (no mapping needed). */
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Sales',
  'Marketing',
  'Support',
  'Operations',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Membership lifecycle — `invited` is pending acceptance, `suspended` is access-revoked. */
export const MEMBER_STATUSES = ['active', 'invited', 'suspended'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** A directory row — what the People table renders. */
export type Member = {
  id: string;
  name: string;
  email: string;
  /** Job title, e.g. "Staff Engineer". */
  title: string;
  role: MemberRole;
  department: Department;
  status: MemberStatus;
  /** ISO date (YYYY-MM-DD) the member joined (or was invited). */
  joinedAt: string;
};

/** A member plus profile-only fields — the record-detail payload. */
export type MemberDetail = Member & {
  /** Long-form blurb — profile-page only, never in the table. */
  bio: string;
};

/**
 * TanStack Query keys for the People module — declared once so the table,
 * detail, and mutations can't drift apart.
 */
export const peopleKeys = {
  all: ['people'] as const,
  members: ['people', 'members'] as const,
  member: (id: string) => ['people', 'member', id] as const,
};

export async function fetchMembers(): Promise<{ members: Member[] }> {
  const res = await fetch('/api/people/members');
  if (!res.ok) {
    throw new Error('Failed to load members. Please try again.');
  }
  return (await res.json()) as { members: Member[] };
}

export async function fetchMember(
  id: string
): Promise<{ member: MemberDetail }> {
  const res = await fetch(`/api/people/members/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load member.');
  }
  return (await res.json()) as { member: MemberDetail };
}

/**
 * The editable fields of a member. `id` and `joinedAt` are server-set; `status`
 * is server-authoritative on create (a new member is always `invited`) and only
 * editable when updating — so the create form omits it.
 */
export type MemberInput = Omit<Member, 'id' | 'joinedAt'> & { bio: string };

async function save(
  url: string,
  method: 'POST' | 'PATCH',
  input: MemberInput
): Promise<{ member: MemberDetail }> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error('Failed to save member. Please try again.');
  }
  return (await res.json()) as { member: MemberDetail };
}

export const inviteMember = (input: MemberInput) =>
  save('/api/people/members', 'POST', input);

export const updateMember = (id: string, input: MemberInput) =>
  save(`/api/people/members/${id}`, 'PATCH', input);
