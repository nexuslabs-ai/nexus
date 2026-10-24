import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../components/button/button';
import { Input } from '../components/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select/select';

const SIZES = [
  { size: 'sm', height: '--nx-spacing-8' },
  { size: 'default', height: '--nx-spacing-10' },
  { size: 'lg', height: '--nx-spacing-12' },
] as const;

const LABEL_CAPS_LINE_HEIGHT_PX = 12;

function Controls() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3 nx:bg-background nx:p-10">
      {SIZES.map(({ size }) => (
        <div
          key={size}
          data-testid={`row-${size}`}
          className="nx:flex nx:items-center nx:gap-2"
        >
          <Button size={size}>Save</Button>
          <Input size={size} aria-label={`Name ${size}`} className="nx:w-40" />
          <Select defaultValue="open">
            <SelectTrigger size={size} aria-label={`Status ${size}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      <span
        data-testid="label-caps"
        className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase"
      >
        Label caps
      </span>
    </div>
  );
}

function token(element: Element, name: string) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

const meta = {
  title: 'Internal/Appearance Modes',
  component: Controls,
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.ownerDocument.documentElement;

    await waitFor(() => {
      expect(root).toHaveAttribute('data-density', globals.density);
      expect(root).toHaveAttribute('data-radius', globals.corners);
    });
    await canvasElement.ownerDocument.fonts.ready;

    // Every control of a size shares the density's spacing token as its height.
    for (const { size, height } of SIZES) {
      const row = canvas.getByTestId(`row-${size}`);
      const expected = Number.parseFloat(token(root, height));
      const controls = row.querySelectorAll(
        '[data-slot="button"], [data-slot="input"], [data-slot="select-trigger"]'
      );
      await expect(controls).toHaveLength(3);
      for (const control of controls) {
        await expect(control.getBoundingClientRect().height).toBe(expected);
      }
    }

    // Corners reach controls through the radius tokens.
    const defaultRow = within(canvas.getByTestId('row-default'));
    const button = defaultRow.getByRole('button', { name: 'Save' });
    const input = defaultRow.getByRole('textbox');
    await expect(getComputedStyle(button).borderTopLeftRadius).toBe(
      token(root, '--nx-radius-base')
    );
    await expect(getComputedStyle(input).borderTopLeftRadius).toBe(
      token(root, '--nx-radius-md')
    );

    // The caps line box scales with uiFontSize.
    const caps = canvas.getByTestId('label-caps');
    const scale = globals.uiFontSize / DEFAULT_NXDS_APPEARANCE.prefs.uiFontSize;
    await waitFor(() =>
      expect(getComputedStyle(caps).lineHeight).toBe(
        `${LABEL_CAPS_LINE_HEIGHT_PX * scale}px`
      )
    );
  },
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TightSquare: Story = {
  globals: { density: 'tight', corners: 'square' },
};

export const SpaciousExtraRound: Story = {
  globals: { density: 'spacious', corners: 'extra-round' },
};

export const CompactSmoothLargeText: Story = {
  globals: { density: 'compact', corners: 'smooth', uiFontSize: 28 },
};

export const RelaxedRound: Story = {
  globals: { density: 'relaxed', corners: 'round' },
};
