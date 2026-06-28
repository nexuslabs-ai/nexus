import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import shadowFlatDark from '../../../core/tokens/primitives/shadow/shadow-flat-dark.json';
import shadowFlatLight from '../../../core/tokens/primitives/shadow/shadow-flat-light.json';
import shadowQuietDark from '../../../core/tokens/primitives/shadow/shadow-quiet-dark.json';
import shadowQuietLight from '../../../core/tokens/primitives/shadow/shadow-quiet-light.json';
import shadowSoftDark from '../../../core/tokens/primitives/shadow/shadow-soft-dark.json';
import shadowSoftLight from '../../../core/tokens/primitives/shadow/shadow-soft-light.json';
import shadowStandardDark from '../../../core/tokens/primitives/shadow/shadow-standard-dark.json';
import shadowStandardLight from '../../../core/tokens/primitives/shadow/shadow-standard-light.json';
import shadowStrongDark from '../../../core/tokens/primitives/shadow/shadow-strong-dark.json';
import shadowStrongLight from '../../../core/tokens/primitives/shadow/shadow-strong-light.json';

const PUBLIC_APPEARANCE_DEFAULT_SHADOW_MODE = 'quiet';
const TOKEN_DOCS_ONLY_SHADOW_MODES = new Set(['flat', 'soft']);

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type ColorToken = { $value: string; $type: string };
type ShadowLayer = {
  x: DimensionToken;
  y: DimensionToken;
  blur: DimensionToken;
  spread: DimensionToken;
  color: ColorToken;
};
type ShadowToken = Record<string, ShadowLayer>;

type ShadowKey =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'inner';
type ShadowSet = Record<ShadowKey, ShadowToken>;

const DISPLAY_SHADOW_KEYS = [
  '2xs',
  'xs',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
  '2xl',
] as const satisfies readonly ShadowKey[];

const RUNTIME_SHADOW_MODES = [
  'quiet',
  'standard',
  'strong',
] as const satisfies readonly string[];

const RUNTIME_SHADOW_TIERS = [
  { name: '2xs', className: 'nx:shadow-2xs' },
  { name: 'xs', className: 'nx:shadow-xs' },
  { name: 'sm', className: 'nx:shadow-sm' },
  { name: 'base', className: 'nx:shadow-base' },
  { name: 'md', className: 'nx:shadow-md' },
  { name: 'lg', className: 'nx:shadow-lg' },
  { name: 'xl', className: 'nx:shadow-xl' },
  { name: '2xl', className: 'nx:shadow-2xl' },
] as const;

const SHADOW_MODES_LIGHT: { name: string; tokens: ShadowSet }[] = [
  { name: 'flat', tokens: shadowFlatLight as ShadowSet },
  { name: 'soft', tokens: shadowSoftLight as ShadowSet },
  { name: 'quiet', tokens: shadowQuietLight as ShadowSet },
  { name: 'standard', tokens: shadowStandardLight as ShadowSet },
  { name: 'strong', tokens: shadowStrongLight as ShadowSet },
];

const SHADOW_MODES_DARK: { name: string; tokens: ShadowSet }[] = [
  { name: 'flat', tokens: shadowFlatDark as ShadowSet },
  { name: 'soft', tokens: shadowSoftDark as ShadowSet },
  { name: 'quiet', tokens: shadowQuietDark as ShadowSet },
  { name: 'standard', tokens: shadowStandardDark as ShadowSet },
  { name: 'strong', tokens: shadowStrongDark as ShadowSet },
];

function formatPx(d: Dimension) {
  return `${d.value}${d.unit}`;
}

function composeShadow(token: ShadowToken): string {
  return Object.values(token)
    .map((layer) =>
      [
        formatPx(layer.x.$value),
        formatPx(layer.y.$value),
        formatPx(layer.blur.$value),
        formatPx(layer.spread.$value),
        layer.color.$value,
      ].join(' ')
    )
    .join(', ');
}

function ShadowCard({ name, token }: { name: string; token: ShadowToken }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
      <div
        className="nx:bg-container"
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          boxShadow: composeShadow(token),
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
    </div>
  );
}

function ModeSection({
  mode,
  appearanceDefault,
  tokenOnly,
  tokens,
}: {
  mode: string;
  appearanceDefault: boolean;
  tokenOnly: boolean;
  tokens: ShadowSet;
}) {
  return (
    <section className="nx:flex nx:flex-col nx:gap-4">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {appearanceDefault && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Appearance default
          </span>
        )}
        {tokenOnly && (
          <span className="nx:rounded-sm nx:bg-muted nx:text-muted-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Token mode
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-wrap nx:items-end nx:gap-8 nx:px-2 nx:py-6">
        {DISPLAY_SHADOW_KEYS.map((sk) => (
          <ShadowCard key={sk} name={sk} token={tokens[sk]} />
        ))}
      </div>
    </section>
  );
}

function RuntimeUtilityCard({
  scheme,
  mode,
  tier,
  className,
}: {
  scheme: 'light' | 'dark';
  mode: string;
  tier: string;
  className: string;
}) {
  return (
    <article
      className={`nx:flex nx:h-24 nx:flex-col nx:justify-between nx:rounded-lg nx:border nx:border-border-default nx:bg-container nx:p-3 ${className}`}
      data-testid={`${scheme}-${mode}-${tier}`}
    >
      <span className="nx:text-foreground nx:typography-label-default">
        {tier}
      </span>
      <span className="nx:text-muted-foreground nx:typography-label-small">
        nx:shadow-{tier}
      </span>
    </article>
  );
}

function RuntimeModeSection({
  scheme,
  mode,
}: {
  scheme: 'light' | 'dark';
  mode: string;
}) {
  return (
    <section className="nx:flex nx:flex-col nx:gap-4" data-shadow={mode}>
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall">
          {mode}
        </h3>
        <span className="nx:text-muted-foreground nx:typography-label-small">
          data-shadow=&quot;{mode}&quot;
        </span>
      </div>
      <div className="nx:grid nx:grid-cols-2 nx:gap-4 nx:md:grid-cols-4">
        {RUNTIME_SHADOW_TIERS.map(({ name, className }) => (
          <RuntimeUtilityCard
            key={name}
            scheme={scheme}
            mode={mode}
            tier={name}
            className={className}
          />
        ))}
      </div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Shadow',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Shadow primitives — composite tokens whose per-layer x/y/blur/spread/color values compose into a CSS `box-shadow` string. Each mode has light and dark variants because shadow colors and opacities differ by background tone. Shown: 8 elevation shadows (2xs → 2xl). The inner shadow exists in JSON but uses a different visual treatment and is not part of this elevation showcase. Focus shadows live in the focus primitive (separate from elevation since focus is a theme-aware, mode-agnostic a11y role).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Light: Story = {
  globals: { theme: 'light' },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Shadows — Light
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Elevation shadows applied to cards on a light background. Each
          mode&apos;s light JSON defines per-layer values that compose into the
          CSS `box-shadow` string.
        </p>
      </div>
      {SHADOW_MODES_LIGHT.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          appearanceDefault={name === PUBLIC_APPEARANCE_DEFAULT_SHADOW_MODE}
          tokenOnly={TOKEN_DOCS_ONLY_SHADOW_MODES.has(name)}
          tokens={tokens}
        />
      ))}
    </div>
  ),
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Shadows — Dark
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Same elevation tokens, but each mode&apos;s dark JSON tunes colors and
          opacities for dark UI. Use these when the surrounding page or panel
          uses a dark background.
        </p>
      </div>
      {SHADOW_MODES_DARK.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          appearanceDefault={name === PUBLIC_APPEARANCE_DEFAULT_SHADOW_MODE}
          tokenOnly={TOKEN_DOCS_ONLY_SHADOW_MODES.has(name)}
          tokens={tokens}
        />
      ))}
    </div>
  ),
};

export const RuntimeUtilities: Story = {
  render: () => (
    <div className="nx:grid nx:min-w-fit nx:grid-cols-1 nx:gap-0 nx:bg-background nx:lg:grid-cols-2">
      {(['light', 'dark'] as const).map((scheme) => (
        <div
          key={scheme}
          className={`nx:flex nx:flex-col nx:gap-8 nx:p-10 ${
            scheme === 'dark' ? 'dark nx:bg-background' : 'nx:bg-background'
          }`}
        >
          <div className="nx:flex nx:flex-col nx:gap-2">
            <h2 className="nx:text-foreground nx:typography-heading-medium">
              Runtime shadows — {scheme}
            </h2>
            <p className="nx:max-w-2xl nx:text-muted-foreground nx:typography-body-default">
              Real `nx:shadow-*` utilities rendered under the public Appearance
              elevation modes. `flat` and `soft` remain token/docs modes only.
            </p>
          </div>
          {RUNTIME_SHADOW_MODES.map((mode) => (
            <RuntimeModeSection key={mode} scheme={scheme} mode={mode} />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const strongDark = canvas.getByTestId('dark-strong-lg');
    const quietLight = canvas.getByTestId('light-quiet-sm');

    await expect(strongDark).toBeVisible();
    await expect(quietLight).toBeVisible();
    expect(getComputedStyle(strongDark).boxShadow).not.toBe('none');
    expect(getComputedStyle(quietLight).boxShadow).not.toBe('none');
  },
};
