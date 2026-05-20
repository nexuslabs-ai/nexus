import type { Meta, StoryObj } from '@storybook/react';

import { themeOnlyModes } from '@/storybook/modes';

import typographyLyra from '../../../core/tokens/primitives/typography/typography-lyra.json';
import typographyMaia from '../../../core/tokens/primitives/typography/typography-maia.json';
import typographyMira from '../../../core/tokens/primitives/typography/typography-mira.json';
import typographyNova from '../../../core/tokens/primitives/typography/typography-nova.json';
import typographyVega from '../../../core/tokens/primitives/typography/typography-vega.json';

const BUNDLED_TYPOGRAPHY_MODE = 'vega';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type FontFamilyToken = { $value: string; $type: string };
type FontWeightToken = { $value: number; $type: string };

type TypographyTokenSet = {
  family: Record<string, FontFamilyToken>;
  size: Record<string, DimensionToken>;
  weight: Record<string, FontWeightToken>;
  'line-height': Record<string, DimensionToken>;
  letterspacing: Record<string, DimensionToken>;
};

const VEGA = typographyVega as TypographyTokenSet;

const TYPOGRAPHY_MODES: { name: string; tokens: TypographyTokenSet }[] = [
  { name: 'vega', tokens: VEGA },
  { name: 'lyra', tokens: typographyLyra as TypographyTokenSet },
  { name: 'maia', tokens: typographyMaia as TypographyTokenSet },
  { name: 'mira', tokens: typographyMira as TypographyTokenSet },
  { name: 'nova', tokens: typographyNova as TypographyTokenSet },
];

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

function ModeSection({
  mode,
  bundled,
  children,
}: {
  mode: string;
  bundled: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="nx:flex nx:flex-col nx:gap-3">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {bundled && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Bundled
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-col">{children}</div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    chromatic: { modes: themeOnlyModes, delay: 300 },
    docs: {
      description: {
        component:
          'Typography primitive tokens — sizes, weights, line-heights, and font families. The bundled mode is the one @nexus/tailwind currently ships with — see packages/core/package.json#scripts.build:tailwind. Weights are identical across modes; font families currently match across modes, so families are shown for the bundled mode only.',
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
          short sample. Mode differences are subtle (often 1–2px shifts) —
          compare `xs` or `base` across modes to spot the pattern.
        </p>
      </div>
      {TYPOGRAPHY_MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_TYPOGRAPHY_MODE}
        >
          {SIZE_KEYS.map((sk) => {
            const dim = tokens.size[sk].$value;
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
        </ModeSection>
      ))}
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
          (100 … 900). These values are identical across all typography modes,
          so a single ramp is shown — rendered in the bundled `font-sans`.
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
      {TYPOGRAPHY_MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_TYPOGRAPHY_MODE}
        >
          {LINE_HEIGHT_DISPLAY_KEYS.map((sk) => {
            const size = tokens.size[sk].$value;
            const lineHeight = tokens['line-height'][sk].$value;
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
        </ModeSection>
      ))}
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
          Sans, serif, and mono font families. Showing the bundled mode only —
          all modes currently ship the same families (Inter / Georgia /
          JetBrains Mono). Rendering 5 modes with divergent fonts would require
          loading multiple Google Font payloads on this page.
        </p>
      </div>
      <ModeSection mode={BUNDLED_TYPOGRAPHY_MODE} bundled={true}>
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
      </ModeSection>
    </div>
  ),
};
