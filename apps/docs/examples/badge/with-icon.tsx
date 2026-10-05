'use client';

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconTrendingUp,
} from '@tabler/icons-react';

import { Badge } from '@/components/badge/badge';

export default function BadgeWithIcon() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Badge variant="success" fill="light" leftIcon={<IconCircleCheck />}>
        Verified
      </Badge>
      <Badge variant="warning" fill="light" leftIcon={<IconAlertTriangle />}>
        Pending
      </Badge>
      <Badge variant="information" rightIcon={<IconTrendingUp />}>
        Trending
      </Badge>
    </div>
  );
}
