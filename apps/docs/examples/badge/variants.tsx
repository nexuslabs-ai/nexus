'use client';

import { Badge } from '@/components/badge/badge';

export default function BadgeVariants() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="information">Information</Badge>
    </div>
  );
}
