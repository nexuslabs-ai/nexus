import { vi } from 'vitest';

/** Places each heading at a fixed viewport offset, as `getActiveHeadingId` reads it. */
export function stubHeadingTops(tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const heading = document.getElementById(id);
    if (!heading) throw new Error(`no heading #${id}`);
    const rect = new DOMRect(0, top, 0, 0);
    heading.getBoundingClientRect = vi.fn(() => rect);
  }
}
