import type { ReactNode } from 'react';

import { cn } from '@nexus_ds/react/utils';
import Link from 'next/link';

import { SectionHeading, SubsectionHeading } from '../../_components/Heading';
import { InlineCode } from '../../_components/InlineCode';

/**
 * Getting Started → Why Nexus. Server component: the problems Nexus answers,
 * the one-engine pipeline, the theme axes, the contrast gate, the framework
 * port surface, the shadcn/ui comparison and what ships today.
 *
 * Sources: packages/core/src/index.ts, packages/core/src/lib/palette.ts
 * (TIER_THRESHOLDS), packages/core/tokens/, packages/eslint-plugin-nexus/src/rules/.
 */

const PROBLEMS: { problem: string; detail: string; answer: string }[] = [
  {
    problem: 'Adopting a library means rewriting your CSS config',
    detail:
      'Most libraries use unprefixed classes, so their theme has to join your Tailwind config. If your app already defines background or primary, you migrate before you render one button.',
    answer:
      'Every Nexus class starts with nx: and every variable with --nx-. Nexus styles apply only inside a Nexus root element, so your config and classes stay untouched.',
  },
  {
    problem: 'Theming lives inside the components',
    detail:
      'Contrast rules, hover shades and dark-mode logic get written into React components. A second framework means writing all of it again.',
    answer:
      'All theming lives in @nexus_ds/core, which has no framework code. Components only read the tokens it produces.',
  },
  {
    problem: 'Dark mode is a second theme, kept by hand',
    detail:
      'Two lists of colors get edited separately, and one is always out of date.',
    answer:
      'One function produces light and dark from the same inputs, so they never drift.',
  },
  {
    problem: 'Only color can be themed',
    detail:
      'Spacing, radius, shadow depth and border width are baked into components. Making a product denser becomes a refactor.',
    answer:
      'Density, corners, shadows, border width, type and motion are settings, just like color.',
  },
  {
    problem: 'Contrast is checked by eye',
    detail:
      'Nobody re-checks every text and background pair after a palette change, or in the surface tones they never use.',
    answer:
      'Every pair has a minimum score, and CI checks every pair across many themes. A failing pair fails the build.',
  },
  {
    problem: 'Copy-and-own forks the token layer',
    detail:
      'Owning component source is right. But when each app owns its own copy of the theme variables, the themes drift and no update path exists.',
    answer:
      'Components stay copy-and-own. The tokens come from a versioned npm package, so every app updates its theme the same way.',
  },
];

const AXES: { axis: string; field: string; options: string }[] = [
  {
    axis: 'Color',
    field: 'brandColor, surfaceTone, mode, contrast',
    options: 'Any brand color, five surface tones',
  },
  {
    axis: 'Density',
    field: 'density',
    options: 'tight, compact, default, comfortable, relaxed, spacious',
  },
  {
    axis: 'Corners',
    field: 'corners',
    options: 'square, subtle, smooth, round, extra-round',
  },
  {
    axis: 'Shadows',
    field: 'elevation',
    options: 'flat, quiet, soft, standard, strong',
  },
  { axis: 'Border width', field: 'stroke', options: 'fine, normal, strong' },
  {
    axis: 'Type and motion',
    field: 'prefs',
    options: 'Fonts, font sizes, reduced motion, cursors',
  },
];

const TIERS: { tier: string; minimum: string; covers: string }[] = [
  { tier: 'Body', minimum: 'Lc 75', covers: 'Reading text' },
  { tier: 'UI', minimum: 'Lc 60', covers: 'Labels, buttons, controls' },
  {
    tier: 'Incidental',
    minimum: 'Lc 45',
    covers: 'Muted text, disabled text, focus rings',
  },
];

const PORT: { concern: string; shared: string; perFramework: string }[] = [
  {
    concern: 'Token values',
    shared: 'Every axis: color, spacing, radius, shadow, border, motion',
    perFramework: 'Nothing',
  },
  {
    concern: 'Contrast',
    shared: 'The CI checks prove the values, not the components',
    perFramework: 'Nothing',
  },
  {
    concern: 'Appearance model',
    shared: 'State shape, validation, snapshots, first-paint script',
    perFramework: 'Nothing',
  },
  {
    concern: 'Token source',
    shared: 'DTCG JSON, readable by Style Dictionary, Swift and Kotlin tools',
    perFramework: 'A build target',
  },
  {
    concern: 'State binding',
    shared: 'None',
    perFramework: "A provider or store in the framework's own style",
  },
  {
    concern: 'Components',
    shared: 'Variants, data attributes, sizing and focus rules',
    perFramework: "Components built on the framework's headless primitives",
  },
];

const COMPARISON: { concern: string; shadcn: string; nexus: string }[] = [
  {
    concern: 'Class names',
    shadcn: 'bg-background',
    nexus: 'nx:bg-container',
  },
  {
    concern: 'Fitting into an existing app',
    shadcn: 'Its theme joins your Tailwind config',
    nexus: 'Scoped to a Nexus root; your config is untouched',
  },
  {
    concern: 'Who writes the tokens',
    shadcn: 'You, as CSS variables in each app',
    nexus: 'The engine, from one appearance object',
  },
  {
    concern: 'What you can theme',
    shadcn: 'Color and a radius variable',
    nexus: 'Color, density, corners, shadows, border width, type, motion',
  },
  {
    concern: 'Hover and pressed states',
    shadcn: 'hover:bg-primary/90',
    nexus: 'nx:hover:bg-primary-background-hover',
  },
  {
    concern: 'Status colors',
    shadcn: 'destructive',
    nexus: 'error, success, warning, information',
  },
  {
    concern: 'Contrast',
    shadcn: "The author's job",
    nexus: 'Checked in CI for every pair',
  },
  {
    concern: 'Conventions',
    shadcn: 'Docs and review',
    nexus: 'ESLint rules that fail the build',
  },
];

const KEEPS: { title: string; body: string }[] = [
  {
    title: 'Copy-and-own components.',
    body: 'You get the source and you can edit it.',
  },
  {
    title: 'Radix underneath.',
    body: 'Accessibility, focus management and portals come from Radix primitives.',
  },
  {
    title: 'CVA for variants.',
    body: 'Each variant maps to classes in one readable table.',
  },
  {
    title: 'asChild.',
    body: 'Composition instead of a polymorphic as prop.',
  },
];

const LINT_RULES: { rule: string; catches: string }[] = [
  {
    rule: 'nx-class-conventions',
    catches:
      'Wrong prefix order, removed tokens, incomplete token names and raw palette colors',
  },
  {
    rule: 'no-render-prop-types',
    catches: 'Props that inject what a component renders, instead of children',
  },
  {
    rule: 'no-multi-statement-jsx-handler',
    catches: 'Long inline event handlers that should be named functions',
  },
  {
    rule: 'canonical-spacing-steps',
    catches: 'Spacing values off the shared step scale',
  },
];

const BODY_CLASS =
  'nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]';
const SECTION_CLASS = 'nx:typography-heading-small nx:mb-1';
const SUBSECTION_CLASS =
  'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';
const TH_CLASS = 'nx:py-2 nx:pr-3 nx:font-semibold';
const TD_CLASS =
  'nx:py-2 nx:pr-3 nx:align-top nx:text-muted-foreground nx:typography-label-small';

function Stage({
  title,
  detail,
  emphasis,
  planned,
}: {
  title: string;
  detail: string;
  emphasis?: boolean;
  planned?: boolean;
}) {
  return (
    <p
      className={cn(
        'nx:flex-1 nx:rounded-md nx:border nx:p-3 nx:typography-label-small nx:text-muted-foreground',
        emphasis
          ? 'nx:border-primary-border nx:bg-primary-subtle'
          : 'nx:border-border-default nx:bg-container',
        planned && 'nx:border-dashed nx:bg-transparent'
      )}
    >
      <strong className="nx:block nx:mb-1 nx:typography-label-default nx:font-semibold nx:text-foreground">
        {title}.
      </strong>{' '}
      {detail}
    </p>
  );
}

/** One step of the pipeline. Every step after the first gets an arrow above it. */
function Step({ first, children }: { first?: boolean; children: ReactNode }) {
  return (
    <li className="nx:flex nx:flex-col nx:gap-2">
      {!first && (
        <span
          aria-hidden="true"
          className="nx:text-center nx:text-muted-foreground nx:typography-label-default"
        >
          ↓
        </span>
      )}
      <div className="nx:flex nx:flex-col nx:gap-2 nx:sm:flex-row">
        {children}
      </div>
    </li>
  );
}

export default function WhyNexus() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Why Nexus</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Nexus answers six problems that show up when a team adopts a design
        system. Each decision on this page traces back to one of them.
      </p>

      {/* ── Problems ────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>The problems</SectionHeading>
        <ol className="nx:flex nx:flex-col nx:gap-4 nx:mt-4">
          {PROBLEMS.map((item, index) => (
            <li
              key={item.problem}
              className="nx:grid nx:gap-2 nx:border-b nx:border-border-default nx:pb-4 nx:sm:grid-cols-2 nx:sm:gap-6"
            >
              <div>
                <p className="nx:typography-label-default nx:font-semibold">
                  {index + 1}. {item.problem}
                </p>
                <p className="nx:typography-body-small nx:text-muted-foreground nx:mt-1">
                  {item.detail}
                </p>
              </div>
              <p className="nx:typography-body-small">
                <span className="nx:font-semibold">Nexus: </span>
                {item.answer}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── One engine ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          One engine, two moments
        </SectionHeading>
        <p className={BODY_CLASS}>
          <InlineCode>deriveTheme()</InlineCode> is the only code that produces
          a token value. It runs once at build time to write the default theme
          into CSS. It runs again in the browser whenever the appearance
          changes.
        </p>
        <p className={BODY_CLASS}>
          Same function, same inputs, same output. The page looks right with
          JavaScript off, and a live theme change needs no rebuild.
        </p>
        <ol className="nx:flex nx:flex-col nx:gap-2 nx:my-6 nx:max-w-3xl">
          <Step first>
            <Stage
              title="Token sources"
              detail="DTCG JSON for color, spacing, radius, shadow, border and motion."
            />
            <Stage
              title="Appearance state"
              detail="Brand color, surface tone, mode, density and the other fields."
            />
          </Step>
          <Step>
            <Stage
              emphasis
              title="deriveTheme() in @nexus_ds/core"
              detail="Builds the palettes, picks each surface shade and checks contrast. No DOM, no framework."
            />
          </Step>
          <Step>
            <Stage
              title="Build time"
              detail="Default values written into nexus.css."
            />
            <Stage
              title="Runtime"
              detail="CSS variables the provider writes when the appearance changes."
            />
          </Step>
          <Step>
            <Stage
              title="nx: utilities"
              detail="One set of classes that reads whichever value is present."
            />
          </Step>
          <Step>
            <Stage
              title="React components"
              detail="Ships today, as copy-and-own source."
            />
            <Stage
              planned
              title="Vue, Svelte, Angular"
              detail="Planned. A binding, not a second design system."
            />
            <Stage
              planned
              title="React Native and native apps"
              detail="Planned. Read the token map or the DTCG files directly."
            />
          </Step>
        </ol>
        <p className={BODY_CLASS}>
          Tokens come in three layers. Primitives are raw values, like a spacing
          step. Semantic tokens name a role, like{' '}
          <InlineCode>primary-background</InlineCode>. Utilities are the{' '}
          <InlineCode>nx:</InlineCode> classes components use. A component that
          skips the semantic layer and uses a primitive fails lint.
        </p>
      </section>

      {/* ── Axes ────────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          Every axis is a setting
        </SectionHeading>
        <p className={BODY_CLASS}>
          Each axis is a field in{' '}
          <Link href="/theming/appearance" className={LINK_CLASS}>
            Appearance
          </Link>
          . All the options ship in the stylesheet, so switching one is an
          attribute change, not a rebuild.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className={TH_CLASS}>Axis</th>
                <th className={TH_CLASS}>Field</th>
                <th className={TH_CLASS}>Options</th>
              </tr>
            </thead>
            <tbody>
              {AXES.map((row) => (
                <tr
                  key={row.axis}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:align-top">{row.axis}</td>
                  <td className={cn(TD_CLASS, 'nx:font-mono')}>{row.field}</td>
                  <td className={TD_CLASS}>{row.options}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Contrast ────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          Contrast you don&rsquo;t have to check
        </SectionHeading>
        <p className={BODY_CLASS}>
          Nexus scores contrast with APCA (a perceptual contrast score), not
          WCAG 2 ratios. WCAG 2 ratios misjudge the mid-tone pairs a token
          system produces all the time.
        </p>
        <p className={BODY_CLASS}>
          Each text and background pair belongs to a tier with a minimum score.
          CI derives themes across many brand colors, surface tones and contrast
          settings, then checks every pair in each one. If any pair falls below
          its minimum, the build fails.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className={TH_CLASS}>Tier</th>
                <th className={TH_CLASS}>Minimum</th>
                <th className={TH_CLASS}>Covers</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((row) => (
                <tr
                  key={row.tier}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3">{row.tier}</td>
                  <td className={cn(TD_CLASS, 'nx:font-mono')}>
                    {row.minimum}
                  </td>
                  <td className={TD_CLASS}>{row.covers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:max-w-[64ch]">
          For the full list of pairs and how the Contrast setting raises them,
          see{' '}
          <Link href="/foundations/color" className={LINK_CLASS}>
            Color
          </Link>
          .
        </p>
      </section>

      {/* ── Frameworks ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          One token system, many frameworks
        </SectionHeading>
        <p className={BODY_CLASS}>
          Nexus is built so that adding Vue, Svelte, Angular or React Native
          means writing a binding, not a second design system.
        </p>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Why the engine ports
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          <InlineCode>@nexus_ds/core</InlineCode> imports no framework and
          touches no DOM. It turns appearance state into token values. Two
          functions are the whole surface another framework needs:
        </p>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            <InlineCode>deriveTheme()</InlineCode> returns the light and dark
            token maps.
          </li>
          <li>
            <InlineCode>themeToCss()</InlineCode> turns those maps into CSS.
          </li>
        </ul>
        <p className={BODY_CLASS}>
          An app that styles itself without CSS, like a React Native app, reads
          the token map directly. Every framework gets the same values, so a
          React app and a Vue app in one product render the same gray.
        </p>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          What a new framework gets and what it builds
        </SubsectionHeading>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[640px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className={TH_CLASS}>Concern</th>
                <th className={TH_CLASS}>Shared by every framework</th>
                <th className={TH_CLASS}>Built per framework</th>
              </tr>
            </thead>
            <tbody>
              {PORT.map((row) => (
                <tr
                  key={row.concern}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:align-top">
                    {row.concern}
                  </td>
                  <td className={TD_CLASS}>{row.shared}</td>
                  <td className={TD_CLASS}>{row.perFramework}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── shadcn ──────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          Nexus and shadcn/ui
        </SectionHeading>
        <p className={BODY_CLASS}>
          Nexus takes shadcn/ui&rsquo;s best idea, that you own the component
          source. It replaces shadcn/ui&rsquo;s token model.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[640px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className={TH_CLASS}>Concern</th>
                <th className={TH_CLASS}>shadcn/ui</th>
                <th className={TH_CLASS}>Nexus</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr
                  key={row.concern}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:align-top">
                    {row.concern}
                  </td>
                  <td className={TD_CLASS}>{row.shadcn}</td>
                  <td className={TD_CLASS}>{row.nexus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          What Nexus keeps
        </SubsectionHeading>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          {KEEPS.map((item) => (
            <li key={item.title}>
              <span className="nx:font-semibold">{item.title}</span> {item.body}
            </li>
          ))}
        </ul>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          When shadcn/ui is the better choice
        </SubsectionHeading>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            <span className="nx:font-semibold">One app, one theme.</span> A
            theme engine is overhead you won&rsquo;t get back.
          </li>
          <li>
            <span className="nx:font-semibold">You want the ecosystem.</span>{' '}
            Most community blocks and registries target shadcn/ui&rsquo;s token
            names.
          </li>
          <li>
            <span className="nx:font-semibold">You need a screen today.</span>{' '}
            Nexus asks you to adopt its token conventions first.
          </li>
        </ul>
        <p className={BODY_CLASS}>
          Nexus pays off when you have several products, several frameworks, an
          existing app with its own CSS, or a brand that changes per customer.
        </p>
      </section>

      {/* ── Enforcement ─────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          Conventions that fail the build
        </SectionHeading>
        <p className={BODY_CLASS}>
          The Nexus ESLint rules turn written conventions into errors. Add them
          to your own app with <InlineCode>@nexus_ds/eslint-plugin</InlineCode>.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className={TH_CLASS}>Rule</th>
                <th className={TH_CLASS}>Catches</th>
              </tr>
            </thead>
            <tbody>
              {LINT_RULES.map((row) => (
                <tr
                  key={row.rule}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:align-top nx:font-mono nx:typography-label-small">
                    {row.rule}
                  </td>
                  <td className={TD_CLASS}>{row.catches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:max-w-[64ch]">
          Every component story is also a test. It runs in a real browser and
          gets an automatic accessibility check.
        </p>
      </section>

      {/* ── Status ──────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          What exists today
        </SectionHeading>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            <span className="nx:font-semibold">Ships:</span> the engine,{' '}
            <InlineCode>@nexus_ds/core</InlineCode> on npm, and the React
            components as copy-and-own source.
          </li>
          <li>
            <span className="nx:font-semibold">Planned:</span> Vue, Svelte,
            Angular and React Native bindings. The engine has no framework code
            to untangle first, which is usually the expensive part.
          </li>
          <li>
            <span className="nx:font-semibold">Native platforms:</span> the
            tokens are DTCG JSON, so Swift and Kotlin output is a Style
            Dictionary build target. Live theme changes on native would need a
            port of the engine.
          </li>
        </ul>
        <p className={BODY_CLASS}>
          Ready to start?{' '}
          <Link href="/getting-started/install" className={LINK_CLASS}>
            Install Nexus
          </Link>
          .
        </p>
      </section>
    </>
  );
}
