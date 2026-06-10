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

const ROLE_BADGE_PROPS: Record<
  MemberRole,
  Pick<BadgeProps, 'variant' | 'fill'>
> = {
  owner: { variant: 'default' },
  admin: { variant: 'information' },
  member: { variant: 'secondary' },
  guest: { variant: 'secondary', fill: 'outline' },
};

const STATUS_VARIANTS: Record<MemberStatus, BadgeProps['variant']> = {
  active: 'success',
  invited: 'information',
  suspended: 'secondary',
};

/** The role badge, shared by the directory table and the profile page. */
export function RoleBadge({ role }: { role: MemberRole }) {
  return <Badge {...ROLE_BADGE_PROPS[role]}>{ROLE_LABELS[role]}</Badge>;
}

/** The membership-status badge, shared by the directory table and the profile page. */
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

/** Role options for the facet filter and the form select. */
export const ROLE_OPTIONS = MEMBER_ROLES.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

/** Status options for the facet filter and the form select. */
export const STATUS_OPTIONS = MEMBER_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

/** Department options — departments are their own labels. */
export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((value) => ({
  value,
  label: value,
}));
