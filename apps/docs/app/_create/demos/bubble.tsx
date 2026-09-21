'use client';
import type * as React from 'react';

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  type BubbleProps,
} from '@nexus_ds/react';
const column = 'nx:w-full nx:max-w-md';
const VARIANTS: NonNullable<BubbleProps['variant']>[] = [
  'muted',
  'primary',
  'outline',
  'ghost',
  'destructive',
];
function Example0() {
  return (
    <div className={column}>
      <Bubble>
        <BubbleContent>How do I rotate the signing key?</BubbleContent>
      </Bubble>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className={column}>
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            {variant}
          </p>
          <BubbleGroup>
            <Bubble variant={variant} align="start">
              <BubbleContent>Aligned to the inline start.</BubbleContent>
            </Bubble>
            <Bubble variant={variant} align="end">
              <BubbleContent>Aligned to the inline end.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </div>
      ))}
    </div>
  );
}
function Example2() {
  return (
    <div className={column}>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" disabled>
            Retry sending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" aria-disabled="true">
            Resending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent asChild>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- the hrefless anchor is the case under test: an unnavigable body must not read as actionable */}
          <a>Thread unavailable</a>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
