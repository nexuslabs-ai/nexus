import {
  apcaLc,
  SEMANTIC_TOKEN_REGISTRY,
  TIER_THRESHOLDS,
} from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { NexusAppearanceSettings } from '../components/appearance/appearance-settings';

import {
  tokenValue,
  useRuntimeTokenValues,
} from './support/runtime-token-values';

const TEXT_TOKEN_NAMES = [
  '--nx-color-foreground',
  '--nx-color-muted-foreground',
] as const;

const SURFACE_TOKEN_NAMES = SEMANTIC_TOKEN_REGISTRY.filter(
  (token) => token.category === 'surface'
).map((token) => `--nx-color-${token.name}`);

const RUNTIME_TOKEN_NAMES = [
  ...SURFACE_TOKEN_NAMES,
  ...TEXT_TOKEN_NAMES,
] as const;

function bareName(tokenName: string): string {
  return tokenName.replace('--nx-color-', '');
}

function lightness(value: string): string {
  const match = value.match(/^oklch\(([\d.]+)/);
  if (!match) return 'L ...';
  return `L ${Number(match[1]).toFixed(4)}`;
}

function lcFor(
  foreground: string,
  background: string,
  threshold: number
): { label: string; passes: boolean } {
  if (!foreground.startsWith('oklch(') || !background.startsWith('oklch(')) {
    return { label: 'Lc ...', passes: false };
  }

  const lc = apcaLc(foreground, background);
  return { label: `Lc ${Math.round(lc)}`, passes: lc >= threshold };
}

function ContrastBadge({
  foreground,
  background,
  threshold,
}: {
  foreground: string;
  background: string;
  threshold: number;
}) {
  const { label, passes } = lcFor(foreground, background, threshold);

  return (
    <span
      className={`nx:rounded-sm nx:px-1.5 nx:py-0.5 nx:typography-label-small nx:font-mono ${
        passes
          ? 'nx:bg-success-subtle nx:text-success-subtle-foreground'
          : 'nx:bg-error-subtle nx:text-error-subtle-foreground'
      }`}
    >
      {label}
    </span>
  );
}

function SurfaceSwatch({
  tokenName,
  values,
}: {
  tokenName: string;
  values: Record<string, string>;
}) {
  const background = tokenValue(values, tokenName);
  const body = tokenValue(values, '--nx-color-foreground');
  const muted = tokenValue(values, '--nx-color-muted-foreground');

  return (
    <article
      className="nx:flex nx:min-h-48 nx:flex-col nx:justify-between nx:gap-5 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4"
      data-testid={`surface-ladder-${bareName(tokenName)}`}
      style={{ backgroundColor: `var(${tokenName})` }}
    >
      <div className="nx:flex nx:flex-col nx:gap-1">
        <span
          className="nx:typography-label-default nx:font-mono"
          style={{ color: 'var(--nx-color-foreground)' }}
        >
          {bareName(tokenName)}
        </span>
        <span
          className="nx:break-all nx:typography-label-small nx:font-mono"
          style={{ color: 'var(--nx-color-muted-foreground)' }}
        >
          {background}
        </span>
        <span
          className="nx:typography-label-small nx:font-mono"
          style={{ color: 'var(--nx-color-muted-foreground)' }}
        >
          {lightness(background)}
        </span>
      </div>

      <div className="nx:flex nx:flex-col nx:gap-3">
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
          <span
            className="nx:typography-body-small"
            style={{ color: 'var(--nx-color-foreground)' }}
          >
            Body sample
          </span>
          <ContrastBadge
            foreground={body}
            background={background}
            threshold={TIER_THRESHOLDS.body}
          />
        </div>
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
          <span
            className="nx:typography-body-small"
            style={{ color: 'var(--nx-color-muted-foreground)' }}
          >
            Muted sample
          </span>
          <ContrastBadge
            foreground={muted}
            background={background}
            threshold={TIER_THRESHOLDS.ui}
          />
        </div>
      </div>
    </article>
  );
}

function SurfaceLadderStory() {
  const values = useRuntimeTokenValues(RUNTIME_TOKEN_NAMES);

  return (
    <div className="nx:grid nx:min-w-fit nx:grid-cols-[22rem_minmax(48rem,1fr)] nx:gap-8 nx:bg-background nx:p-8 nx:text-foreground">
      <aside className="nx:sticky nx:top-8 nx:self-start">
        <NexusAppearanceSettings />
      </aside>
      <main className="nx:flex nx:flex-col nx:gap-6">
        <div className="nx:flex nx:flex-col nx:gap-2">
          <h2 className="nx:typography-heading-medium nx:text-foreground">
            Surface ladder
          </h2>
          <p className="nx:max-w-3xl nx:typography-body-default nx:text-muted-foreground">
            Live semantic surface tokens from the active Nexus Appearance
            provider.
          </p>
        </div>
        <section className="nx:grid nx:grid-cols-3 nx:gap-4">
          {SURFACE_TOKEN_NAMES.map((tokenName) => (
            <SurfaceSwatch
              key={tokenName}
              tokenName={tokenName}
              values={values}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/SurfaceLadder',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Semantic surface ladder explorer rendered from the registry and the active runtime Appearance provider.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Explorer: Story = {
  render: () => <SurfaceLadderStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('surface-ladder-background')).toBeVisible();
  },
};
