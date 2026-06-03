import { Badge, type BadgeProps } from '@nexus/react';

import {
  DEPARTMENTS,
  MEMBER_ROLES,
  MEMBER_STATUSES,
  type MemberRole,
  type MemberStatus,
  ROLE_LABELS,
  STATUS_LABELS,
} from '../../lib/people-api';

const ROLE_VARIANTS: Record<MemberRole, BadgeProps['variant']> = {
  owner: 'default',
  admin: 'information',
  member: 'secondary',
  guest: 'outline',
};

const STATUS_VARIANTS: Record<MemberStatus, BadgeProps['variant']> = {
  active: 'success',
  invited: 'information',
  suspended: 'secondary',
};

/** The role badge, shared by the directory table and the profile page. */
export function RoleBadge({ role }: { role: MemberRole }) {
  return <Badge variant={ROLE_VARIANTS[role]}>{ROLE_LABELS[role]}</Badge>;
}

/** The membership-status badge, shared by the directory table and the profile page. */
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

// Option lists for the facet filters and the form selects — derived from the
// label maps so each label lives in one place ({@link ROLE_LABELS} etc).
// Departments are their own labels.
export const ROLE_OPTIONS = MEMBER_ROLES.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

export const STATUS_OPTIONS = MEMBER_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((value) => ({
  value,
  label: value,
}));
