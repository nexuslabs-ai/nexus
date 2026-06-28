import type { Meta, StoryObj } from '@storybook/react';

import spacingComfortable from '../../../core/tokens/semantic/spacing-comfortable.json';
import spacingCompact from '../../../core/tokens/semantic/spacing-compact.json';
import spacingDefault from '../../../core/tokens/semantic/spacing-default.json';
import spacingRelaxed from '../../../core/tokens/semantic/spacing-relaxed.json';
import spacingSpacious from '../../../core/tokens/semantic/spacing-spacious.json';
import spacingTight from '../../../core/tokens/semantic/spacing-tight.json';

import { SPACING_MODES, type SpacingMode } from './spacing-modes';

const DEFAULT_MODE: SpacingMode = 'default';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type ModeFile = Record<string, unknown>;

function isDimensionToken(node: unknown): node is DimensionToken {
  if (typeof node !== 'object' || node === null) return false;
  if (!('$value' in node) || !('$type' in node)) return false;
  if ((node as { $type: unknown }).$type !== 'dimension') return false;
  const value = (node as { $value: unknown }).$value;
  if (typeof value !== 'object' || value === null) return false;
  const dim = value as { value?: unknown; unit?: unknown };
  return typeof dim.value === 'number' && typeof dim.unit === 'string';
}

const SPACING_TOKENS: Record<SpacingMode, ModeFile> = {
  tight: spacingTight as ModeFile,
  relaxed: spacingRelaxed as ModeFile,
  default: spacingDefault as ModeFile,
  compact: spacingCompact as ModeFile,
  comfortable: spacingComfortable as ModeFile,
  spacious: spacingSpacious as ModeFile,
};

const MODES: { name: SpacingMode; tokens: ModeFile }[] = SPACING_MODES.map(
  (name) => ({ name, tokens: SPACING_TOKENS[name] })
);

/**
 * Walk a per-mode spacing file's `spacing.*` subtree and return ordered
 * `[name, dim]` rows. The numeric scale carries 30+ keys; rendering them
 * sorted by px value makes the visual rhythm obvious across modes.
 */
function extractNumericRows(mode: ModeFile): [string, Dimension][] {
  const numeric = (mode.spacing ?? {}) as Record<string, unknown>;
  const rows: [string, Dimension][] = [];
  for (const [key, token] of Object.entries(numeric)) {
    if (isDimensionToken(token)) {
      rows.push([`spacing-${key}`, token.$value]);
    }
  }
  return rows;
}

/**
 * Walk the `container.*` and `layout.*` subtrees and return the role rows for
 * that mode. Each row name mirrors the JSON path joined with `-`, matching the
 * emitted CSS variable name (`--container-p`, `--layout-section-gap`, …).
 */
function extractRoleRows(mode: ModeFile): [string, Dimension][] {
  const rows: [string, Dimension][] = [];

  function walk(node: unknown, path: string[]): void {
    if (isDimensionToken(node)) {
      rows.push([path.join('-'), node.$value]);
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

  for (const group of ['container', 'layout']) {
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
          'Spacing tokens are authored per-mode in `packages/core/tokens/semantic/spacing-{mode}.json`. Each mode owns direct px values for both the numeric `--spacing-N` scale and the role-named `--container-*` / `--layout-*` tokens. Mode switching is via the `data-style="X"` attribute on `<html>` (or any subtree); the active mode is `default` when no attribute is set.',
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
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
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
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Role-named tokens express semantic intent — `container.*` for
          cards/dialogs, `layout.*` for between-section and stack rhythm.
          Consumed through dedicated utilities like `nx:p-container` or
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

export const ActiveMode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Live render of role-named utilities under the active `data-style` mode (controlled by the **Style** toolbar). Switching modes resizes the boxes; numeric utilities like `nx:p-4` are byte-identical across modes today, so only role utilities (`nx:p-container`, `nx:gap-container`, `nx:gap-layout-*`) reveal the per-mode variance. Try `compact` (compact), `default` (default), `relaxed` (relaxed), `spacious` (most breathing).',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Active Mode
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Switch the <strong>Style</strong> toolbar — the boxes below resize as
          `data-style` toggles on the document root. Numeric tokens are
          byte-identical across modes; only role tokens vary.
        </p>
      </div>

      <section className="nx:flex nx:flex-col nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall nx:font-mono">
          nx:p-container / nx:gap-container
        </h3>
        <div className="nx:p-container nx:bg-container nx:border nx:border-border-default nx:rounded-md nx:flex nx:flex-col nx:gap-container nx:max-w-md">
          <div className="nx:bg-muted nx:rounded-sm nx:h-8" />
          <div className="nx:bg-muted nx:rounded-sm nx:h-8" />
        </div>
      </section>

      <section className="nx:flex nx:flex-col nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall nx:font-mono">
          nx:gap-layout-section / nx:gap-layout-stack
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-layout-section nx:max-w-md">
          <div className="nx:flex nx:flex-col nx:gap-layout-stack">
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
          </div>
          <div className="nx:flex nx:flex-col nx:gap-layout-stack">
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
          </div>
        </div>
      </section>
    </div>
  ),
};
