import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Radius · Borders · Shadows. Server component — three
 * independent appearance axes, each a runtime mode swapped via the theme
 * picker. The radius and shadow specimens use literal `nx:rounded-*` /
 * `nx:shadow-*` utilities (so Tailwind scans them) that read the active mode's
 * vars; the border box reads the runtime `--nx-borderwidth-thick` var inline so
 * it tracks the active border-width mode.
 *
 * Source: .claude/rules/tokens.md (radius / borderwidth / shadow modes).
 */

const RADII: { cls: string; label: string }[] = [
  { cls: 'nx:rounded-sm', label: 'sm' },
  { cls: 'nx:rounded-md', label: 'md' },
  { cls: 'nx:rounded-lg', label: 'lg' },
  { cls: 'nx:rounded-xl', label: 'xl' },
  { cls: 'nx:rounded-2xl', label: '2xl' },
  { cls: 'nx:rounded-full', label: 'full' },
];

const RADIUS_MODES: { mode: string; md: number }[] = [
  { mode: 'sharp', md: 0 },
  { mode: 'subtle', md: 4 },
  { mode: 'smooth', md: 8 },
  { mode: 'mellow', md: 12 },
  { mode: 'blunt', md: 16 },
];

const BORDER_DESIGNS: { mode: string; def: string; thick: string }[] = [
  { mode: 'vega', def: '1', thick: '2' },
  { mode: 'maia', def: '1', thick: '1' },
  { mode: 'nova', def: '1.5', thick: '3' },
];

const SHADOWS: { cls: string; label: string }[] = [
  { cls: 'nx:shadow-2xs', label: '2xs' },
  { cls: 'nx:shadow-xs', label: 'xs' },
  { cls: 'nx:shadow-sm', label: 'sm' },
  { cls: 'nx:shadow-base', label: 'base' },
  { cls: 'nx:shadow-lg', label: 'lg' },
  { cls: 'nx:shadow-xl', label: 'xl' },
  { cls: 'nx:shadow-2xl', label: '2xl' },
];

export function Radius() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Radius · Borders · Shadows' },
        ]}
      />
      <h1 className="nx:typography-heading-large">
        Radius · Borders · Shadows
      </h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Three independent appearance axes, each a runtime mode swapped through
        the theme picker (bottom-right). Corner radius, border width, and
        elevation move separately — set the Radius, Border, and Shadow controls
        and watch each specimen below re-render on its own axis.
      </p>

      {/* ── Radius ──────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Radius</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Six radius utilities, each reacting to the active Radius mode. Swap
          the mode and every corner re-rounds.
        </p>
        <div className="nx:flex nx:flex-wrap nx:gap-6 nx:mb-6">
          {RADII.map((r) => (
            <div
              key={r.label}
              className="nx:flex nx:flex-col nx:items-center nx:gap-2"
            >
              <div
                className={`nx:size-20 nx:bg-muted nx:border nx:border-border-default ${r.cls}`}
              />
              <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
                {r.label}
              </span>
            </div>
          ))}
        </div>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[360px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Mode</th>
                <th className="nx:py-2 nx:font-semibold">md value (px)</th>
              </tr>
            </thead>
            <tbody>
              {RADIUS_MODES.map((m) => (
                <tr
                  key={m.mode}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs">
                    {m.mode}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {m.md}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Border widths ───────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Border widths</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The picker offers five border-width modes, but only three are distinct
          designs — <code>lyra</code> and <code>mira</code> are byte-identical
          to <code>vega</code>. The box below sets its width from the runtime{' '}
          <code>--nx-borderwidth-thick</code> var, so it thickens or thins as
          you swap the Border control.
        </p>
        <div className="nx:overflow-x-auto nx:mb-6">
          <table className="nx:w-full nx:min-w-[360px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Mode</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">
                  default (px)
                </th>
                <th className="nx:py-2 nx:font-semibold">thick (px)</th>
              </tr>
            </thead>
            <tbody>
              {BORDER_DESIGNS.map((b) => (
                <tr
                  key={b.mode}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs">
                    {b.mode}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:text-xs">
                    {b.def}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {b.thick}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div
            className="nx:size-20 nx:bg-muted nx:rounded-lg nx:border-border-default"
            style={{
              borderStyle: 'solid',
              borderWidth: 'var(--nx-borderwidth-thick)',
            }}
          />
          <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
            border-width: var(--nx-borderwidth-thick)
          </span>
        </div>
      </section>

      {/* ── Shadows ─────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Shadows</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Seven elevation tiers plus an inset shadow, each reacting to the
          active Shadow mode. Shadows are theme-split — tuned per light and
          dark, since a drop-shadow that defines a card edge in light vanishes
          against a near-black dark canvas.
        </p>
        <div className="nx:flex nx:flex-wrap nx:gap-6 nx:mb-6">
          {SHADOWS.map((s) => (
            <div
              key={s.label}
              className="nx:flex nx:flex-col nx:items-center nx:gap-2"
            >
              <div
                className={`nx:size-20 nx:bg-container nx:rounded-lg ${s.cls}`}
              />
              <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="nx:flex nx:flex-col nx:items-center nx:gap-2 nx:w-20">
          <div className="nx:size-20 nx:bg-container nx:rounded-lg nx:shadow-inner" />
          <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
            inner
          </span>
        </div>
      </section>
    </>
  );
}
