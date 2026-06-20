import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Typography. Server component — a live specimen of the type
 * scale (every `typography-*` tier rendered at size), the type families, and
 * the letter-spacing / text-wrap rules.
 *
 * The tier classes are stored as full literal strings so Tailwind's scanner
 * emits them; the composites also ship wholesale via @nexus/tailwind.
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

const FAMILIES: {
  name: string;
  role: string;
  sample: string;
  cls?: string;
  style?: React.CSSProperties;
}[] = [
  {
    name: 'System UI',
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
    name: 'System mono',
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
        One scale for the whole system. Every tier is a composite utility —
        size, weight, line-height, and letter-spacing in one class — built on
        the OS system font stack, with Georgia for editorial accents and the
        system monospace stack for code.
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

      {/* ── Families ────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">Families</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Three typefaces — one system.
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
