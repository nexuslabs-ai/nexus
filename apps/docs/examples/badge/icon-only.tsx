'use client';

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';

import { Badge } from '@/components/badge/badge';

export default function BadgeIconOnly() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Badge
        variant="success"
        leftIcon={<IconCircleCheck />}
        aria-label="Verified"
        title="Verified"
      />
      <Badge
        variant="warning"
        leftIcon={<IconAlertTriangle />}
        aria-label="Pending review"
        title="Pending review"
      />
      <Badge
        variant="error"
        leftIcon={<IconCircleX />}
        aria-label="Failed"
        title="Failed"
      />
    </div>
  );
}
