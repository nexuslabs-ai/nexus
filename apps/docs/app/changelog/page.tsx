import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Changelog. Pre-1.0 — grouped by date, not semver, until the first tagged
 * release. Entries are sourced from merged PRs; link out to GitHub.
 */

const REPO = 'https://github.com/nexuslabs-ai/nexus';

type Change = {
  type: 'Added' | 'Changed' | 'Fixed';
  text: string;
  pr?: number;
};
type Release = { date: string; changes: Change[] };

const RELEASES: Release[] = [
  {
    date: '2026-06-29',
    changes: [
      {
        type: 'Changed',
        text: '@nexus/core — publish-ready framework-agnostic Appearance engine',
      },
      {
        type: 'Added',
        text: 'Appearance — consumer setup docs and dist-consumer package probes',
      },
    ],
  },
  {
    date: '2026-06-27',
    changes: [
      {
        type: 'Added',
        text: 'Appearance — full-token derivation and contrast as a structure control',
        pr: 535,
      },
      {
        type: 'Added',
        text: 'Appearance — package engine and React provider/script runtime',
        pr: 536,
      },
      {
        type: 'Added',
        text: 'Appearance — first-paint, no-flash bootstrap',
        pr: 537,
      },
      {
        type: 'Changed',
        text: 'Console — dogfood the package Appearance model',
        pr: 545,
      },
      {
        type: 'Fixed',
        text: '@nexus/react/appearance — consumer dist types now resolve correctly',
        pr: 548,
      },
    ],
  },
  {
    date: '2026-06-01',
    changes: [
      { type: 'Added', text: 'Sonner — toast notifications', pr: 274 },
      { type: 'Added', text: 'Sidebar — collapsible app navigation', pr: 273 },
      {
        type: 'Added',
        text: 'Form — field, label, and validation primitives',
        pr: 272,
      },
    ],
  },
  {
    date: '2026-05-31',
    changes: [
      { type: 'Added', text: 'Command — the cmdk command palette', pr: 271 },
      { type: 'Added', text: 'Input OTP — one-time-code input', pr: 270 },
      { type: 'Added', text: 'Sheet — edge-anchored overlay panel', pr: 269 },
      {
        type: 'Added',
        text: 'Alert Dialog — confirm / destructive prompts',
        pr: 268,
      },
      {
        type: 'Added',
        text: 'Scroll Area — styled custom scrollbars',
        pr: 267,
      },
      { type: 'Added', text: 'Popover — floating content layer', pr: 266 },
      {
        type: 'Added',
        text: 'Progress, Table, Radio Group, Checkbox, Textarea, Skeleton',
        pr: 260,
      },
    ],
  },
];

const BADGE: Record<Change['type'], string> = {
  Added: 'nx:bg-success-subtle nx:text-success-subtle-foreground',
  Changed: 'nx:bg-primary-subtle nx:text-primary-subtle-foreground',
  Fixed: 'nx:bg-warning-subtle nx:text-warning-subtle-foreground',
};

export default function Changelog() {
  return (
    <div className="nx:max-w-[768px] nx:mx-auto nx:px-6 nx:py-8 nx:pb-16">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Changelog' }]}
      />
      <h1 className="nx:typography-heading-large">Changelog</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-10 nx:max-w-[64ch]">
        Notable changes to the Nexus design system. Pre-1.0, so entries are
        grouped by date rather than semver — that starts at the first tagged
        release.
      </p>

      <div className="nx:flex nx:flex-col nx:gap-10">
        {RELEASES.map((release) => (
          <section
            key={release.date}
            className="nx:grid nx:grid-cols-1 nx:sm:grid-cols-[120px_minmax(0,1fr)] nx:gap-x-8 nx:gap-y-3"
          >
            <h2 className="nx:font-mono nx:typography-label-default nx:text-muted-foreground-subtle nx:sm:pt-1">
              {release.date}
            </h2>
            <ul className="nx:list-none nx:p-0 nx:m-0 nx:flex nx:flex-col nx:gap-3">
              {release.changes.map((change, i) => (
                <li key={i} className="nx:flex nx:items-start nx:gap-3">
                  <span
                    className={`nx:shrink-0 nx:rounded-full nx:px-2 nx:py-0.5 nx:text-[10px] nx:font-mono nx:uppercase nx:tracking-wider ${BADGE[change.type]}`}
                  >
                    {change.type}
                  </span>
                  <span className="nx:typography-body-default">
                    {change.text}
                    {change.pr && (
                      <>
                        {' '}
                        <a
                          href={`${REPO}/pull/${change.pr}`}
                          target="_blank"
                          rel="noreferrer"
                          className="nx:font-mono nx:typography-label-small nx:text-primary-subtle-foreground nx:hover:underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:rounded-sm"
                        >
                          #{change.pr}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
