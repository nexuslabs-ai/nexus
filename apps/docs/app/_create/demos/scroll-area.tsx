'use client';
import type * as React from 'react';

import { ScrollArea, ScrollBar } from '@nexus_ds/react';
const releaseNotes = [
  'Scroll areas render a consistent custom scrollbar across Chrome, Safari, and Firefox, replacing the platform scrollbar so the chrome looks the same everywhere.',
  'The viewport measures its content and only surfaces a scrollbar on the axis that actually overflows — a wide-but-short block gets a horizontal bar and no vertical one.',
  'Scrollbars fade in on hover by default. Pass type="always" to keep them pinned, or type="scroll" to show them only while the content is moving.',
  'The thumb is sized in proportion to the visible fraction of the content, so a long document gets a short thumb and a barely-overflowing one gets a long thumb.',
  'Keyboard focus can move into the viewport with a visible focus ring, so the scrollable region stays reachable without a pointer.',
];
const versions = Array.from(
  { length: 40 },
  (_, i) => `v1.4.0-canary.${40 - i}`
);
const artworks = [
  { title: 'Aurora', artist: 'Ornella Binni' },
  { title: 'Tide', artist: 'Tom Byrom' },
  { title: 'Drift', artist: 'Vladimir Malyavko' },
  { title: 'Ember', artist: 'Mara Stein' },
  { title: 'Quartz', artist: 'Liang Wu' },
  { title: 'Meadow', artist: 'Sofia Russo' },
];
function Example0() {
  return (
    <ScrollArea className="nx:h-48 nx:w-72 nx:rounded-md nx:border-default nx:border-border-default">
      <div className="nx:flex nx:flex-col nx:gap-3 nx:p-4 nx:typography-label-default nx:text-foreground">
        <h4 className="nx:font-medium nx:leading-none">Release notes</h4>
        {releaseNotes.map((note, i) => (
          <p key={i} className="nx:text-muted-foreground">
            {note}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-6 nx:typography-label-default nx:text-foreground">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Vertical</span>
        <ScrollArea className="nx:h-40 nx:w-48 nx:rounded-md nx:border-default nx:border-border-default">
          <ul className="nx:flex nx:flex-col nx:p-3">
            {versions.slice(0, 20).map((version) => (
              <li
                key={version}
                className="nx:border-b-default nx:border-border-default nx:py-1.5 nx:last:border-b-0"
              >
                {version}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Horizontal</span>
        <ScrollArea className="nx:w-64 nx:rounded-md nx:border-default nx:border-border-default nx:whitespace-nowrap">
          <div className="nx:flex nx:w-max nx:gap-3 nx:p-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.title}
                className="nx:flex nx:size-24 nx:shrink-0 nx:items-end nx:rounded-md nx:bg-muted nx:p-2 nx:typography-label-small"
              >
                {artwork.title}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Both</span>
        <ScrollArea className="nx:h-40 nx:w-64 nx:rounded-md nx:border-default nx:border-border-default">
          <div className="nx:w-max nx:p-3">
            {Array.from({ length: 12 }, (_, row) => (
              <div key={row} className="nx:flex nx:gap-2 nx:py-1">
                {Array.from({ length: 10 }, (_, col) => (
                  <div
                    key={col}
                    className="nx:flex nx:size-10 nx:shrink-0 nx:items-center nx:justify-center nx:rounded nx:bg-muted nx:typography-label-small nx:text-muted-foreground"
                  >
                    {row * 10 + col}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
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
    </div>
  );
}
