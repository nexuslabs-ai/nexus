import {
  adjustContrast,
  type AdjustContrastOptions,
  type AdjustContrastPalette,
  type AdjustContrastTier,
  PALETTE_KEYS,
  TIER_THRESHOLDS,
} from '@nexus/core';
import type { Meta, StoryObj } from '@storybook/react';

const TIERS = Object.keys(TIER_THRESHOLDS) as AdjustContrastTier[];
const PALETTES: AdjustContrastPalette[] = [...PALETTE_KEYS];

const SHOWCASE_INPUTS: { hex: string; label: string }[] = [
  { hex: '#ff6b6b', label: 'Brand red' },
  { hex: '#4dabf7', label: 'Brand blue' },
  { hex: '#51cf66', label: 'Brand green' },
  { hex: '#ffd43b', label: 'Brand yellow' },
  { hex: '#cc5de8', label: 'Brand purple' },
  { hex: '#888888', label: 'Achromatic gray' },
];

interface DemoArgs extends Required<AdjustContrastOptions> {
  input: string;
}

type AdjustResult = { ok: true; value: string } | { ok: false; error: string };

function safeAdjust(
  input: string,
  options: AdjustContrastOptions
): AdjustResult {
  try {
    return { ok: true, value: adjustContrast(input, options) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

function Swatch({
  label,
  color,
  borderTone = 'default',
}: {
  label: string;
  color: string;
  borderTone?: 'default' | 'subtle';
}) {
  return (
    <div className="nx:flex nx:flex-col nx:gap-1">
      <div
        className={
          borderTone === 'subtle'
            ? 'nx:rounded-md nx:border nx:border-border-default nx:h-16 nx:w-32'
            : 'nx:rounded-md nx:border-2 nx:border-border-default nx:h-16 nx:w-32'
        }
        style={{ backgroundColor: color }}
      />
      <span className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {label}
      </span>
    </div>
  );
}

function ResultRow({
  input,
  surface,
  surfaceLabel,
  tier,
  palette,
}: {
  input: string;
  surface: string;
  surfaceLabel: string;
  tier: AdjustContrastTier;
  palette: AdjustContrastPalette;
}) {
  const result = safeAdjust(input, { background: surface, tier, palette });
  const textColor = result.ok ? result.value : '#888';
  return (
    <div
      className="nx:flex nx:items-center nx:gap-4 nx:rounded-md nx:border nx:border-border-default nx:p-4"
      style={{ backgroundColor: surface }}
    >
      <div className="nx:min-w-32">
        <p
          className="nx:typography-body-small nx:font-semibold"
          style={{ color: textColor }}
        >
          {result.ok ? 'Sample label' : '⚠ no shade passes'}
        </p>
        <p
          className="nx:typography-label-small nx:font-mono"
          style={{ color: textColor }}
        >
          {result.ok ? result.value : tier}
        </p>
      </div>
      <div className="nx:ml-auto nx:flex nx:flex-col nx:items-end nx:gap-0">
        <span className="nx:typography-label-small nx:font-mono nx:opacity-60">
          {surfaceLabel}
        </span>
        <span className="nx:typography-label-small nx:font-mono nx:opacity-60">
          tier={tier}
        </span>
      </div>
    </div>
  );
}

const meta: Meta<DemoArgs> = {
  title: 'Utilities/Adjust Contrast',
  parameters: {
    layout: 'fullscreen',
    // This demo snaps colors to APCA tiers (the Nexus contrast gate); the ui
    // and incidental tiers intentionally render below axe's WCAG-2 4.5:1 ratio,
    // so the WCAG-2 color-contrast check is the wrong gate here.
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          "Snap any CSS color to the nearest Nexus palette shade that passes the requested APCA tier on a target surface. Lightness comes from the perceptual L grid; hue and chroma flow through from the input (or, for achromatic inputs, from the chosen palette's shade 500). Walks shades 50 → 950 and returns the first that meets the tier. Source: packages/core/src/lib/adjust-contrast.ts.",
      },
    },
  },
  argTypes: {
    input: {
      control: 'color',
      description: 'Any CSS color string (hex, rgb, oklch, hsl)',
    },
    tier: {
      control: { type: 'inline-radio' },
      options: TIERS,
      description: 'APCA contrast tier',
    },
    palette: {
      control: { type: 'select' },
      options: PALETTES,
      description: 'Fallback hue/chroma for achromatic inputs',
    },
    background: {
      control: 'color',
      description: 'Target surface color',
    },
  },
  args: {
    input: '#ff6b6b',
    tier: 'ui',
    palette: 'slate',
    background: '#ffffff',
  },
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Playground: Story = {
  render: ({ input, tier, palette, background }) => {
    const result = safeAdjust(input, { tier, palette, background });
    const textColor = result.ok ? result.value : '#888';

    return (
      <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-h-svh">
        <div className="nx:flex nx:flex-col nx:gap-2">
          <h2 className="nx:text-foreground nx:typography-heading-medium">
            adjustContrast Playground
          </h2>
          <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
            Edit the controls below to see how an arbitrary input color is
            snapped to the nearest Nexus palette shade that passes the requested
            APCA tier on the target background.
          </p>
        </div>

        <div className="nx:flex nx:flex-wrap nx:gap-8 nx:items-end">
          <Swatch label={`input: ${input}`} color={input} />
          <div className="nx:text-muted-foreground nx:typography-heading-large nx:pb-6">
            →
          </div>
          {result.ok ? (
            <Swatch label={`output: ${result.value}`} color={result.value} />
          ) : (
            <div className="nx:flex nx:flex-col nx:gap-1 nx:max-w-md">
              <span className="nx:text-error-foreground nx:typography-label-default nx:font-semibold">
                Throws
              </span>
              <code className="nx:text-error-foreground nx:typography-label-small nx:font-mono nx:break-all">
                {result.error}
              </code>
            </div>
          )}
        </div>

        <div
          className="nx:rounded-md nx:border nx:border-border-default nx:p-8 nx:flex nx:flex-col nx:gap-2"
          style={{ backgroundColor: background }}
        >
          <p
            className="nx:typography-heading-small"
            style={{ color: textColor }}
          >
            Sample heading on the target surface
          </p>
          <p
            className="nx:typography-body-default"
            style={{ color: textColor }}
          >
            And a paragraph of body text. {tier} tier; palette={palette}.
          </p>
        </div>
      </div>
    );
  },
};

export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-h-svh">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Showcase
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Six representative inputs run through every APCA tier on a light
          surface (#ffffff) and a dark surface (#0a0a0a). The same input
          produces different shades per tier — body needs the most contrast,
          incidental the least.
        </p>
      </div>

      {SHOWCASE_INPUTS.map(({ hex, label }) => (
        <section
          key={hex}
          className="nx:flex nx:flex-col nx:gap-3 nx:rounded-md nx:border nx:border-border-default nx:p-4"
        >
          <div className="nx:flex nx:items-center nx:gap-4">
            <Swatch label={label} color={hex} borderTone="subtle" />
            <code className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
              {hex}
            </code>
          </div>
          <div className="nx:grid nx:grid-cols-2 nx:gap-3">
            <div className="nx:flex nx:flex-col nx:gap-2">
              {TIERS.map((tier) => (
                <ResultRow
                  key={`${hex}-light-${tier}`}
                  input={hex}
                  surface="#ffffff"
                  surfaceLabel="bg=#ffffff"
                  tier={tier}
                  palette="slate"
                />
              ))}
            </div>
            <div className="nx:flex nx:flex-col nx:gap-2">
              {TIERS.map((tier) => (
                <ResultRow
                  key={`${hex}-dark-${tier}`}
                  input={hex}
                  surface="#0a0a0a"
                  surfaceLabel="bg=#0a0a0a"
                  tier={tier}
                  palette="slate"
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  ),
};
