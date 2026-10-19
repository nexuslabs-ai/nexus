import type { ReactNode } from 'react';

import { cn } from '@nexus_ds/react/utils';

function Stage({
  title,
  detail,
  emphasis,
}: {
  title: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <p
      className={cn(
        'nx:m-0 nx:flex-1 nx:rounded-md nx:border nx:p-3 nx:typography-label-small nx:text-muted-foreground',
        emphasis
          ? 'nx:border-primary-border nx:bg-primary-subtle'
          : 'nx:border-border-default nx:bg-container'
      )}
    >
      <strong className="nx:block nx:mb-1 nx:typography-label-default nx:font-semibold nx:text-foreground">
        {title}.
      </strong>{' '}
      {detail}
    </p>
  );
}

/** One step of the pipeline. Every step after the first gets an arrow above it. */
function Step({ first, children }: { first?: boolean; children: ReactNode }) {
  return (
    <li className="nx:flex nx:flex-col nx:gap-2">
      {!first && (
        <span
          aria-hidden="true"
          className="nx:text-center nx:text-muted-foreground nx:typography-label-default"
        >
          ↓
        </span>
      )}
      <div className="nx:flex nx:flex-col nx:gap-2 nx:@md:flex-row">
        {children}
      </div>
    </li>
  );
}

/** Foundations → Tokens: the path from token sources to rendered components. */
export function EnginePipeline() {
  return (
    <ol className="nx:@container nx:list-none nx:m-0 nx:p-0 nx:flex nx:flex-col nx:gap-2 nx:my-6 nx:max-w-3xl">
      <Step first>
        <Stage
          title="Token sources"
          detail="DTCG JSON for color, spacing, radius, shadow, border and motion."
        />
        <Stage
          title="Appearance state"
          detail="Brand color, surface tone, mode, density and the other fields."
        />
      </Step>
      <Step>
        <Stage
          emphasis
          title="deriveTheme() in @nexus_ds/core"
          detail="Builds the color palettes, picks each surface shade and checks contrast. No DOM, no framework."
        />
      </Step>
      <Step>
        <Stage
          title="Build time"
          detail="Default colors and every spacing, radius, shadow and border option written into nexus.css."
        />
        <Stage
          title="Runtime"
          detail="Color variables and data attributes the provider writes when the appearance changes."
        />
      </Step>
      <Step>
        <Stage
          title="nx: utilities"
          detail="One set of classes that reads whichever value is present."
        />
      </Step>
      <Step>
        <Stage
          title="React components"
          detail="Copy-and-own source built on the utilities."
        />
      </Step>
    </ol>
  );
}
