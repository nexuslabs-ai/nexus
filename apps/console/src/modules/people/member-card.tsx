import { Link } from '@tanstack/react-router';

import { RecordCard } from '../../components/record-card';
import { formatDate } from '../../lib/format';
import { type Member, ROLE_LABELS } from '../../lib/people-api';

import { MemberStatusBadge } from './people-ui';

/** Mobile card for one member — the `<lg` stand-in for a People table row. */
export function MemberCard({ member }: { member: Member }) {
  return (
    <RecordCard
      title={
        <Link
          to="/m/people/$id"
          params={{ id: member.id }}
          className="nx:text-foreground nx:font-medium nx:hover:underline"
        >
          {member.name}
        </Link>
      }
      badge={<MemberStatusBadge status={member.status} />}
    >
      <p className="nx:truncate">
        {member.title} · {member.department}
      </p>
      <p>
        {ROLE_LABELS[member.role]} · Joined {formatDate(member.joinedAt)}
      </p>
    </RecordCard>
  );
}
