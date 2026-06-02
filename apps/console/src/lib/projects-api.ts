/**
 * Projects API client. Thin typed wrappers over the mock endpoints served by MSW
 * (`src/mocks/handlers.ts`) — there is no real backend. Mirrors the CRM module's
 * shape: a single query-key object, fetch/mutate fns, and `as const` enums that
 * single-source both the union type and the form's `z.enum`.
 */

/**
 * Issue lifecycle statuses — the single source for the {@link IssueStatus} union
 * and the create/edit form's status enum (both derive from this `as const`).
 */
export const ISSUE_STATUSES = [
  'backlog',
  'todo',
  'in_progress',
  'done',
  'canceled',
] as const;

/** Where an issue sits in its lifecycle — rendered as a status badge. */
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

/** Priority levels — single source for {@link IssuePriority} + the form enum. */
export const ISSUE_PRIORITIES = [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
] as const;

/** How urgent an issue is — rendered as a priority badge. */
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export type Issue = {
  id: string;
  /** Human-readable identifier shown in the UI, e.g. `ATL-204`. */
  key: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  /** Team member the issue is assigned to — rendered as an avatar + name. */
  assignee: string;
  /** ISO date (YYYY-MM-DD) the issue was created. */
  createdAt: string;
  /** ISO date (YYYY-MM-DD) of the last update. */
  updatedAt: string;
};

/**
 * TanStack Query keys for the Projects module — declared once so the table,
 * detail, and mutations can't drift apart (a mismatched key silently breaks
 * cache invalidation).
 */
export const projectKeys = {
  all: ['projects'] as const,
  issues: ['projects', 'issues'] as const,
  issue: (id: string) => ['projects', 'issue', id] as const,
};

// Returns the server envelope (mirrors the wire shape) so a future server-side
// `{ issues, totalCount }` for paging is an additive change here.
export async function fetchIssues(): Promise<{ issues: Issue[] }> {
  const res = await fetch('/api/projects/issues');
  if (!res.ok) {
    throw new Error('Failed to load issues. Please try again.');
  }
  return (await res.json()) as { issues: Issue[] };
}

/** An issue plus its long-form description — the record-detail payload. */
export type IssueDetail = Issue & { description: string };

export async function fetchIssue(id: string): Promise<{ issue: IssueDetail }> {
  const res = await fetch(`/api/projects/issues/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load issue.');
  }
  return (await res.json()) as { issue: IssueDetail };
}

/** The editable fields of an issue — `id`, `key`, and dates are server-set. */
export type IssueInput = {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
};

async function save(
  url: string,
  method: 'POST' | 'PATCH',
  input: IssueInput
): Promise<{ issue: Issue }> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error('Failed to save issue. Please try again.');
  }
  return (await res.json()) as { issue: Issue };
}

export const createIssue = (input: IssueInput) =>
  save('/api/projects/issues', 'POST', input);

export const updateIssue = (id: string, input: IssueInput) =>
  save(`/api/projects/issues/${id}`, 'PATCH', input);
