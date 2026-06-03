import { Badge, type BadgeProps } from '@nexus/react';

import type { MemberRole, MemberStatus } from '../../lib/people-api';

const ROLE_META: Record<
  MemberRole,
  { label: string; variant: BadgeProps['variant'] }
> = {
  owner: { label: 'Owner', variant: 'default' },
  admin: { label: 'Admin', variant: 'information' },
  member: { label: 'Member', variant: 'secondary' },
  guest: { label: 'Guest', variant: 'outline' },
};

const STATUS_META: Record<
  MemberStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  active: { label: 'Active', variant: 'success' },
  invited: { label: 'Invited', variant: 'information' },
  suspended: { label: 'Suspended', variant: 'secondary' },
};

/** The role badge, shared by the directory table and the profile page. */
export function RoleBadge({ role }: { role: MemberRole }) {
  const { label, variant } = ROLE_META[role];
  return <Badge variant={variant}>{label}</Badge>;
}

/** The membership-status badge, shared by the directory table and the profile page. */
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { label, variant } = STATUS_META[status];
  return <Badge variant={variant}>{label}</Badge>;
}
