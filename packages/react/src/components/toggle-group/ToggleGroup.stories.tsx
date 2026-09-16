import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Input } from '../input';

import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

// Single-select permits one selected item or an empty selection.
// Also guards invariant #3 — data-variant / data-size are emitted on the default.
export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'default');
    await expect(group).toHaveAttribute('data-size', 'default');
    const item = canvasElement.querySelector('[data-slot="toggle-group-item"]');
    await expect(item).toHaveAttribute('data-variant', 'default');
    await expect(item).toHaveAttribute('data-size', 'default');
  },
};

// Multiple-select: any number of items pressed at once.
export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['bold']}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <IconBold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <IconItalic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <IconUnderline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// The outline variant, applied to the whole group via context.
export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Joined (spacing 0, segmented) vs separated (spacing 2, individual pills).
export const Spacing: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup type="single" variant="outline" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        defaultValue="left"
      >
        <ToggleGroupItem value="left" aria-label="Align left (spaced)">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center (spaced)">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right (spaced)">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        defaultValue={['bold', 'italic']}
      >
        <ToggleGroupItem value="bold" aria-label="Accent bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Accent italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Accent underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

const LAYOUTS = [
  { name: 'LTR', dir: 'ltr', orientation: 'horizontal' },
  { name: 'RTL', dir: 'rtl', orientation: 'horizontal' },
  { name: 'Vertical', dir: 'ltr', orientation: 'vertical' },
] as const;
const MIXES = [
  ['accentOutline', 'accentOutline', 'accentOutline'],
  ['accentOutline', 'outline', 'accentOutline'],
  ['outline', 'accentOutline', 'accentOutline'],
  ['default', 'accentOutline', 'accentOutline'],
] as const;
const GEOMETRY_LAYOUTS = [
  ...LAYOUTS,
  { name: 'Vertical RTL', dir: 'rtl', orientation: 'vertical' },
] as const;

export const GeometryMatrix: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-8">
      {GEOMETRY_LAYOUTS.flatMap((layout) =>
        [0, 2].flatMap((spacing) =>
          MIXES.map((variants, mix) => (
            <ToggleGroup
              key={`${layout.name}-${spacing}-${mix}`}
              type="multiple"
              variant="accentOutline"
              spacing={spacing}
              dir={layout.dir}
              orientation={layout.orientation}
              defaultValue={['0', '1']}
              aria-label={`${layout.name} spacing ${spacing} mix ${mix}`}
            >
              {variants.map((variant, index) => (
                <ToggleGroupItem
                  key={index}
                  value={String(index)}
                  variant={variant}
                  data-slot={index === 1 ? 'consumer-slot' : undefined}
                  aria-label={`${layout.name} ${spacing} ${mix} ${index}`}
                >
                  <IconBold />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ))
        )
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = within(canvasElement).getAllByRole('group');
    await expect(groups).toHaveLength(32);
    for (const group of groups) {
      const items = within(group).getAllByRole('button');
      const vertical = group.dataset.orientation === 'vertical';
      const rtl = group.getAttribute('dir') === 'rtl';
      const joined = group.dataset.spacing === '0';
      const stroke = Number.parseFloat(
        getComputedStyle(group).getPropertyValue('--nx-borderwidth-default')
      );
      await expect(getComputedStyle(group).isolation).toBe('isolate');
      for (const [index, item] of items.entries()) {
        if (index === 0) continue;
        const previous = items[index - 1];
        if (!previous)
          throw new Error('Joined item must have a preceding sibling');
        const before = previous.getBoundingClientRect();
        const after = item.getBoundingClientRect();
        const gap = vertical
          ? after.top - before.bottom
          : rtl
            ? before.left - after.right
            : after.left - before.right;
        const adjacentAccent =
          previous.dataset.variant === 'accentOutline' &&
          item.dataset.variant === 'accentOutline';
        const expected = joined
          ? adjacentAccent
            ? -stroke
            : 0
          : Number.parseFloat(getComputedStyle(group).gap);
        await expect(gap).toBeCloseTo(expected, 2);
      }
      if (joined) {
        for (const item of items) {
          item.focus();
          await userEvent.keyboard('{Shift}');
          await expect(item).toHaveFocus();
          await expect(Number(getComputedStyle(item).zIndex)).toBe(30);
          for (const neighbor of items.filter(
            (candidate) => candidate !== item
          )) {
            await expect(
              Number.parseInt(getComputedStyle(neighbor).zIndex) || 0
            ).toBeLessThan(30);
          }
        }
      }
    }
  },
};

const NAVIGATION = [
  ...LAYOUTS.map((layout) => ({ ...layout, loop: true })),
  { name: 'Vertical RTL', dir: 'rtl', orientation: 'vertical', loop: true },
  { name: 'No loop', dir: 'ltr', orientation: 'horizontal', loop: false },
  {
    name: 'Omitted orientation',
    dir: 'ltr',
    orientation: undefined,
    loop: true,
  },
] as const;

export const KeyboardContract: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-8">
      {NAVIGATION.map((config) => (
        <ToggleGroup
          key={config.name}
          type="single"
          variant="accentOutline"
          dir={config.dir}
          orientation={config.orientation}
          loop={config.loop}
          defaultValue="left"
          aria-label={config.name}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" disabled>
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const config of NAVIGATION) {
      const group = within(canvasElement).getByRole('group', {
        name: config.name,
      });
      const left = within(group).getByRole('radio', { name: 'Left' });
      const center = within(group).getByRole('radio', { name: 'Center' });
      const right = within(group).getByRole('radio', { name: 'Right' });
      const next =
        config.orientation === 'vertical'
          ? '{ArrowDown}'
          : config.dir === 'rtl'
            ? '{ArrowLeft}'
            : '{ArrowRight}';
      const previous =
        config.orientation === 'vertical'
          ? '{ArrowUp}'
          : config.dir === 'rtl'
            ? '{ArrowRight}'
            : '{ArrowLeft}';
      left.focus();
      await userEvent.keyboard(next);
      await waitFor(() => expect(right).toHaveFocus());
      await expect(center).toBeDisabled();
      await expect(left).toHaveAttribute('aria-checked', 'true');
      await expect(right).toHaveAttribute('aria-checked', 'false');
      await userEvent.keyboard(next);
      await waitFor(() => expect(config.loop ? left : right).toHaveFocus());
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(left).toHaveFocus());
      await userEvent.keyboard(previous);
      await waitFor(() => expect(config.loop ? right : left).toHaveFocus());
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(right).toHaveFocus());
      await expect(left).toHaveAttribute('aria-checked', 'true');
      await userEvent.keyboard(' ');
      await expect(right).toHaveAttribute('aria-checked', 'true');
      await expect(left).toHaveAttribute('aria-checked', 'false');
      await userEvent.keyboard('{Enter}');
      await expect(right).toHaveAttribute('aria-checked', 'false');
      await expect(right).not.toHaveAttribute('aria-pressed');
      left.focus();
      if (!config.orientation) {
        await userEvent.keyboard('{ArrowDown}');
        await waitFor(() => expect(right).toHaveFocus());
      } else {
        await userEvent.keyboard(
          config.orientation === 'vertical' ? '{ArrowRight}' : '{ArrowDown}'
        );
        await expect(left).toHaveFocus();
      }
    }
  },
};

export const WithoutRovingFocus: Story = {
  render: () => (
    <ToggleGroup
      type="multiple"
      variant="accentOutline"
      orientation="vertical"
      rovingFocus={false}
    >
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('button');
    const group = within(canvasElement).getByRole('group');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(getComputedStyle(group).flexDirection).toBe('column');
    for (const item of items) {
      await userEvent.tab();
      await expect(item).toHaveFocus();
    }
  },
};

function ControlledGroup({
  onValueChange,
}: {
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = useState('bold');
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Button onClick={() => setDisabled(!disabled)}>
        {disabled ? 'Enable formatting' : 'Disable formatting'}
      </Button>
      <p id="group-format-error">Bold is not supported for this field.</p>
      <ToggleGroup
        type="single"
        variant="accentOutline"
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
      >
        <ToggleGroupItem
          value="bold"
          aria-invalid
          aria-describedby="group-format-error"
        >
          Bold
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export const ControlledDisabledTransition: Story = {
  args: { type: 'single', onValueChange: fn() },
  render: (args) => (
    <ControlledGroup
      onValueChange={args.onValueChange as (value: string) => void}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole('radio', { name: 'Bold' });
    const italic = canvas.getByRole('radio', { name: 'Italic' });
    const box = bold.getBoundingClientRect();
    const enabledEdge = getComputedStyle(bold, '::before').boxShadow;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable formatting' })
    );
    await expect(bold).toBeDisabled();
    await expect(italic).toBeDisabled();
    await expect(bold).toHaveAttribute('aria-checked', 'true');
    await expect(
      getComputedStyle(bold, '::before')
        .getPropertyValue('--tw-inset-ring-color')
        .trim()
    ).toBe(
      getComputedStyle(bold)
        .getPropertyValue('--nx-color-border-disabled')
        .trim()
    );
    await expect(
      getComputedStyle(bold, '::before')
        .getPropertyValue('--tw-ring-shadow')
        .trim()
    ).toBe('0 0 #0000');
    await expect(getComputedStyle(bold).zIndex).toBe('auto');
    bold.click();
    italic.click();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect([
      bold.getBoundingClientRect().width,
      bold.getBoundingClientRect().height,
    ]).toEqual([box.width, box.height]);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable formatting' })
    );
    await expect(bold).not.toBeDisabled();
    await expect(getComputedStyle(bold, '::before').boxShadow).toBe(
      enabledEdge
    );
    await userEvent.click(bold);
    await expect(args.onValueChange).toHaveBeenCalledWith('');
    await expect(bold).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(italic);
    await expect(args.onValueChange).toHaveBeenCalledWith('italic');
  },
};

export const InvalidOwnership: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <p id="group-selection-error">Choose supported formatting.</p>
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        aria-invalid
        aria-describedby="group-selection-error"
        aria-label="Group error"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        defaultValue={['bold', 'italic']}
        aria-label="Item errors"
      >
        <ToggleGroupItem
          value="bold"
          aria-invalid
          aria-describedby="group-selection-error"
        >
          Invalid bold
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-invalid
          aria-describedby="group-selection-error"
        >
          Invalid italic
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const normal = canvas.getByRole('button', { name: 'Bold' });
    await expect(normal).not.toHaveAttribute('aria-invalid');
    await expect(
      getComputedStyle(normal, '::before')
        .getPropertyValue('--tw-inset-ring-color')
        .trim()
    ).toBe(
      getComputedStyle(normal)
        .getPropertyValue('--nx-color-border-default')
        .trim()
    );
    for (const item of within(
      canvas.getByRole('group', { name: 'Item errors' })
    ).getAllByRole('button')) {
      await expect(item).toHaveAccessibleDescription(
        'Choose supported formatting.'
      );
      await userEvent.hover(item);
      await expect(
        getComputedStyle(item, '::before')
          .getPropertyValue('--tw-inset-ring-color')
          .trim()
      ).toBe(
        getComputedStyle(item)
          .getPropertyValue('--nx-color-border-error')
          .trim()
      );
      await userEvent.unhover(item);
    }
  },
};

export const EmptyAndSingle: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        aria-label="Empty formatting"
      />
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        aria-label="One item"
      >
        <ToggleGroupItem value="bold" asChild>
          <button type="button">Single composed bold</button>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      within(
        canvas.getByRole('group', { name: 'Empty formatting' })
      ).queryAllByRole('button')
    ).toHaveLength(0);
    const item = canvas.getByRole('button', { name: 'Single composed bold' });
    await userEvent.click(item);
    await expect(item).toHaveAttribute('aria-pressed', 'true');
    const style = getComputedStyle(item);
    const radius = style.getPropertyValue('--nx-radius-md').trim();
    await expect(style.borderTopLeftRadius).toBe(radius);
    await expect(style.borderTopRightRadius).toBe(radius);
  },
};

export const FormattingSettings: Story = {
  render: () => (
    <section
      className="nx:flex nx:max-w-full nx:flex-col nx:gap-6"
      aria-label="Formatting settings"
    >
      <div className="nx:flex nx:flex-col nx:gap-2">
        <label htmlFor="formatting-title">Document title</label>
        <Input id="formatting-title" defaultValue="Assessment instructions" />
      </div>
      <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
        <ToggleGroup
          type="multiple"
          variant="accentOutline"
          defaultValue={['bold']}
          aria-label="Text formatting"
          className="nx:pointer-coarse:[&>button]:min-h-11 nx:pointer-coarse:[&>button]:min-w-11"
        >
          <ToggleGroupItem value="bold" aria-label="Bold">
            <IconBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <IconItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <IconUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline">Reset formatting</Button>
        <Button>Save settings</Button>
      </div>
      <ToggleGroup
        type="single"
        variant="accentOutline"
        spacing={2}
        aria-label="Paragraph style"
        className="nx:flex-wrap nx:pointer-coarse:[&>button]:min-h-11 nx:pointer-coarse:[&>button]:min-w-11"
      >
        <ToggleGroupItem value="body">Body text</ToggleGroupItem>
        <ToggleGroupItem value="heading">Section heading</ToggleGroupItem>
      </ToggleGroup>
    </section>
  ),
};

// Clicking an item selects it (and deselects the previously selected one).
export const ClickInteraction: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const center = canvas.getByRole('radio', { name: 'Align center' });
    await expect(center).toHaveAttribute('data-state', 'off');
    await userEvent.click(center);
    await expect(center).toHaveAttribute('data-state', 'on');
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toHaveAttribute('data-state', 'off');
  },
};

// Arrow keys move the roving focus within the group.
export const KeyboardInteraction: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('radio', { name: 'Align center' })
    ).toHaveFocus();
  },
};

// A disabled group disables all its items.
export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" disabled>
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toBeDisabled();
  },
};

// The group carries data-variant / data-size; items inherit them through context.
export const WithDataAttributes: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" size="sm" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'outline');
    await expect(group).toHaveAttribute('data-size', 'sm');
    const item = canvasElement.querySelector('[data-slot="toggle-group-item"]');
    await expect(item).toHaveAttribute('data-variant', 'outline');
    await expect(item).toHaveAttribute('data-size', 'sm');
  },
};

// Item-wins precedence: a per-item variant overrides the group's. The group is
// outline; the first item opts back to the borderless default, the second inherits.
export const ItemOverridesGroup: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left" variant="default" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const [override, inherited] = canvasElement.querySelectorAll(
      '[data-slot="toggle-group-item"]'
    );
    await expect(override).toHaveAttribute('data-variant', 'default');
    await expect(override).not.toHaveClass('nx:border-border-default');
    await expect(inherited).toHaveAttribute('data-variant', 'outline');
    await expect(inherited).toHaveClass('nx:border-border-default');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Single + multiple, all variants, joined + spaced. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup
        type="multiple"
        variant="accentOutline"
        defaultValue={['bold', 'italic']}
      >
        <ToggleGroupItem value="bold" aria-label="Accent bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Accent italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Accent underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" variant="outline" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        defaultValue="left"
      >
        <ToggleGroupItem value="left" aria-label="Spaced left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Spaced center">
          <IconAlignCenter />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const AccentSizes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <ToggleGroup
          key={size}
          type="multiple"
          variant="accentOutline"
          size={size}
          defaultValue={['bold']}
          aria-label={size}
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const group of within(canvasElement).getAllByRole('group')) {
      for (const item of within(group).getAllByRole('button')) {
        await expect(item).toHaveAttribute('data-size', group.dataset.size);
        await expect(item).toHaveAttribute('data-variant', 'accentOutline');
        await expect(getComputedStyle(item).borderTopWidth).toBe('0px');
      }
    }
  },
};
