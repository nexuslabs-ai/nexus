import type { Meta, StoryObj } from '@storybook/react';

import {
  tokenValue,
  useRuntimeTokenValues,
} from './support/runtime-token-values';

const RADIUS_KEYS = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'full',
] as const;
const BORDERWIDTH_KEYS = ['thin', 'default', 'thick'] as const;

const RADIUS_TOKEN_NAMES = RADIUS_KEYS.map((key) => `--nx-radius-${key}`);
const BORDERWIDTH_TOKEN_NAMES = BORDERWIDTH_KEYS.map(
  (key) => `--nx-borderwidth-${key}`
);

function RadiusSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-1">
      <div
        className="nx:bg-primary-background"
        style={{
          width: 64,
          height: 64,
          borderRadius: `var(${name})`,
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name.replace('--nx-radius-', '')}
      </span>
      <span className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {value}
      </span>
    </div>
  );
}

function BorderWidthSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-1">
      <div
        style={{
          width: 64,
          height: 64,
          borderStyle: 'solid',
          borderWidth: `var(${name})`,
          borderColor: 'var(--nx-color-foreground)',
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name.replace('--nx-borderwidth-', '')}
      </span>
      <span className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {value}
      </span>
    </div>
  );
}

function RadiiStory() {
  const values = useRuntimeTokenValues(RADIUS_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Border Radii
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Live `--nx-radius-*` variables from the active Corners toolbar. `full`
          resolves to 9999px so the corner becomes a perfect arc on any
          container.
        </p>
      </div>
      <section className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
        {RADIUS_TOKEN_NAMES.map((name) => (
          <RadiusSwatch
            key={name}
            name={name}
            value={tokenValue(values, name)}
          />
        ))}
      </section>
    </div>
  );
}

function BorderWidthsStory() {
  const values = useRuntimeTokenValues(BORDERWIDTH_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Border Widths
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Live `--nx-borderwidth-*` variables from the active Stroke toolbar.
          The Tailwind utilities `nx:border-thin`, `nx:border-default`, and
          `nx:border-thick` consume these values.
        </p>
      </div>
      <section className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
        {BORDERWIDTH_TOKEN_NAMES.map((name) => (
          <BorderWidthSwatch
            key={name}
            name={name}
            value={tokenValue(values, name)}
          />
        ))}
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Radius',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Border radius and border width primitives rendered from the active Nexus Appearance provider. Use the Corners and Stroke toolbars to inspect the runtime values a consumer receives.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Radii: Story = {
  render: () => <RadiiStory />,
};

export const BorderWidths: Story = {
  render: () => <BorderWidthsStory />,
};
