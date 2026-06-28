import type { Meta, StoryObj } from '@storybook/react';

const PALETTE_GROUPS: { label: string; palettes: string[] }[] = [
  {
    label: 'Neutrals',
    palettes: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
  },
  { label: 'Warm', palettes: ['red', 'orange', 'amber', 'yellow'] },
  { label: 'Greens', palettes: ['lime', 'green', 'emerald', 'teal'] },
  { label: 'Cools', palettes: ['cyan', 'sky', 'blue', 'indigo'] },
  {
    label: 'Magentas',
    palettes: ['violet', 'purple', 'fuchsia', 'pink', 'rose'],
  },
];

const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

function PaletteRow({ name }: { name: string }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-1">
      <div className="nx:w-20 nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </div>
      {SHADES.map((shade) => (
        <div
          key={shade}
          className="nx:flex nx:flex-col nx:items-center nx:gap-1"
        >
          <div
            className="nx:rounded-sm nx:border nx:border-border-default"
            style={{
              backgroundColor: `var(--nx-color-${name}-${shade})`,
              width: 64,
              height: 56,
            }}
          />
          <span className="nx:text-muted-foreground nx:typography-label-small">
            {shade}
          </span>
        </div>
      ))}
    </div>
  );
}

function NeutralChip({ name }: { name: string }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-1">
      <div
        className="nx:rounded-sm nx:border nx:border-border-default"
        style={{
          backgroundColor: `var(--nx-color-${name})`,
          width: 64,
          height: 56,
        }}
      />
      <span className="nx:text-muted-foreground nx:typography-label-small">
        {name}
      </span>
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every primitive color palette × shade rendered from the active runtime CSS variables. Lightness is pinned to the perceptual OKLCH grid per shade, with hue and chroma flowing through from the source palette.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Palettes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Color Palettes
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Chips render the OKLCH values available at runtime. Lightness per
          shade is fixed by the perceptual L grid; hue and chroma flow through
          from the source hex. Vivid mid-range shades (yellow, cyan, fuchsia,
          violet) may show reduced chroma where the pinned L sits outside sRGB —
          compare against the Figma source if a shade looks off.
        </p>
      </div>

      {PALETTE_GROUPS.map((group) => (
        <div key={group.label} className="nx:flex nx:flex-col nx:gap-3">
          <h3 className="nx:text-foreground nx:typography-heading-xsmall">
            {group.label}
          </h3>
          {group.palettes.map((p) => (
            <PaletteRow key={p} name={p} />
          ))}
        </div>
      ))}

      <div className="nx:flex nx:flex-col nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall">
          Constants
        </h3>
        <div className="nx:flex nx:items-end nx:gap-3 nx:pl-20">
          <NeutralChip name="white" />
          <NeutralChip name="black" />
        </div>
      </div>
    </div>
  ),
};
