import Link from 'next/link';

import { ColorScales } from '../../_components/ColorScales';
import { SectionHeading } from '../../_components/Heading';

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
 * Sources: packages/core/tokens/ + derive-theme APCA sweep (pipeline + APCA
 * gate), color-shades.md (the 11-step shade→role grid).
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
    light: 'border-focus, disabled-foreground',
    dark: 'border-focus',
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

// APCA contrast tiers (see packages/core/src/lib/apca-pairs.ts).
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
    pair: 'chart.categorical ↔ container',
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

// How the Appearance contrast fields move each target (derive-theme contrast sweep).
const CONTRAST_RANGES: { target: string; low: string; high: string }[] = [
  { target: 'Body text', low: 'Lc 75', high: 'Lc 90' },
  { target: 'UI labels', low: 'Lc 60', high: 'Lc 75' },
  { target: 'Incidental text', low: 'Lc 45', high: 'Lc 60' },
  { target: 'Light-mode border opacity', low: '6%', high: '11.68%' },
];

export default function ColorShowcase() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Color</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Components use semantic color tokens, like{' '}
        <code>primary-background</code>. Each token picks a shade from a
        palette, and every text color is checked for contrast before it ships.
      </p>

      {/* ── The palettes (+ shared CVD preview) ─────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          The palettes
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          There are five neutral palettes with eleven shades each. A shade
          number means the same lightness in every neutral palette, so every{' '}
          <code>500</code> looks equally light. Brand and status colors come
          from the chromatic palettes. Each hue has its own lightness curve, so
          yellow stays light and red runs deep. The color-vision filter shows
          every palette as someone with color blindness sees it.
        </p>
        <ColorScales />
      </section>

      {/* ── Live semantic tokens ────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Live tokens
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          These are the tokens components use. Change the theme with the picker
          in the bottom-right corner, and every pair updates.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          A foreground token names the surface it sits on, not what it paints.{' '}
          <code>primary-foreground</code> colors anything on{' '}
          <code>primary-background</code>: a button&rsquo;s label, or a checked
          switch&rsquo;s knob. <code>error-subtle-foreground</code> colors the
          message and icon on <code>error-subtle</code>.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Each foreground is checked against its own background. If you use it
          on a different surface, check the contrast yourself.
        </p>
        <div
          data-md-skip
          className="nx:grid nx:grid-cols-2 nx:md:grid-cols-5 nx:gap-3"
        >
          {SEMANTIC_PAIRS.map((pair) => (
            <div
              key={pair.label}
              className="nx:rounded-md nx:border nx:border-border-default nx:p-4 nx:min-h-24 nx:flex nx:flex-col nx:justify-between"
              style={{
                background: `var(--nx-color-${pair.surface})`,
                color: `var(--nx-color-${pair.text})`,
              }}
            >
              <span className="nx:typography-label-default">Aa</span>
              <span className="nx:text-[11px] nx:font-mono nx:opacity-80">
                {pair.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shade → role ────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          What each shade is for
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The shade number is a lightness step. Each token uses a different step
          in each mode, so it keeps the same visual weight on a dark background.
          Text and thin borders don&rsquo;t use a shade. <code>foreground</code>
          , <code>muted-foreground</code> and <code>border.default</code> are
          semi-transparent black in light mode and white in dark mode, so they
          work on any surface.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[720px] nx:border-collapse nx:typography-label-default">
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
                      <span className="nx:font-mono nx:typography-label-small">
                        {row.shade}
                      </span>
                    </span>
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground">
                    {row.role}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:typography-label-small">
                    {row.light}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
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
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Accessibility
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Nexus checks contrast with APCA, not WCAG 2 ratios. Each pair has a
          minimum score for how it&rsquo;s used. If a pair falls below its
          minimum, the build fails. CI also checks that the palettes stay
          distinct for color-blind users.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Every foreground is checked against each surface it can sit on,
          including hover, pressed and translucent states. If a brand or status
          label can&rsquo;t reach its minimum, Nexus shifts that fill&rsquo;s
          shade. Otherwise the fill keeps the brand color you chose.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:typography-label-default">
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
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {tier.pair}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small nx:whitespace-nowrap">
                    Lc {tier.lc}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
                    {tier.covers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Contrast setting ────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Contrast setting
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The <code>lightContrast</code> and <code>darkContrast</code> fields in{' '}
          <Link
            href="/theming/appearance#contrast"
            className="nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2"
          >
            Appearance
          </Link>{' '}
          raise the minimums as they go from <code>0</code> to <code>100</code>.
          When a target can&rsquo;t be reached, Nexus uses the highest contrast
          possible. The minimums at <code>0</code> always apply.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Target</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">At 0</th>
                <th className="nx:py-2 nx:font-semibold">At 100</th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST_RANGES.map((row) => (
                <tr
                  key={row.target}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3">{row.target}</td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {row.low}
                  </td>
                  <td className="nx:py-2 nx:font-mono nx:typography-label-small">
                    {row.high}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section>
        <SectionHeading className="nx:typography-heading-small nx:mb-4">
          How it works
        </SectionHeading>
        <ol className="nx:flex nx:flex-col nx:gap-3 nx:max-w-[64ch]">
          {[
            {
              step: 'Store hex',
              body: 'Tokens live as hex on disk.',
            },
            {
              step: 'Convert to OKLCH',
              body: 'At build time, every hex value becomes an oklch(…) value in the CSS.',
            },
            {
              step: 'Pin the lightness',
              body: 'Each shade’s lightness is set from a perceptual grid. The neutral palettes share one grid. Each chromatic hue follows its own curve and takes the most vivid chroma Display-P3 allows.',
            },
            {
              step: 'Gate with APCA',
              body: 'Every foreground and background pair is scored with APCA. A failing pair blocks the build.',
            },
          ].map((item, i) => (
            <li
              key={item.step}
              className="nx:flex nx:gap-3 nx:rounded-md nx:border nx:border-border-default nx:bg-container nx:p-4"
            >
              <span className="nx:typography-label-default nx:font-mono nx:text-muted-foreground-subtle">
                {i + 1}
              </span>
              <div>
                <div className="nx:typography-label-default nx:font-semibold">
                  {item.step}
                </div>
                <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-0.5">
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
