import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import typographyVega from '../../../core/tokens/primitives/typography/typography-vega.json';
import typographyStyles from '../../../core/tokens/styles/typography.json';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type FontFamilyToken = { $value: string; $type: string };
type FontWeightToken = { $value: number; $type: string };

const SIZE_KEYS = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
] as const;
const WEIGHT_KEYS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as const;
const FAMILY_KEYS = ['font-sans', 'font-serif', 'font-mono'] as const;
const LINE_HEIGHT_DISPLAY_KEYS = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
] as const;

type SizeKey = (typeof SIZE_KEYS)[number];
type WeightKey = (typeof WEIGHT_KEYS)[number];
type FamilyKey = (typeof FAMILY_KEYS)[number];
type LetterspacingKey =
  | 'tighter'
  | 'tight'
  | 'normal'
  | 'wide'
  | 'wider'
  | 'widest';

type TypographyTokenSet = {
  family: Record<FamilyKey, FontFamilyToken>;
  size: Record<SizeKey, DimensionToken>;
  weight: Record<WeightKey, FontWeightToken>;
  'line-height': Record<SizeKey, DimensionToken>;
  letterspacing: Record<LetterspacingKey, DimensionToken>;
};

const VEGA = typographyVega satisfies TypographyTokenSet;

// Full literal class strings so Tailwind's content scanner emits each utility
// (v4 tree-shakes @utility classes not referenced as static literals).
const COMPOSITE_UTILITIES: {
  group: string;
  items: { cls: string; sample: string }[];
}[] = [
  {
    group: 'Heading',
    items: [
      { cls: 'nx:typography-heading-large', sample: 'Heading Large' },
      { cls: 'nx:typography-heading-medium', sample: 'Heading Medium' },
      { cls: 'nx:typography-heading-small', sample: 'Heading Small' },
      { cls: 'nx:typography-heading-xsmall', sample: 'Heading XSmall' },
    ],
  },
  {
    group: 'Body',
    items: [
      {
        cls: 'nx:typography-body-default',
        sample: 'The quick brown fox jumps over the lazy dog.',
      },
      {
        cls: 'nx:typography-body-small',
        sample: 'The quick brown fox jumps over the lazy dog.',
      },
    ],
  },
  {
    group: 'Label',
    items: [
      { cls: 'nx:typography-label-default', sample: 'Label Default' },
      { cls: 'nx:typography-label-small', sample: 'Label Small' },
      { cls: 'nx:typography-label-caps', sample: 'LABEL CAPS' },
    ],
  },
  {
    group: 'Code',
    items: [
      {
        cls: 'nx:typography-code-block',
        sample: 'const sum = (a, b) => a + b;',
      },
      { cls: 'nx:typography-code-inline', sample: 'useState<T>()' },
    ],
  },
];

// The literal class strings above can't be derived (Tailwind's content scanner
// only emits @utility classes referenced as static literals — v4 tree-shakes the
// rest), so they're a hand-maintained parallel to the typography.json source of
// truth. Derive the expected set from that source and assert parity in the
// CompositeUtilities play function below, so a token add/rename can't silently
// desync the specimen.
const EXPECTED_UTILITY_CLASSES = Object.entries(
  typographyStyles as Record<string, Record<string, unknown>>
)
  .filter(([tier]) => !tier.startsWith('$'))
  .flatMap(([tier, group]) =>
    Object.keys(group)
      .filter((name) => !name.startsWith('$'))
      .map((name) => `nx:typography-${tier}-${name}`)
  )
  .sort();

const SCALE_SAMPLE = 'Aa Bb 12';
const WEIGHT_SAMPLE = 'The quick brown fox';
const LINE_HEIGHT_SAMPLE =
  'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.';
const FAMILY_SAMPLE = 'The quick brown fox jumps over the lazy dog. 0123456789';

function formatDimension(d: Dimension) {
  return `${d.value}${d.unit}`;
}

function TokenRow({
  label,
  value,
  preview,
  labelWidth = 'nx:w-12',
  valueWidth = 'nx:w-20',
  alignStart = false,
}: {
  label: string;
  value: string;
  preview: React.ReactNode;
  labelWidth?: string;
  valueWidth?: string;
  alignStart?: boolean;
}) {
  const align = alignStart ? 'nx:items-start' : 'nx:items-baseline';
  return (
    <div className={`nx:flex ${align} nx:gap-6 nx:py-1`}>
      <span
        className={`${labelWidth} nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono`}
      >
        {label}
      </span>
      <span
        className={`${valueWidth} nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono`}
      >
        {value}
      </span>
      {preview}
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Typography tokens — sizes, weights, line-heights, and font families — plus the composite `nx:typography-*` utilities. The system ships a single type scale.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Size Scale
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Raw `--nx-typography-size-*` primitives applied via `font-size` to a
          short sample.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {SIZE_KEYS.map((sk) => {
          const dim = VEGA.size[sk].$value;
          return (
            <TokenRow
              key={sk}
              label={sk}
              value={formatDimension(dim)}
              preview={
                <span
                  className="nx:text-foreground"
                  style={{
                    fontSize: `${dim.value}${dim.unit}`,
                    lineHeight: 1,
                  }}
                >
                  {SCALE_SAMPLE}
                </span>
              }
            />
          );
        })}
      </section>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Weights
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Weight tokens map descriptive names (thin … black) to numeric weights
          (100 … 900), rendered in `font-sans`.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {WEIGHT_KEYS.map((wk) => {
          const weight = VEGA.weight[wk].$value;
          return (
            <TokenRow
              key={wk}
              label={wk}
              value={String(weight)}
              labelWidth="nx:w-24"
              valueWidth="nx:w-12"
              preview={
                <span
                  className="nx:text-foreground"
                  style={{ fontSize: 22, fontWeight: weight }}
                >
                  {WEIGHT_SAMPLE}
                </span>
              }
            />
          );
        })}
      </section>
    </div>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Line Heights
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Line-height tokens pair with size tokens by key. Each row shows the
          paired size and line-height (in px), then a paragraph rendered at that
          combination. Showing `xs` through `2xl` — the readable body range
          where line-height rhythm matters most.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {LINE_HEIGHT_DISPLAY_KEYS.map((sk) => {
          const size = VEGA.size[sk].$value;
          const lineHeight = VEGA['line-height'][sk].$value;
          return (
            <TokenRow
              key={sk}
              label={sk}
              value={`${size.value}/${lineHeight.value}`}
              labelWidth="nx:w-12"
              valueWidth="nx:w-16"
              alignStart={true}
              preview={
                <p
                  className="nx:text-foreground nx:max-w-md"
                  style={{
                    fontSize: `${size.value}${size.unit}`,
                    lineHeight: `${lineHeight.value}${lineHeight.unit}`,
                  }}
                >
                  {LINE_HEIGHT_SAMPLE}
                </p>
              }
            />
          );
        })}
      </section>
    </div>
  ),
};

export const FontFamilies: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Font Families
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Sans, serif, and mono font families — Inter, Georgia, and JetBrains
          Mono.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {FAMILY_KEYS.map((fk) => {
          const family = VEGA.family[fk].$value;
          return (
            <TokenRow
              key={fk}
              label={fk}
              value={family}
              labelWidth="nx:w-24"
              valueWidth="nx:w-32"
              preview={
                <span
                  className="nx:text-foreground"
                  style={{
                    fontSize: 18,
                    fontFamily: `'${family}', system-ui, sans-serif`,
                  }}
                >
                  {FAMILY_SAMPLE}
                </span>
              }
            />
          );
        })}
      </section>
    </div>
  ),
};

export const CompositeUtilities: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Composite Utilities
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          The 11 ready-to-use `nx:typography-*` classes — each bundles
          font-family, size, weight, line-height, and letter-spacing (body tiers
          also get `text-wrap: pretty`). Prefer these over composing raw
          size/weight utilities so every consumer stays consistent.
        </p>
      </div>
      {COMPOSITE_UTILITIES.map(({ group, items }) => (
        <section key={group} className="nx:flex nx:flex-col nx:gap-3">
          <h3 className="nx:text-foreground nx:typography-heading-xsmall">
            {group}
          </h3>
          <div className="nx:flex nx:flex-col">
            {items.map(({ cls, sample }) => (
              <div
                key={cls}
                className="nx:flex nx:items-baseline nx:gap-6 nx:py-1.5"
              >
                <span className="nx:w-56 nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono">
                  {cls}
                </span>
                <span className={`nx:text-foreground ${cls}`}>{sample}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  // Lock the hand-maintained literal list to the typography.json source of truth.
  play: async () => {
    const rendered = COMPOSITE_UTILITIES.flatMap((g) =>
      g.items.map((i) => i.cls)
    ).sort();
    await expect(rendered).toEqual(EXPECTED_UTILITY_CLASSES);
  },
};
