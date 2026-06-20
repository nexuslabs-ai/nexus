import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Responsive. Server component — the breakpoint scale, the
 * declarative `<Show>` / `<Hide>` primitives, and the decision tree for which
 * responsive mechanism to reach for. Static spec; the breakpoints are
 * rem-based so they track the user's font-size preference, not the picker.
 *
 * Source: .claude/rules/responsive.md.
 */

const BREAKPOINTS: {
  cls: string;
  size: string;
  display: string;
  target: string;
}[] = [
  {
    cls: '(no prefix)',
    size: 'base / <640px',
    display: 'Narrow',
    target: '★ mobile foundation — style here first',
  },
  {
    cls: 'nx:sm:',
    size: '40rem / 640px',
    display: 'Narrow',
    target: '★ first-class',
  },
  {
    cls: 'nx:md:',
    size: '48rem / 768px',
    display: 'Narrow',
    target: '★ first-class',
  },
  {
    cls: 'nx:lg:',
    size: '64rem / 1024px',
    display: 'Standard',
    target: '★ first-class — desktop floor',
  },
  {
    cls: 'nx:xl:',
    size: '80rem / 1280px',
    display: 'Standard',
    target: '★ first-class — desktop reference',
  },
  {
    cls: 'nx:2xl:',
    size: '96rem / 1536px',
    display: 'Wide',
    target: 'extra breathing room',
  },
];

const MECHANISMS: { mechanism: string; use: string }[] = [
  {
    mechanism: '@container query',
    use: 'Component adapts to its parent’s width',
  },
  {
    mechanism: 'nx:lg: viewport prefix',
    use: 'Page-shell decisions — nav collapse, side-panel hide',
  },
  {
    mechanism: 'clamp()',
    use: 'Continuous adaptation of size — type, padding',
  },
  { mechanism: 'svh / lvh / dvh', use: 'Mobile browser-chrome accommodation' },
];

export function Responsive() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Responsive' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Responsive</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Nexus is designed mobile-first and desktop-first — Narrow (mobile) and
        Standard (desktop) are both first-class targets, neither a degradation
        of the other. Author mobile-first: base styles are the mobile case, and
        min-width prefixes layer on the wider tiers. Wide (≥1536px) gets extra
        breathing room; interactive controls clear a ~44px minimum tap-target
        for touch. Breakpoints are rem-based, so they track the user&rsquo;s
        font-size preference — raise the base font and each breakpoint fires at
        a narrower viewport, dropping the layout to a roomier tier as the text
        enlarges.
      </p>

      {/* ── Breakpoints ─────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Breakpoints</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Five Tailwind classes plus the unprefixed base, mapped onto the Narrow
          / Standard / Wide labels. Components are tuned against two reference
          widths — mobile ~390px and desktop ~1280px (<code>xl</code>).
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Class</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">rem / px</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">
                  Display class
                </th>
                <th className="nx:py-2 nx:font-semibold">Design target</th>
              </tr>
            </thead>
            <tbody>
              {BREAKPOINTS.map((bp) => (
                <tr
                  key={bp.cls}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs">
                    {bp.cls}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:text-xs nx:whitespace-nowrap">
                    {bp.size}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:text-xs">
                    {bp.display}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {bp.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Show / Hide primitives ──────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          Show / Hide primitives
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The declarative <code>&lt;Show&gt;</code> / <code>&lt;Hide&gt;</code>{' '}
          primitives from <code>@nexus/react</code> express responsive
          visibility. Provide exactly one axis: <code>above</code> /{' '}
          <code>below</code> for the viewport, or <code>containerAbove</code> /{' '}
          <code>containerBelow</code> for the nearest <code>@container</code>.
          They toggle <code>display: contents</code> ↔{' '}
          <code>display: none</code>, so children always render — only
          visibility changes. Note the two breakpoint scales share names but
          differ: viewport <code>md</code> = 48rem, container <code>md</code> =
          28rem, so <code>above=&quot;md&quot;</code> and{' '}
          <code>containerAbove=&quot;md&quot;</code> do not fire at the same
          width.
        </p>
        <pre className="nx:typography-code-block nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-4 nx:overflow-x-auto">
          {`// Viewport axis — page-shell decision
<Show above="lg">
  <Sidebar />
</Show>

// Container axis — component adapts to its parent
<Hide containerBelow="md">
  <Actions />
</Hide>`}
        </pre>
      </section>

      {/* ── Which mechanism ─────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Which mechanism</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Components prefer <code>@container</code> — they adapt to their
          parent&rsquo;s width, so they render consistently in a sidebar or a
          hero. Viewport prefixes are reserved for page-shell decisions and
          full-viewport overlays (Dialog), whose trigger is position relative to
          the viewport.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Mechanism</th>
                <th className="nx:py-2 nx:font-semibold">Use case</th>
              </tr>
            </thead>
            <tbody>
              {MECHANISMS.map((m) => (
                <tr
                  key={m.mechanism}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs nx:whitespace-nowrap">
                    {m.mechanism}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {m.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
