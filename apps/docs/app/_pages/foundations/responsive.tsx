import { CodeSample } from '../../_components/CodeSample';
import { SectionHeading } from '../../_components/Heading';

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

export default function Responsive() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Responsive</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Nexus is built for mobile and desktop equally. Write the mobile styles
        first, without a prefix, then add wider screens with <code>nx:lg:</code>{' '}
        and up. Breakpoints are in rem, so a user who enlarges their browser
        font size gets the roomier layout sooner.
      </p>

      {/* ── Breakpoints ─────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Breakpoints
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Components are tuned at two widths: about 390px for mobile and about
          1280px (<code>xl</code>) for desktop. Narrow, Standard and Wide are
          labels for review, not classes.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:typography-label-default">
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
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {bp.cls}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:typography-label-small nx:whitespace-nowrap">
                    {bp.size}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:typography-label-small">
                    {bp.display}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
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
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Show / Hide primitives
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Use <code>&lt;Show&gt;</code> and <code>&lt;Hide&gt;</code> to show
          content at some widths only. Pass one prop: <code>above</code> or{' '}
          <code>below</code> for the viewport, or <code>containerAbove</code> or{' '}
          <code>containerBelow</code> for the nearest <code>@container</code>.
          The children always render. Only their visibility changes.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The viewport and container scales share names but not sizes. Viewport{' '}
          <code>md</code> is 48rem and container <code>md</code> is 28rem.
        </p>
        <CodeSample lang="tsx">
          {`// Viewport axis — page-shell decision
<Show above="lg">
  <Sidebar />
</Show>

// Container axis — component adapts to its parent
<Hide containerBelow="md">
  <Actions />
</Hide>`}
        </CodeSample>
      </section>

      {/* ── Which mechanism ─────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Which mechanism
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Inside a component, use <code>@container</code>. The component then
          adapts to its parent, so it looks right in a sidebar or a full-width
          section. Use viewport prefixes for the page layout, and for overlays
          that cover the screen, like Dialog.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
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
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small nx:whitespace-nowrap">
                    {m.mechanism}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
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
