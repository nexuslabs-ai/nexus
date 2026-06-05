import { Breadcrumb } from '../_components/Breadcrumb';

import { ColorScales } from './ColorScales';

/**
 * Foundations → Color — the proof-of-depth exemplar page.
 *
 * Server component. The interactive color-scale grids (with the color-vision
 * toggle) are a client island (ColorScales); everything else — the live-token
 * strip, the shade→role and APCA reference tables, the pipeline — is server-
 * rendered.
 * Swatches reference --nx-color-* variables inline; the semantic strip
 * reacts live to the theme picker via the CSS cascade (zero JS).
 *
 * Sources: .claude/rules/tokens.md (pipeline + APCA gate),
 * color-shades.md (the 11-step shade→role grid).
 */

// Surface ↔ text pairs — APCA-gated pairings that react to the picker.
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

// The 11-step shade→role grid (color-shades.md). The "—" cells are shades
// rarely surfaced in that mode.
const SHADE_ROLES: {
  shade: number;
  role: string;
  light: string;
  dark: string;
}[] = [
  {
    shade: 50,
    role: 'Near-white',
    light: 'muted, disabled, background/container/popover-hover',
    dark: 'nav-foreground',
  },
  {
    shade: 100,
    role: 'Very light',
    light:
      'background-active, container-active, control-background, nav-background',
    dark: '—',
  },
  {
    shade: 200,
    role: 'Light',
    light: 'control-background-hover, nav-item-hover/active, nav-border',
    dark: '—',
  },
  {
    shade: 300,
    role: 'Light-medium',
    light: '—',
    dark: 'disabled-foreground, nav-muted-foreground',
  },
  {
    shade: 400,
    role: 'Medium-light',
    light: 'border.active, disabled-foreground',
    dark: 'border.active',
  },
  {
    shade: 500,
    role: 'Mid',
    light: '— (perceptual anchor)',
    dark: '— (anchor)',
  },
  {
    shade: 600,
    role: 'Medium-dark',
    light: 'nav-muted-foreground, brand -background',
    dark: '—',
  },
  {
    shade: 700,
    role: 'Dark',
    light: 'brand -background-hover',
    dark: 'control-background-hover, popover-hover',
  },
  {
    shade: 800,
    role: 'Very dark',
    light: 'brand -background-active',
    dark: 'control-background, popover, container-hover, nav-border',
  },
  {
    shade: 900,
    role: 'Darker',
    light: 'container-foreground, popover-foreground, nav-foreground',
    dark: 'container, muted, background-hover/active, nav-item-hover/active',
  },
  {
    shade: 950,
    role: 'Near-black',
    light: '— (rarely surfaced)',
    dark: 'background — the canvas, nav-background, disabled',
  },
];

// APCA contrast tiers (tokens.md § APCA contrast gate).
const APCA_TIERS: { pair: string; lc: string; covers: string }[] = [
  { pair: 'foreground ↔ background', lc: '≥ 75', covers: 'Body text' },
  {
    pair: '{brand,status}-foreground ↔ -background',
    lc: '≥ 60',
    covers: 'UI labels — buttons, badges',
  },
  {
    pair: '*-subtle-foreground ↔ -subtle',
    lc: '≥ 60',
    covers: 'Labels on tinted fills',
  },
  {
    pair: 'nav-foreground ↔ nav surfaces',
    lc: '≥ 60',
    covers: 'Nav label text',
  },
  {
    pair: 'chart.categorical ↔ background / container',
    lc: '≥ 60',
    covers: 'Chart marks',
  },
  {
    pair: 'muted-foreground ↔ muted',
    lc: '≥ 45',
    covers: 'Incidental / de-emphasised text',
  },
  {
    pair: 'disabled-foreground ↔ disabled',
    lc: '≥ 45',
    covers: 'Disabled-state text',
  },
  {
    pair: 'focus ring ↔ every surface',
    lc: '≥ 45',
    covers: 'Focus indicators',
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
        at build time, with its lightness pinned to a perceptual grid. The five
        neutral bases share one grid — the same shade step is equally light in
        every base — while each chromatic hue follows its own lightness curve,
        centred where that hue is most vivid, and takes its chroma at the edge
        of the Display-P3 gamut. Contrast is then gated by APCA before it can
        ship.
      </p>

      {/* ── The palettes (+ shared CVD preview) ─────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">The palettes</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Start with the five neutral bases — eleven shades each. Read{' '}
          <em>down</em> any column: every base&rsquo;s <code>500</code> sits at
          the same perceptual lightness, only hue and chroma differ. Below are
          the chromatic hues brand and status are built from — these each follow
          their own lightness curve, so a vivid yellow can stay light while red
          runs deep — then the full reference. One color-vision filter applies
          to them all.
        </p>
        <ColorScales />
      </section>

      {/* ── Live semantic tokens ────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Live tokens</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Semantic surface/text pairs — the real tokens components use. Open the
          theme picker (bottom-right) and swap base, brand, or dark mode: every
          pair re-resolves live, and each clears the APCA gate by construction.
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

      {/* ── Shade → role ────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          What each shade is for
        </h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The shade number is a luminance coordinate, and each step maps to
          specific semantic roles. The mapping is not a simple light/dark flip —
          a shade lands at a different step in dark mode to hold the same
          perceptual tier. Text and hairline borders are the exception:{' '}
          <code>foreground</code>, <code>muted-foreground</code> and{' '}
          <code>border.default</code> are alpha tokens — transparent black in
          light, white in dark — so they composite onto any surface instead of
          binding to a neutral shade.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[720px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Shade</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Role</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">
                  Light-mode use
                </th>
                <th className="nx:py-2 nx:font-semibold">Dark-mode use</th>
              </tr>
            </thead>
            <tbody>
              {SHADE_ROLES.map((row) => (
                <tr
                  key={row.shade}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3">
                    <span className="nx:flex nx:items-center nx:gap-2">
                      <span
                        className="nx:inline-block nx:h-4 nx:w-4 nx:rounded-sm nx:border nx:border-border-default"
                        style={{
                          background: `var(--nx-color-slate-${row.shade})`,
                        }}
                      />
                      <span className="nx:font-mono nx:text-xs">
                        {row.shade}
                      </span>
                    </span>
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground">
                    {row.role}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:text-xs">
                    {row.light}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {row.dark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Accessibility / APCA gate ───────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Accessibility</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Contrast is gated by APCA (not WCAG 2 ratios), with thresholds set per
          intended use. A failing pair blocks the build — thresholds are not
          negotiable per finding. The palette is also validated against
          Viénot-simulated dichromacy in CI; the toggle above is the visual
          preview of that test.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Pair</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Min APCA</th>
                <th className="nx:py-2 nx:font-semibold">Covers</th>
              </tr>
            </thead>
            <tbody>
              {APCA_TIERS.map((tier) => (
                <tr
                  key={tier.pair}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs">
                    {tier.pair}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs nx:whitespace-nowrap">
                    Lc {tier.lc}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:text-xs">
                    {tier.covers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              body: 'Each shade’s L is overwritten by a perceptual grid — the neutral bases share one ladder, while each chromatic hue follows its own curve (yellow peaks light, red deep). Neutrals keep their source chroma; the re-pitched hues take it at the Display-P3 cusp.',
            },
            {
              step: 'Gate with APCA',
              body: 'Every foreground/background pair is scored with APCA before merge. A failing pair blocks the build.',
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
