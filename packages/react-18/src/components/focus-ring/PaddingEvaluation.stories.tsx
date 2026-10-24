/**
 * SCRATCH — not for commit. Evaluation harness for the open question on #726:
 * fields now carry a real 1px border and their padding was NOT compensated, so
 * text sits one border-width further in than it did on `main`.
 *
 *   Current      = this branch. border 1px + padding 12px -> text at 13px
 *   Compensated  = what the issue asked for. border 1px + 11px -> text at 12px
 *
 * Everything here is inline-styled on purpose: this file is git-excluded, and
 * Tailwind's content scanner skips git-ignored files, so any `nx:` class unique
 * to this file would silently never be generated.
 */
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button/button';
import { Input } from '../input/input';
import { InputGroup, InputGroupInput } from '../input-group/input-group';
import {
  NativeSelect,
  NativeSelectOption,
} from '../native-select/native-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select';
import { Textarea } from '../textarea/textarea';

const meta: Meta = {
  title: 'Scratch/Padding Evaluation',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** padding-inline: 12px - live border width. Tracks density and stroke mode. */
const COMPENSATED: React.CSSProperties = {
  paddingInline: 'calc(var(--nx-spacing-3) - var(--nx-borderwidth-default))',
};

const COLUMN: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 280,
};

const LABEL: React.CSSProperties = {
  font: '500 13px/1.4 system-ui, sans-serif',
  color: 'var(--nx-color-foreground)',
  margin: 0,
};

/** A 1px plumb line `offset` from the field's outer edge. */
function Guide({
  offset,
  children,
}: {
  offset: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          insetBlock: 0,
          left: offset,
          width: 1,
          background: 'var(--nx-color-error-background)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}

function FieldSet({
  style,
  suffix,
}: {
  style?: React.CSSProperties;
  suffix: string;
}) {
  return (
    <div style={COLUMN}>
      <Input
        aria-label={`Input ${suffix}`}
        style={style}
        defaultValue="Hamburg"
      />
      <Select defaultValue="a">
        <SelectTrigger aria-label={`Select ${suffix}`} style={style}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Hamburg</SelectItem>
        </SelectContent>
      </Select>
      <NativeSelect aria-label={`Native ${suffix}`} style={style}>
        <NativeSelectOption value="a">Hamburg</NativeSelectOption>
      </NativeSelect>
      <Textarea
        aria-label={`Textarea ${suffix}`}
        style={style}
        defaultValue="Hamburg"
      />
      <InputGroup>
        <InputGroupInput
          aria-label={`Grouped ${suffix}`}
          style={style}
          defaultValue="Hamburg"
        />
      </InputGroup>
      {/* Reference: Button (and so ComboboxTrigger) already shipped a real
          border with UNcompensated padding. "Current" lines up with it. */}
      <Button variant="outline">Hamburg</Button>
    </div>
  );
}

function Pair({ zoom = 1 }: { zoom?: number }) {
  return (
    <div style={{ display: 'flex', gap: 64 }}>
      {[
        { title: 'Current — text at 13px', style: undefined },
        { title: 'Compensated — text at 12px', style: COMPENSATED },
      ].map(({ title, style }) => (
        <div
          key={title}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <p style={LABEL}>{title}</p>
          <div style={{ width: 280 * zoom, overflow: 'hidden' }}>
            {/* zoom scales layout, so the 1px delta scales with it */}
            <div style={{ zoom }}>
              <Guide offset={12}>
                <FieldSet style={style} suffix={`${title} ${zoom}`} />
              </Guide>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 1:1. The red line is at 12px — where text started on `main`. Left column
 * clears it by the border width; right column sits on it.
 */
export const CurrentVsCompensated: Story = {
  render: () => <Pair />,
};

/** 4x. This is the view where the 1px is actually legible. */
export const Magnified: Story = {
  render: () => <Pair zoom={4} />,
};

/**
 * Height, not text: NativeSelect has no fixed height, so its box is
 * padding-driven and the real border makes it 2px taller. Every other field is
 * box-border with an explicit height and does not move.
 */
export const HeightImpact: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={LABEL}>Each row should read as one height.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: 280 }}>
          <Input aria-label="Reference input" defaultValue="Input" />
        </div>
        <div style={{ width: 280 }}>
          <NativeSelect aria-label="Current native select">
            <NativeSelectOption value="a">Native current</NativeSelectOption>
          </NativeSelect>
        </div>
        <div style={{ width: 280 }}>
          <NativeSelect
            aria-label="Compensated native select"
            style={{
              paddingBlock:
                'calc(var(--nx-spacing-2) - var(--nx-borderwidth-default))',
            }}
          >
            <NativeSelectOption value="a">Native comp</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
    </div>
  ),
};

/**
 * Stroke modes only started reaching fields with this change. Uncompensated,
 * text drifts inward as the border thickens; compensated, it holds at 12px.
 */
export const AcrossBorderWidthModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      {(['fine', 'normal', 'strong'] as const).map((mode) => (
        <div
          key={mode}
          data-borderwidth={mode}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <p style={LABEL}>{mode}</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Guide offset={12}>
              <FieldSet suffix={`${mode} current`} />
            </Guide>
            <Guide offset={12}>
              <FieldSet style={COMPENSATED} suffix={`${mode} compensated`} />
            </Guide>
          </div>
        </div>
      ))}
    </div>
  ),
};
