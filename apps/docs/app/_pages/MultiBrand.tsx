import { Breadcrumb } from '../_components/Breadcrumb';
import { Button } from '../_components/nexus';

/**
 * Theming → Multi-brand. The theming-model explainer (this is where
 * `/theming` lands). Server component; the live preview renders @nexus/react
 * Buttons as a client island that re-themes via the picker. Documents the
 * dimensions, the two runtime swap mechanisms, consumer overrides, and the
 * humans/agents framing.
 *
 * Sources: .claude/rules/tokens.md, components.md, shadcn-divergences.md.
 */

const DIMENSIONS: { dim: string; options: string; swap: string }[] = [
  {
    dim: 'Base',
    options: 'slate · stone · neutral · gray · zinc',
    swap: '<link> swap',
  },
  {
    dim: 'Brand',
    options: 'blue · purple · pink · teal · orange · black',
    swap: '<link> swap',
  },
  {
    dim: 'Spacing (density)',
    options: '7 modes — nova · vega · maia · …',
    swap: 'data-style attr',
  },
  { dim: 'Typography', options: 'nova · vega · maia', swap: '<link> swap' },
  { dim: 'Shadow', options: '5 modes', swap: '<link> swap' },
  {
    dim: 'Radius',
    options: 'sharp · subtle · smooth · mellow · blunt',
    swap: '<link> swap',
  },
  {
    dim: 'Border width',
    options: '3 designs (vega · maia · nova)',
    swap: '<link> swap',
  },
  { dim: 'Dark mode', options: 'light · dark', swap: '.dark class' },
];

const SWATCHES = [
  'primary-background',
  'secondary-background',
  'muted',
  'foreground',
];

export function MultiBrand() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Theming', href: '/theming' },
          { label: 'Multi-brand' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Multi-brand theming</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Nexus theming is a set of independent dimensions, each a runtime mode
        you can swap without a rebuild. Components never hard-code a color or a
        size — they reference semantic tokens, so re-pointing a dimension
        cascades to the whole tree at once. One source of truth, read the same
        way by humans and agents.
      </p>

      {/* ── Dimensions ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">The dimensions</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Two color axes plus five design-token axes and dark mode. Each is
          orthogonal — base × brand × density × … combine freely.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Dimension</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Options</th>
                <th className="nx:py-2 nx:font-semibold">How it swaps</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr
                  key={d.dim}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-medium">{d.dim}</td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground">
                    {d.options}
                  </td>
                  <td className="nx:py-2 nx:font-mono nx:text-xs nx:text-muted-foreground">
                    {d.swap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Mechanisms ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          Two runtime mechanisms
        </h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Colors and most design tokens swap by re-pointing a stylesheet
          <code className="nx:typography-code-inline">
            {' '}
            &lt;link data-theme&gt;
          </code>
          — each mode is a small CSS file that redefines the{' '}
          <code className="nx:typography-code-inline">--nx-*</code> variables.
          Spacing density swaps via a{' '}
          <code className="nx:typography-code-inline">data-style</code>{' '}
          attribute on{' '}
          <code className="nx:typography-code-inline">&lt;html&gt;</code> (so
          one attribute rescales every{' '}
          <code className="nx:typography-code-inline">nx:p-*</code> utility),
          and dark mode toggles the{' '}
          <code className="nx:typography-code-inline">.dark</code> class.
          Because every surface reads the tokens, all three cascade with zero
          component JavaScript.
        </p>
      </section>

      {/* ── Live ────────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">See it live</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Open the theme picker (bottom-right) and swap Base or Brand — these
          components and swatches re-resolve instantly.
        </p>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3 nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:p-5">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <span className="nx:ml-1 nx:flex nx:gap-1.5">
            {SWATCHES.map((token) => (
              <span
                key={token}
                title={token}
                className="nx:size-8 nx:rounded-md nx:border nx:border-border-default"
                style={{ background: `var(--nx-color-${token})` }}
              />
            ))}
          </span>
        </div>
      </section>

      {/* ── Consumer overrides ──────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          Re-theme as a consumer
        </h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Override the token variables in a stylesheet loaded after Nexus, or
          set a density mode on any subtree. No component changes — the cascade
          does the rest. See <strong>Consumer overrides</strong> for the full
          surface.
        </p>
        <pre className="nx:typography-code-block nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-4 nx:overflow-x-auto">
          {`/* loaded after @nexus/tailwind */
:root {
  --nx-color-primary-background: oklch(0.55 0.2 145); /* your brand */
}

/* density on a subtree */
<section data-style="nova"> … compact … </section>`}
        </pre>
      </section>

      {/* ── For agents ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">For agents</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:max-w-[64ch]">
          The same dimensions are published as structured DTCG tokens, a{' '}
          <code className="nx:typography-code-inline">llms.txt</code> manifest,
          and a mirror of the authoring rules — so an agent re-themes by reading
          the source of truth, not by scraping rendered CSS. See{' '}
          <strong>For AI agents</strong>.
        </p>
      </section>
    </>
  );
}
