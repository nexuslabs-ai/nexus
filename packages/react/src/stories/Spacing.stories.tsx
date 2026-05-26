import type { Meta, StoryObj } from '@storybook/react';

import spacingLuma from '../../../core/tokens/semantic/spacing-luma.json';
import spacingLyra from '../../../core/tokens/semantic/spacing-lyra.json';
import spacingMaia from '../../../core/tokens/semantic/spacing-maia.json';
import spacingMira from '../../../core/tokens/semantic/spacing-mira.json';
import spacingNova from '../../../core/tokens/semantic/spacing-nova.json';
import spacingSera from '../../../core/tokens/semantic/spacing-sera.json';
import spacingVega from '../../../core/tokens/semantic/spacing-vega.json';

const DEFAULT_MODE = 'vega';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type ModeFile = Record<string, unknown>;

const MODES: { name: string; tokens: ModeFile }[] = [
  { name: 'vega', tokens: spacingVega as ModeFile },
  { name: 'lyra', tokens: spacingLyra as ModeFile },
  { name: 'maia', tokens: spacingMaia as ModeFile },
  { name: 'mira', tokens: spacingMira as ModeFile },
  { name: 'nova', tokens: spacingNova as ModeFile },
  { name: 'luma', tokens: spacingLuma as ModeFile },
  { name: 'sera', tokens: spacingSera as ModeFile },
];

/**
 * Walk a per-mode spacing file's `spacing.*` subtree and return ordered
 * `[name, dim]` rows. The numeric scale carries 30+ keys; rendering them
 * sorted by px value makes the visual rhythm obvious across modes.
 */
function extractNumericRows(mode: ModeFile): [string, Dimension][] {
  const numeric = (mode.spacing ?? {}) as Record<string, DimensionToken>;
  return Object.entries(numeric).map(
    ([key, token]) => [`spacing-${key}`, token.$value] as [string, Dimension]
  );
}

/**
 * Walk the `control.*`, `container.*`, `layout.*` subtrees and return the
 * role rows for that mode. Each row name mirrors the JSON path joined with
 * `-`, matching the emitted CSS variable name (`--control-h-md`,
 * `--container-p`, `--layout-section-gap`, …).
 */
function extractRoleRows(mode: ModeFile): [string, Dimension][] {
  const rows: [string, Dimension][] = [];

  function walk(node: unknown, path: string[]): void {
    if (
      typeof node === 'object' &&
      node !== null &&
      '$value' in node &&
      '$type' in node
    ) {
      const token = node as DimensionToken;
      if (token.$type === 'dimension') {
        rows.push([path.join('-'), token.$value]);
      }
      return;
    }
    if (typeof node === 'object' && node !== null) {
      for (const [key, value] of Object.entries(
        node as Record<string, unknown>
      )) {
        if (key.startsWith('$')) continue;
        walk(value, [...path, key]);
      }
    }
  }

  for (const group of ['control', 'container', 'layout']) {
    if (group in mode) {
      walk(mode[group], [group]);
    }
  }

  return rows;
}

function formatDimension(d: Dimension): string {
  return `${d.value}${d.unit}`;
}

function sortByValue(rows: [string, Dimension][]): [string, Dimension][] {
  return [...rows].sort((a, b) => a[1].value - b[1].value);
}

function Row({ name, dim }: { name: string; dim: Dimension }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      <span className="nx:w-48 nx:shrink-0 nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
      <span className="nx:w-16 nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {formatDimension(dim)}
      </span>
      <div
        className="nx:rounded-sm nx:bg-primary-background nx:shrink-0"
        style={{ width: `${dim.value}${dim.unit}`, height: 12 }}
      />
    </div>
  );
}

function ModeSection({
  mode,
  rows,
}: {
  mode: string;
  rows: [string, Dimension][];
}) {
  const isDefault = mode === DEFAULT_MODE;
  return (
    <section className="nx:flex nx:flex-col nx:gap-3">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {isDefault && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Default
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-col nx:gap-1">
        {rows.map(([name, dim]) => (
          <Row key={name} name={name} dim={dim} />
        ))}
      </div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Spacing tokens are authored per-mode in `packages/core/tokens/semantic/spacing-{mode}.json`. Each mode owns direct px values for both the numeric `--spacing-N` scale and the role-named `--control-*` / `--container-*` / `--layout-*` tokens. Mode switching is via the `data-style="X"` attribute on `<html>` (or any subtree); the active mode is the default `vega` when no attribute is set.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Numeric: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Numeric Spacing Scale
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          The `--spacing-N` scale consumed through Tailwind utilities like
          `nx:p-4` or `nx:gap-2`. Each row shows the variable name, the resolved
          pixel value, and a bar drawn at that exact width. Compare modes
          vertically to see how the scale shifts.
        </p>
      </div>
      {MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          rows={sortByValue(extractNumericRows(tokens))}
        />
      ))}
    </div>
  ),
};

export const Roles: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Role Tokens
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Role-named tokens express semantic intent — `control.*` for
          buttons/inputs/select triggers, `container.*` for cards/dialogs,
          `layout.*` for between-section and stack rhythm. Consumed through
          dedicated utilities like `nx:h-control-md`, `nx:p-container`, or
          `nx:gap-layout-section`. Per-mode variance is the lever for density:
          Mira shrinks, Maia/Sera/Luma breathe.
        </p>
      </div>
      {MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          rows={sortByValue(extractRoleRows(tokens))}
        />
      ))}
    </div>
  ),
};
