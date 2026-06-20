import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Typography. Server component — a live specimen of the type
 * scale (every `typography-*` tier rendered at size), the three scale modes,
 * the type families, and the letter-spacing / text-wrap rules.
 *
 * The tier classes are stored as full literal strings so Tailwind's scanner
 * emits them; the composites also ship wholesale via @nexus/tailwind. Swap the
 * Typography control in the theme picker to see the scale re-render live.
 *
 * Source: .claude/rules/tokens.md § Typography.
 */

const SCALE: {
  group: string;
  tiers: { cls: string; name: string; sample: string }[];
}[] = [
  {
    group: 'Heading',
    tiers: [
      {
        cls: 'nx:typography-heading-large',
        name: 'heading-large',
        sample: 'Across five bases',
      },
      {
        cls: 'nx:typography-heading-medium',
        name: 'heading-medium',
        sample: 'One source of truth',
      },
      {
        cls: 'nx:typography-heading-small',
        name: 'heading-small',
        sample: 'For humans and agents',
      },
      {
        cls: 'nx:typography-heading-xsmall',
        name: 'heading-xsmall',
        sample: 'Tokens, not guesswork',
      },
    ],
  },
  {
    group: 'Body',
    tiers: [
      {
        cls: 'nx:typography-body-default',
        name: 'body-default',
        sample:
          'Body-default is the workhorse reading size for documentation prose, with text-wrap: pretty to guard against orphans and widows.',
      },
      {
        cls: 'nx:typography-body-small',
        name: 'body-small',
        sample:
          'Body-small carries supporting copy, captions, and the secondary text under a heading.',
      },
    ],
  },
  {
    group: 'Label',
    tiers: [
      {
        cls: 'nx:typography-label-default',
        name: 'label-default',
        sample: 'Label default',
      },
      {
        cls: 'nx:typography-label-small',
        name: 'label-small',
        sample: 'Label small',
      },
      {
        cls: 'nx:typography-label-caps',
        name: 'label-caps',
        sample: 'Label caps',
      },
    ],
  },
];

const MODES: { mode: string; archetype: string; use: string }[] = [
  {
    mode: 'nova',
    archetype: 'Tool / dense',
    use: 'Dashboards, data-heavy UIs (Figma / Linear density)',
  },
  {
    mode: 'vega ★',
    archetype: 'Standard product',
    use: 'SaaS and consumer apps — the recommended default, bundled mode',
  },
  {
    mode: 'maia',
    archetype: 'Editorial / document',
    use: 'Reading-focused UIs, document editors (Notion density)',
  },
];

const FAMILIES: {
  name: string;
  role: string;
  sample: string;
  cls?: string;
  style?: React.CSSProperties;
}[] = [
  {
    name: 'Inter',
    role: 'Sans — UI, headings, body',
    sample: 'The quick brown fox jumps over the lazy dog',
  },
  {
    name: 'Georgia',
    role: 'Serif — editorial accents',
    sample: 'The quick brown fox jumps over the lazy dog',
    style: { fontFamily: 'Georgia, "Times New Roman", serif' },
  },
  {
    name: 'JetBrains Mono',
    role: 'Mono — code, token names, labels',
    sample: 'const token = "--nx-color-primary-background"',
    cls: 'nx:font-mono',
  },
];

export function Typography() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Typography' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Typography</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        One scale, three densities. Every tier is a composite utility — size,
        weight, line-height, and letter-spacing in one class — built on Inter,
        with Georgia for editorial accents and JetBrains Mono for code. The
        three modes differ only by scale, so swapping density never changes the
        typeface. Open the Typography control in the theme picker (bottom-right)
        and watch the whole specimen below re-render.
      </p>

      {/* ── The scale ───────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">The scale</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-6 nx:max-w-[64ch]">
          Eleven tiers across four groups, every one at normal (0)
          letter-spacing — the lone exception is label-caps, which adds +0.8px
          for all-caps legibility.
        </p>
        {SCALE.map((group) => (
          <div key={group.group} className="nx:mb-8">
            <h3 className="nx:typography-label-caps nx:text-muted-foreground-subtle nx:mb-4">
              {group.group}
            </h3>
            <div className="nx:flex nx:flex-col">
              {group.tiers.map((t) => (
                <div
                  key={t.name}
                  className="nx:flex nx:flex-col nx:gap-1 nx:border-b nx:border-border-default nx:py-4"
                >
                  <span className={t.cls}>{t.sample}</span>
                  <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Code tiers ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Code</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Two monospace tiers — inline spans and fenced blocks.
        </p>
        <p className="nx:typography-body-default nx:mb-4">
          Reference a token inline with{' '}
          <code className="nx:typography-code-inline">
            --nx-color-primary-background
          </code>{' '}
          in running prose.
        </p>
        <pre className="nx:typography-code-block nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-4 nx:overflow-x-auto">
          {`import { Button } from '@nexus/react';

<Button variant="secondary">Ship it</Button>`}
        </pre>
      </section>

      {/* ── Three modes ─────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Three modes</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Each mode maps the same tiers to a product archetype, differing by a
          uniform step per size. They share Inter / Georgia / JetBrains Mono —
          only the scale changes.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:text-sm">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Mode</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Archetype</th>
                <th className="nx:py-2 nx:font-semibold">Use for</th>
              </tr>
            </thead>
            <tbody>
              {MODES.map((m) => (
                <tr
                  key={m.mode}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-xs nx:capitalize">
                    {m.mode}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground">
                    {m.archetype}
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

      {/* ── Families ────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Families</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Three typefaces, shared across every mode.
        </p>
        <div className="nx:flex nx:flex-col nx:gap-4">
          {FAMILIES.map((f) => (
            <div
              key={f.name}
              className="nx:rounded-lg nx:border nx:border-border-default nx:p-4"
            >
              <div className="nx:flex nx:items-baseline nx:justify-between nx:mb-2">
                <span className="nx:typography-heading-xsmall">{f.name}</span>
                <span className="nx:font-mono nx:text-xs nx:text-muted-foreground-subtle">
                  {f.role}
                </span>
              </div>
              <p className={f.cls ?? 'nx:text-lg'} style={f.style}>
                {f.sample}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
