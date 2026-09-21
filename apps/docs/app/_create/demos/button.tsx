'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import { IconArrowRight, IconRocket, IconStar } from '@tabler/icons-react';

function Example0() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="error">Error</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="dashed">Dashed</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Sizes
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon-sm" aria-label="Small icon">
            <IconStar />
          </Button>
          <Button size="icon" aria-label="Icon">
            <IconStar />
          </Button>
          <Button size="icon-lg" aria-label="Large icon">
            <IconStar />
          </Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Icon slots
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button startIcon={<IconRocket />}>Start icon</Button>
          <Button endIcon={<IconArrowRight />}>End icon</Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Disabled
        </h3>
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
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Loading
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="default" loading>
            Default
          </Button>
          <Button variant="secondary" loading>
            Secondary
          </Button>
          <Button variant="error" loading>
            Error
          </Button>
          <Button variant="destructive" loading>
            Destructive
          </Button>
          <Button variant="outline" loading>
            Outline
          </Button>
          <Button variant="dashed" loading>
            Dashed
          </Button>
        </div>
      </div>
    </div>
  );
}
function Example1() {
  const args: React.ComponentProps<typeof Button> = {
    disabled: true,
    children: 'Disabled',
  };
  return <Button {...args} />;
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example1 />
      </section>
    </div>
  );
}
