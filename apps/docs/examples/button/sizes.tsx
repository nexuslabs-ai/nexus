'use client';

import { IconStar } from '@tabler/icons-react';

import { Button } from '@/components/button/button';

export default function ButtonSizes() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-sm" aria-label="Favorite (small)">
        <IconStar />
      </Button>
      <Button size="icon" aria-label="Favorite">
        <IconStar />
      </Button>
      <Button size="icon-lg" aria-label="Favorite (large)">
        <IconStar />
      </Button>
    </div>
  );
}
