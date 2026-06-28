import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Spacing. Server component — a live specimen of the 4px-based
 * scale, the semantic role tokens components consume, and the six density
 * modes.
 *
 * The bars reference the runtime `--nx-spacing-N` var inline, so they rescale
 * the moment the Size control in the theme picker swaps the active density via
 * the `data-style` attribute on `<html>`. Role-token rows are static spec.
 *
 * Source: packages/core/tokens/ (spacing modes).
 */

const SCALE: { name: string; px: number }[] = [
  { name: '0_5', px: 2 },
  { name: '1', px: 4 },
  { name: '2', px: 8 },
  { name: '3', px: 12 },
  { name: '4', px: 16 },
  { name: '5', px: 20 },
  { name: '6', px: 24 },
  { name: '8', px: 32 },
  { name: '10', px: 40 },
  { name: '12', px: 48 },
  { name: '16', px: 64 },
  { name: '20', px: 80 },
  { name: '24', px: 96 },
  { name: '32', px: 128 },
];

const ROLES: { token: string; px: string; use: string }[] = [
  { token: 'container-p', px: '24', use: 'Card / panel inner padding' },
  {
    token: 'container-gap',
    px: '16',
    use: 'Gap between items inside a container',
  },
  {
    token: 'layout-section-gap',
    px: '32',
    use: 'Vertical gap between page sections',
  },
  { token: 'layout-stack-gap', px: '8', use: 'Gap in a tight vertical stack' },
];

const MODES: { mode: string; archetype: string }[] = [
  { mode: 'compact', archetype: 'Compact / tool' },
  { mode: 'relaxed', archetype: 'Editorial / airy' },
  { mode: 'tight', archetype: 'Tighter utility scale' },
  {
    mode: 'default ★',
    archetype: 'Bundled :root default and @theme numeric baseline',
  },
  { mode: 'comfortable', archetype: 'Density variant' },
  { mode: 'spacious', archetype: 'Density variant' },
];

export function Spacing() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Spacing' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Spacing</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        A 4px-based scale, exposed as named steps only — there is no base{' '}
        <code>--spacing</code> token. All six density modes ship in every build
        and swap at runtime through the <code>data-style</code> attribute on{' '}
        <code>&lt;html&gt;</code> — the &ldquo;Size&rdquo; control in the theme
        picker (bottom-right) — cascading to every <code>nx:p-*</code> and{' '}
        <code>nx:gap-*</code> utility at once. The bars below read the live var,
        so swap the control and watch them rescale.
      </p>

      {/* ── The scale ───────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">The scale</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Fourteen steps from 2px to 128px. Each bar&rsquo;s width is the
          runtime <code>--nx-spacing-N</code> var, so the whole ladder rescales
          when the Size mode changes.
        </p>
        <div className="nx:flex nx:flex-col nx:gap-2">
          {SCALE.map((step) => (
            <div key={step.name} className="nx:flex nx:items-center nx:gap-4">
              <div
                className="nx:bg-primary-background nx:rounded-sm"
                style={{
                  width: `var(--nx-spacing-${step.name})`,
                  height: '12px',
                }}
              />
              <span className="nx:font-mono nx:typography-label-small nx:text-muted-foreground-subtle">
                --nx-spacing-{step.name}
              </span>
              <span className="nx:typography-label-small nx:text-muted-foreground">
                {step.px}px
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role tokens ─────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Role tokens</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Components don&rsquo;t reach for raw steps — they consume these
          semantic roles (e.g. a button&rsquo;s padding). Because the roles map
          onto the active density mode, swapping Size rescales whole components,
          not just bare utilities. Values shown are the default baseline.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Token</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">px</th>
                <th className="nx:py-2 nx:font-semibold">Use</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((row) => (
                <tr
                  key={row.token}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {row.token}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small nx:whitespace-nowrap">
                    {row.px}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Six density modes ─────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          Six density modes
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Every build ships all six. Swapping the &ldquo;Size&rdquo; control in
          the theme picker rescales the whole page live. The{' '}
          <code>default</code> mode is the bundled baseline.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Mode</th>
                <th className="nx:py-2 nx:font-semibold">Archetype</th>
              </tr>
            </thead>
            <tbody>
              {MODES.map((m) => (
                <tr
                  key={m.mode}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {m.mode}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
                    {m.archetype}
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
