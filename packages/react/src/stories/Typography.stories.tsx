import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import {
  tokenValue,
  useRuntimeTokenValues,
} from './support/runtime-token-values';
import { COMPOSITE_UTILITIES } from './support/typography-utilities';

const SIZE_KEYS = [
  'xxs',
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

type FamilyKey = (typeof FAMILY_KEYS)[number];

const SIZE_TOKEN_NAMES = SIZE_KEYS.map((key) => `--nx-typography-size-${key}`);
const WEIGHT_TOKEN_NAMES = WEIGHT_KEYS.map(
  (key) => `--nx-typography-weight-${key}`
);
const FAMILY_TOKEN_NAMES = FAMILY_KEYS.map(
  (key) => `--nx-typography-family-${key}`
);
const LINE_HEIGHT_TOKEN_NAMES = LINE_HEIGHT_DISPLAY_KEYS.map(
  (key) => `--nx-typography-line-height-${key}`
);
const LINE_HEIGHT_RUNTIME_TOKEN_NAMES = [
  ...SIZE_TOKEN_NAMES,
  ...LINE_HEIGHT_TOKEN_NAMES,
];

const SCALE_SAMPLE = 'Aa Bb 12';
const WEIGHT_SAMPLE = 'The quick brown fox';
const LINE_HEIGHT_SAMPLE =
  'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.';
const FAMILY_SAMPLE = 'The quick brown fox jumps over the lazy dog. 0123456789';
const FAMILY_LABEL: Record<FamilyKey, string> = {
  'font-sans': 'System UI',
  'font-serif': 'Georgia',
  'font-mono': 'System mono',
};

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

function ScaleStory() {
  const values = useRuntimeTokenValues(SIZE_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Size Scale
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Live `--nx-typography-size-*` primitives applied via `font-size` to a
          short sample.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {SIZE_KEYS.map((key) => {
          const name = `--nx-typography-size-${key}`;
          return (
            <TokenRow
              key={key}
              label={key}
              value={tokenValue(values, name)}
              preview={
                <span
                  className="nx:text-foreground"
                  style={{
                    fontSize: `var(${name})`,
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
  );
}

function WeightsStory() {
  const values = useRuntimeTokenValues(WEIGHT_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Weights
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Live weight tokens map descriptive names (thin ... black) to numeric
          weights, rendered in `font-sans`.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {WEIGHT_KEYS.map((key) => {
          const name = `--nx-typography-weight-${key}`;
          return (
            <TokenRow
              key={key}
              label={key}
              value={tokenValue(values, name)}
              labelWidth="nx:w-24"
              valueWidth="nx:w-12"
              preview={
                <span
                  className="nx:text-foreground"
                  style={{ fontSize: 22, fontWeight: `var(${name})` }}
                >
                  {WEIGHT_SAMPLE}
                </span>
              }
            />
          );
        })}
      </section>
    </div>
  );
}

function LineHeightsStory() {
  const values = useRuntimeTokenValues(LINE_HEIGHT_RUNTIME_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Line Heights
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Line-height tokens pair with size tokens by key. Showing `xs` through
          `2xl` — the readable body range where rhythm matters most.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {LINE_HEIGHT_DISPLAY_KEYS.map((key) => {
          const sizeName = `--nx-typography-size-${key}`;
          const lineHeightName = `--nx-typography-line-height-${key}`;
          return (
            <TokenRow
              key={key}
              label={key}
              value={`${tokenValue(values, sizeName)} / ${tokenValue(values, lineHeightName)}`}
              labelWidth="nx:w-12"
              valueWidth="nx:w-32"
              alignStart={true}
              preview={
                <p
                  className="nx:text-foreground nx:max-w-md"
                  style={{
                    fontSize: `var(${sizeName})`,
                    lineHeight: `var(${lineHeightName})`,
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
  );
}

function FontFamiliesStory() {
  const values = useRuntimeTokenValues(FAMILY_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Font Families
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Live font family variables. Storybook can change sans and mono through
          the Appearance controls without reloading the story.
        </p>
      </div>
      <section className="nx:flex nx:flex-col">
        {FAMILY_KEYS.map((key) => {
          const name = `--nx-typography-family-${key}`;
          return (
            <TokenRow
              key={key}
              label={key}
              value={FAMILY_LABEL[key]}
              labelWidth="nx:w-24"
              valueWidth="nx:w-32"
              preview={
                <span
                  className="nx:text-foreground"
                  title={tokenValue(values, name)}
                  style={{
                    fontSize: 18,
                    fontFamily: `var(${name})`,
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
          'Typography tokens — sizes, weights, line-heights, and font families — plus the composite `nx:typography-*` utilities. Stories render live CSS variables from the active Nexus Appearance provider.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => <ScaleStory />,
};

export const Weights: Story = {
  render: () => <WeightsStory />,
};

export const LineHeights: Story = {
  render: () => <LineHeightsStory />,
};

export const FontFamilies: Story = {
  render: () => <FontFamiliesStory />,
};

export const CompositeUtilities: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Composite Utilities
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          The ready-to-use `nx:typography-*` classes — each bundles font-family,
          size, weight, line-height, and letter-spacing (body tiers also get
          `text-wrap: pretty`). Prefer these over composing raw size/weight
          utilities so every consumer stays consistent.
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
};

export const HeadingsBalance: Story = {
  render: () => (
    <h2
      data-testid="balanced-heading"
      className="nx:typography-heading-large"
      style={{ inlineSize: '18rem' }}
    >
      A deliberately long heading that wraps onto multiple lines
    </h2>
  ),
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector<HTMLElement>(
      '[data-testid="balanced-heading"]'
    );
    const style = getComputedStyle(heading!);
    const wrap =
      style.getPropertyValue('text-wrap-style') ||
      style.getPropertyValue('text-wrap');

    await expect(wrap).toContain('balance');
  },
};
