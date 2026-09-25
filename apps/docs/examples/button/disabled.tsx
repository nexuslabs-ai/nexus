'use client';

import { Button } from '@/components/button/button';

export default function ButtonDisabled() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button variant="default" disabled>
        Default
      </Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="error" disabled>
        Error
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="dashed" disabled>
        Dashed
      </Button>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <Button variant="link" disabled>
        Link
      </Button>
    </div>
  );
}
