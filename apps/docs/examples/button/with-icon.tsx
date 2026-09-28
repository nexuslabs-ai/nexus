'use client';

import { IconArrowRight, IconRocket } from '@tabler/icons-react';

import { Button } from '@/components/button/button';

export default function ButtonWithIcon() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button startIcon={<IconRocket />}>Launch</Button>
      <Button variant="outline" endIcon={<IconArrowRight />}>
        Continue
      </Button>
    </div>
  );
}
