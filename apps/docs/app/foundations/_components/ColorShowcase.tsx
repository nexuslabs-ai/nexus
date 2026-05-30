import { Breadcrumb } from '../../_components/Breadcrumb';

/**
 * Foundations → Color — the proof-of-depth exemplar page.
 *
 * Pure server component. The swatches reference Nexus CSS variables
 * directly via inline styles (the one documented place inline styles
 * beat nx: utilities — the background is a dynamic token reference,
 * not a static class). The semantic strip reacts live to the theme
 * picker with zero JS, because the picker swaps the document-level
 * --nx-color-* variables and the CSS cascade does the rest.
 */

const BASES = ['slate', 'neutral', 'gray', 'stone', 'zinc'] as const;
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Surface ↔ text pairs — each is an APCA-gated pairing that reacts to
// the picker (base / brand / dark). Demonstrates real token contrast live.
const SEMANTIC_PAIRS: { surface: string; text: string; label: string }[] = [
  { surface: 'background', text: 'foreground', label: 'background' },
  { surface: 'muted', text: 'muted-foreground', label: 'muted' },
  { surface: 'container', text: 'container-foreground', label: 'container' },
  { surface: 'popover', text: 'popover-foreground', label: 'popover' },
  {
    surface: 'primary-background',
    text: 'primary-foreground',
    label: 'primary',
  },
];

export function ColorShowcase() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Color' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Color</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Engineered, not picked. Every color is stored as hex, converted to OKLCH
        at build time, and has its lightness pinned to a shared perceptual grid
        — so the same shade step is equally light in every palette. Contrast is
        then gated by APCA before it can ship.
      </p>

      {/* ── The perceptual grid ─────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          The perceptual grid
        </h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Five base palettes, eleven shades each. Read <em>down</em> any column:
          every palette&rsquo;s <code>500</code> sits at the same perceptual
          lightness — only hue and chroma differ. That uniformity is the grid
          doing its job, not a coincidence of hex picking.
        </p>

        <div className="nx:overflow-x-auto">
          <div className="nx:min-w-[640px]">
            {/* shade header row */}
            <div
              className="nx:grid nx:gap-1 nx:mb-1"
              style={{
                gridTemplateColumns: `4.5rem repeat(${SHADES.length}, 1fr)`,
              }}
            >
              <div />
              {SHADES.map((shade) => (
                <div
                  key={shade}
                  className="nx:text-[10px] nx:text-muted-foreground-subtle nx:text-center nx:font-mono"
                >
                  {shade}
                </div>
              ))}
            </div>

            {/* one row per base palette */}
            {BASES.map((base) => (
              <div
                key={base}
                className="nx:grid nx:gap-1 nx:mb-1 nx:items-center"
                style={{
                  gridTemplateColumns: `4.5rem repeat(${SHADES.length}, 1fr)`,
                }}
              >
                <div className="nx:text-xs nx:capitalize nx:text-muted-foreground nx:pr-2">
                  {base}
                </div>
                {SHADES.map((shade) => (
                  <div
                    key={shade}
                    className="nx:h-10 nx:rounded-sm nx:border nx:border-border-default"
                    style={{
                      background: `var(--nx-color-${base}-${shade})`,
                    }}
                    title={`${base}.${shade}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live semantic tokens ────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Live tokens</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          These are semantic surface/text pairs — the real tokens components
          use. Open the theme picker (bottom-right) and swap base, brand, or
          dark mode: every pair re-resolves live, and each one clears the APCA
          contrast gate by construction.
        </p>

        <div className="nx:grid nx:grid-cols-2 nx:md:grid-cols-5 nx:gap-3">
          {SEMANTIC_PAIRS.map((pair) => (
            <div
              key={pair.label}
              className="nx:rounded-md nx:border nx:border-border-default nx:p-4 nx:min-h-24 nx:flex nx:flex-col nx:justify-between"
              style={{
                background: `var(--nx-color-${pair.surface})`,
                color: `var(--nx-color-${pair.text})`,
              }}
            >
              <span className="nx:text-sm nx:font-medium">Aa</span>
              <span className="nx:text-[11px] nx:font-mono nx:opacity-80">
                {pair.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section>
        <h2 className="nx:typography-heading-small nx:mb-4">How it works</h2>
        <ol className="nx:flex nx:flex-col nx:gap-3 nx:max-w-[64ch]">
          {[
            {
              step: 'Store hex',
              body: 'Tokens live as hex on disk — the only format Figma and Tokens Studio round-trip cleanly.',
            },
            {
              step: 'Convert to OKLCH',
              body: 'At build time every hex value is converted to an oklch(…) value emitted into CSS.',
            },
            {
              step: 'Pin the lightness',
              body: 'Each shade key (50–950) has its L overwritten by a shared perceptual grid; hue and chroma come from the source hex (chroma clamped to Display P3).',
            },
            {
              step: 'Gate with APCA',
              body: 'Every foreground/background pair is scored with APCA before merge — body text ≥ Lc 75, UI labels ≥ 60, incidental ≥ 45. A failing pair blocks the build.',
            },
          ].map((item, i) => (
            <li
              key={item.step}
              className="nx:flex nx:gap-3 nx:rounded-md nx:border nx:border-border-default nx:bg-container nx:p-4"
            >
              <span className="nx:text-sm nx:font-mono nx:text-muted-foreground-subtle">
                {i + 1}
              </span>
              <div>
                <div className="nx:text-sm nx:font-semibold">{item.step}</div>
                <p className="nx:typography-body-small nx:text-muted-foreground nx:mt-0.5">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
