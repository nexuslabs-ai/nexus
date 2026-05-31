import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea, ScrollBar } from './scroll-area';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Release-notes prose — multi-paragraph copy that overflows a short viewport.
const releaseNotes = [
  'Scroll areas render a consistent custom scrollbar across Chrome, Safari, and Firefox, replacing the platform scrollbar so the chrome looks the same everywhere.',
  'The viewport measures its content and only surfaces a scrollbar on the axis that actually overflows — a wide-but-short block gets a horizontal bar and no vertical one.',
  'Scrollbars fade in on hover by default. Pass type="always" to keep them pinned, or type="scroll" to show them only while the content is moving.',
  'The thumb is sized in proportion to the visible fraction of the content, so a long document gets a short thumb and a barely-overflowing one gets a long thumb.',
  'Keyboard focus can move into the viewport with a visible focus ring, so the scrollable region stays reachable without a pointer.',
];

// A long, discrete list — the canonical "tags drawer" scroll fixture.
const versions = Array.from(
  { length: 40 },
  (_, i) => `v1.4.0-canary.${40 - i}`
);

// A horizontal gallery row.
const artworks = [
  { title: 'Aurora', artist: 'Ornella Binni' },
  { title: 'Tide', artist: 'Tom Byrom' },
  { title: 'Drift', artist: 'Vladimir Malyavko' },
  { title: 'Ember', artist: 'Mara Stein' },
  { title: 'Quartz', artist: 'Liang Wu' },
  { title: 'Meadow', artist: 'Sofia Russo' },
];

// ============================================
// BASIC STORIES
// ============================================

// Vertical is the default — a fixed-height viewport scrolls its overflowing
// content and surfaces the auto-rendered vertical ScrollBar on hover.
export const Default: Story = {
  render: () => (
    <ScrollArea className="nx:h-48 nx:w-72 nx:rounded-md nx:border nx:border-border-default">
      <div className="nx:flex nx:flex-col nx:gap-3 nx:p-4 nx:text-sm nx:text-foreground">
        <h4 className="nx:font-medium nx:leading-none">Release notes</h4>
        {releaseNotes.map((note, i) => (
          <p key={i} className="nx:text-muted-foreground">
            {note}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

// A scrollable list of discrete rows.
export const VerticalList: Story = {
  render: () => (
    <ScrollArea className="nx:h-72 nx:w-56 nx:rounded-md nx:border nx:border-border-default">
      <div className="nx:p-4">
        <h4 className="nx:mb-3 nx:text-sm nx:font-medium nx:leading-none nx:text-foreground">
          Builds
        </h4>
        <ul className="nx:flex nx:flex-col">
          {versions.map((version) => (
            <li
              key={version}
              className="nx:border-b nx:border-border-default nx:py-2 nx:text-sm nx:text-foreground nx:last:border-b-0"
            >
              {version}
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  ),
};

// Horizontal scrolling — add a `<ScrollBar orientation="horizontal" />` after
// the content. The content lays out in a `nx:w-max` flex row so it overflows.
export const HorizontalRow: Story = {
  render: () => (
    <ScrollArea className="nx:w-96 nx:rounded-md nx:border nx:border-border-default nx:whitespace-nowrap">
      <div className="nx:flex nx:w-max nx:gap-4 nx:p-4">
        {artworks.map((artwork) => (
          <figure key={artwork.title} className="nx:shrink-0">
            <div className="nx:flex nx:h-40 nx:w-32 nx:items-end nx:rounded-md nx:bg-muted nx:p-3">
              <span className="nx:text-sm nx:font-medium nx:text-foreground">
                {artwork.title}
              </span>
            </div>
            <figcaption className="nx:pt-2 nx:text-xs nx:text-muted-foreground">
              by {artwork.artist}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

// Both axes — a grid wider and taller than the viewport. The vertical bar is
// auto-rendered; the horizontal one is added as a child, and the Corner fills
// where they meet.
export const Both: Story = {
  render: () => (
    <ScrollArea className="nx:h-72 nx:w-96 nx:rounded-md nx:border nx:border-border-default">
      <div className="nx:w-max nx:p-4">
        {Array.from({ length: 20 }, (_, row) => (
          <div key={row} className="nx:flex nx:gap-2 nx:py-1">
            {Array.from({ length: 15 }, (_, col) => (
              <div
                key={col}
                className="nx:flex nx:size-12 nx:shrink-0 nx:items-center nx:justify-center nx:rounded nx:bg-muted nx:text-xs nx:text-muted-foreground"
              >
                {row * 15 + col}
              </div>
            ))}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

// Inside a Card — a bounded scroll region keeps a long list from stretching the
// card. The ScrollArea takes its height from a utility, not the content.
export const InCard: Story = {
  render: () => (
    <Card className="nx:w-80">
      <CardHeader>
        <CardTitle>Builds</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="nx:h-48 nx:rounded-md nx:border nx:border-border-default">
          <ul className="nx:flex nx:flex-col nx:p-3">
            {versions.map((version) => (
              <li
                key={version}
                className="nx:border-b nx:border-border-default nx:py-2 nx:text-sm nx:text-container-foreground nx:last:border-b-0"
              >
                {version}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  ),
};

// ============================================
// ATTRIBUTE TESTS
// ============================================

// `type="always"` pins the scrollbar so its slot is queryable without
// simulating hover.
export const WithDataAttributes: Story = {
  render: () => (
    <ScrollArea
      type="always"
      className="nx:h-32 nx:w-48 nx:rounded-md nx:border nx:border-border-default"
    >
      <div className="nx:flex nx:flex-col nx:gap-2 nx:p-4 nx:text-sm nx:text-foreground">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i}>Line {i + 1}</span>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="scroll-area"]');
    const viewport = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    const scrollbar = canvasElement.querySelector('[data-slot="scroll-bar"]');
    const thumb = canvasElement.querySelector('[data-slot="scroll-bar-thumb"]');

    await expect(root).toBeInTheDocument();
    await expect(viewport).toBeInTheDocument();
    await expect(scrollbar).toBeInTheDocument();
    await expect(thumb).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-6 nx:text-sm nx:text-foreground">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Vertical</span>
        <ScrollArea className="nx:h-40 nx:w-48 nx:rounded-md nx:border nx:border-border-default">
          <ul className="nx:flex nx:flex-col nx:p-3">
            {versions.slice(0, 20).map((version) => (
              <li
                key={version}
                className="nx:border-b nx:border-border-default nx:py-1.5 nx:last:border-b-0"
              >
                {version}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Horizontal</span>
        <ScrollArea className="nx:w-64 nx:rounded-md nx:border nx:border-border-default nx:whitespace-nowrap">
          <div className="nx:flex nx:w-max nx:gap-3 nx:p-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.title}
                className="nx:flex nx:size-24 nx:shrink-0 nx:items-end nx:rounded-md nx:bg-muted nx:p-2 nx:text-xs nx:font-medium"
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
        <ScrollArea className="nx:h-40 nx:w-64 nx:rounded-md nx:border nx:border-border-default">
          <div className="nx:w-max nx:p-3">
            {Array.from({ length: 12 }, (_, row) => (
              <div key={row} className="nx:flex nx:gap-2 nx:py-1">
                {Array.from({ length: 10 }, (_, col) => (
                  <div
                    key={col}
                    className="nx:flex nx:size-10 nx:shrink-0 nx:items-center nx:justify-center nx:rounded nx:bg-muted nx:text-xs nx:text-muted-foreground"
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
  ),
};
