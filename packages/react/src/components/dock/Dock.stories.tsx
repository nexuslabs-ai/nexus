import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAdjustments,
  IconBrush,
  IconLayoutDashboard,
  IconMail,
  IconPalette,
  IconTypography,
} from '@tabler/icons-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { useNxdsAppearance } from '../appearance/provider/provider';
import { Button } from '../button/button';
import { Field, FieldLabel } from '../field/field';
import { Input } from '../input/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select';

import { Dock, DockItem, DockLabel, DockPanel } from './dock';

const meta: Meta<typeof Dock> = {
  title: 'Components/Dock',
  component: Dock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dock groups tools around a raised active pill. Supply the selected value, labels and optional DockPanel content. Place the dock near the bottom of its container so controls have room to open above it.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Dock>;

export const Default: Story = {
  tags: ['docs'],
  render: function Example() {
    const [value, setValue] = React.useState('dashboard');
    return (
      <Dock value={value} onValueChange={setValue} aria-label="Workspace views">
        <DockItem value="dashboard" aria-label="Dashboard">
          <IconLayoutDashboard aria-hidden="true" />
          <DockLabel>Dashboard</DockLabel>
        </DockItem>
        <DockItem value="mail" aria-label="Mail">
          <IconMail aria-hidden="true" />
          <DockLabel>Mail</DockLabel>
        </DockItem>
        <DockItem value="settings" aria-label="Settings">
          <IconAdjustments aria-hidden="true" />
          <DockLabel>Settings</DockLabel>
        </DockItem>
      </Dock>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Dashboard' })
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Mail' }));
    await expect(canvas.getByRole('button', { name: 'Mail' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  },
};

export const WithPanel: Story = {
  tags: ['docs'],
  render: function Example() {
    const [value, setValue] = React.useState('color');
    const id = React.useId();
    return (
      <div className="nx:flex nx:min-h-96 nx:items-end">
        <Dock
          value={value}
          onValueChange={setValue}
          aria-label="Drawing tools"
          panel={
            <DockPanel title={value === 'color' ? 'Color' : 'Typography'}>
              <Field>
                <FieldLabel htmlFor={id}>
                  {value === 'color' ? 'Fill' : 'Font family'}
                </FieldLabel>
                <Input
                  id={id}
                  defaultValue={value === 'color' ? '#7c6ee8' : 'Inter'}
                  key={value}
                />
              </Field>
            </DockPanel>
          }
        >
          <DockItem value="color" aria-label="Color">
            <IconPalette aria-hidden="true" />
            <DockLabel>Color</DockLabel>
          </DockItem>
          <DockItem value="type" aria-label="Typography">
            <IconTypography aria-hidden="true" />
            <DockLabel>Typography</DockLabel>
          </DockItem>
        </Dock>
      </div>
    );
  },
};

function ToolDock({
  onOpenChange = fn(),
  narrow = false,
}: {
  onOpenChange?: (open: boolean) => void;
  narrow?: boolean;
}) {
  const [value, setValue] = React.useState('color');
  const id = React.useId();
  return (
    <div
      className="nx:flex nx:min-h-96 nx:items-end nx:gap-4"
      style={{ maxWidth: narrow ? 330 : undefined }}
    >
      <Dock
        value={value}
        onValueChange={setValue}
        onOpenChange={onOpenChange}
        aria-label="Editor tools"
        panel={
          <DockPanel title={value === 'color' ? 'Color' : 'Typography'}>
            <Field>
              <FieldLabel htmlFor={id}>Style</FieldLabel>
              <Select defaultValue="solid">
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </DockPanel>
        }
      >
        <DockItem value="color" aria-label="Color">
          <IconPalette aria-hidden="true" />
          <DockLabel>Color</DockLabel>
        </DockItem>
        <DockItem value="brush" aria-label="Brush" disabled>
          <IconBrush aria-hidden="true" />
          <DockLabel>Brush</DockLabel>
        </DockItem>
        <DockItem value="type" aria-label="Typography">
          <IconTypography aria-hidden="true" />
          <DockLabel>Typography</DockLabel>
        </DockItem>
      </Dock>
      <Button variant="outline">Done</Button>
    </div>
  );
}

export const PanelInteraction: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <ToolDock onOpenChange={args.onOpenChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const color = canvas.getByRole('button', { name: 'Color' });
    const type = canvas.getByRole('button', { name: 'Typography' });
    await userEvent.click(color);
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'Color' })).toBeVisible()
    );
    const bar = canvas
      .getByRole('toolbar', { name: 'Editor tools' })
      .getBoundingClientRect();
    await userEvent.click(type);
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'Typography' })).toBeVisible()
    );
    await expect(args.onOpenChange).not.toHaveBeenCalledWith(false);
    const after = canvas
      .getByRole('toolbar', { name: 'Editor tools' })
      .getBoundingClientRect();
    await expect(after.x).toBeCloseTo(bar.x, 0);
    await expect(after.y).toBeCloseTo(bar.y, 0);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(type).toHaveFocus());
    await expect(type).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(type);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close controls' })
    );
    await waitFor(() => expect(type).toHaveFocus());
    await userEvent.click(type);
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(canvas.getByRole('button', { name: 'Done' })).toHaveFocus();
    await expect(type).toHaveAttribute('aria-expanded', 'false');
  },
};

export const KeyboardAndDisabled: Story = {
  render: () => <ToolDock />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const color = canvas.getByRole('button', { name: 'Color' });
    const type = canvas.getByRole('button', { name: 'Typography' });
    await expect(canvas.getByRole('button', { name: 'Brush' })).toBeDisabled();
    await userEvent.tab();
    await expect(color).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(type).toHaveFocus();
    await expect(color).toHaveAttribute('aria-pressed', 'true');
    await expect(type).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'Typography' })).toBeVisible()
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(type).toHaveFocus());
    await userEvent.keyboard('{Home}');
    await expect(color).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'Color' })).toBeVisible()
    );
  },
};

export const NestedSelect: Story = {
  render: () => <ToolDock />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const color = canvas.getByRole('button', { name: 'Color' });
    await userEvent.click(color);
    const select = await canvas.findByRole('combobox', { name: 'Style' });
    await userEvent.click(select);
    await userEvent.click(await page.findByRole('option', { name: 'Outline' }));
    await expect(canvas.getByRole('dialog', { name: 'Color' })).toBeVisible();
    await expect(select).toHaveTextContent('Outline');
    await userEvent.click(select);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(select).toHaveFocus());
    await expect(canvas.getByRole('dialog', { name: 'Color' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(color).toHaveFocus());
    await expect(color).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Narrow: Story = {
  render: () => <ToolDock narrow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const color = canvas.getByRole('button', { name: 'Color' });
    await userEvent.click(color);
    const panel = await canvas.findByRole('dialog', { name: 'Color' });
    await waitFor(() => {
      const pill = color.getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      expect(bounds.width).toBeCloseTo(pill.width, 0);
      expect(bounds.left).toBeCloseTo(pill.left, 0);
      expect(bounds.top).toBeGreaterThanOrEqual(0);
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(color).toHaveFocus());
    await userEvent.keyboard('{End}{Enter}');
    await waitFor(() => {
      const bounds = canvas
        .getByRole('dialog', { name: 'Typography' })
        .getBoundingClientRect();
      const bar = canvas.getByRole('toolbar').getBoundingClientRect();
      expect(bounds.width).toBeGreaterThanOrEqual(224);
      expect(bounds.left).toBeGreaterThanOrEqual(bar.left);
      expect(bounds.right).toBeLessThanOrEqual(bar.right);
    });
  },
};

export const ControlledAndDataAttributes: Story = {
  args: {
    value: 'color',
    open: false,
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  render: (args) => (
    <Dock
      {...args}
      aria-label="Locked editor"
      data-editor="locked"
      panel={
        <DockPanel title="Color">
          <Input aria-label="Fill" />
        </DockPanel>
      }
    >
      <DockItem value="color" aria-label="Color">
        <IconPalette aria-hidden="true" />
        <DockLabel>Color</DockLabel>
      </DockItem>
      <DockItem value="type" aria-label="Typography">
        <IconTypography aria-hidden="true" />
        <DockLabel>Typography</DockLabel>
      </DockItem>
    </Dock>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Typography' }));
    await expect(args.onValueChange).toHaveBeenCalledWith('type');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByRole('button', { name: 'Color' })).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="dock"]')
    ).toHaveAttribute('data-editor', 'locked');
  },
};

export const AsChild: Story = {
  render: () => (
    <Dock value="color" onValueChange={fn()} aria-label="Canvas tools">
      <DockItem asChild value="color" aria-label="Color">
        <button type="button">
          <IconPalette aria-hidden="true" />
          <DockLabel>Color</DockLabel>
        </button>
      </DockItem>
    </Dock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await expect(canvas.getByRole('button')).toHaveAttribute(
      'data-slot',
      'dock-item'
    );
  },
};

export const MultipleDocks: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      <ToolDock />
      <ToolDock />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button', { name: 'Color' });
    const first = buttons[0];
    const second = buttons[1];
    if (!first || !second) throw new Error('Two docks are required.');
    await userEvent.click(first);
    const firstId = first.getAttribute('aria-controls');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(second);
    const secondId = second.getAttribute('aria-controls');
    await expect(firstId).not.toEqual(secondId);
    await expect(
      canvasElement.ownerDocument.getElementById(secondId ?? '')
    ).toHaveAttribute('role', 'dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(second).toHaveFocus());
  },
};

export const Empty: Story = {
  render: () => <Dock value="" onValueChange={fn()} aria-label="No tools" />,
};

export const ChangingLayout: Story = {
  render: function Example() {
    const [value, setValue] = React.useState('color');
    const [narrow, setNarrow] = React.useState(false);
    const [long, setLong] = React.useState(false);
    return (
      <div
        className="nx:flex nx:h-[80vh] nx:max-w-full nx:items-end"
        style={{ width: narrow ? 330 : 700 }}
      >
        <Dock
          value={value}
          onValueChange={setValue}
          aria-label="Resizable editor"
          panel={
            <DockPanel title="Appearance">
              <div className="nx:grid nx:gap-4">
                <Button onClick={() => setNarrow(!narrow)}>
                  Resize editor
                </Button>
                <Button onClick={() => setLong(!long)}>More settings</Button>
                {long &&
                  Array.from({ length: 12 }, (_, index) => (
                    <Input key={index} aria-label={`Setting ${index + 1}`} />
                  ))}
              </div>
            </DockPanel>
          }
        >
          <DockItem value="color" aria-label="A very long color tool name">
            <IconPalette aria-hidden="true" />
            <DockLabel>A very long color tool name</DockLabel>
          </DockItem>
          <DockItem value="type" aria-label="Typography">
            <IconTypography aria-hidden="true" />
            <DockLabel>Typography</DockLabel>
          </DockItem>
          <DockItem value="brush" aria-label="Brush">
            <IconBrush aria-hidden="true" />
            <DockLabel>Brush</DockLabel>
          </DockItem>
        </Dock>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('button', {
      name: 'A very long color tool name',
    });
    await userEvent.click(active);
    const top = canvas.getByRole('toolbar').getBoundingClientRect().top;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Resize editor' })
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'More settings' })
    );
    await waitFor(() => {
      const panel = canvas.getByRole('dialog').getBoundingClientRect();
      const pill = active.getBoundingClientRect();
      const surface = canvasElement
        .querySelector('[data-slot="dock-surface"]')
        ?.getBoundingClientRect();
      expect(panel.top).toBeGreaterThanOrEqual(0);
      expect(panel.width).toBeCloseTo(pill.width, 0);
      expect(panel.left).toBeCloseTo(pill.left, 0);
      expect(surface?.left).toBeCloseTo(pill.left, 0);
      expect(surface?.top).toBeCloseTo(panel.top, 0);
      expect(surface?.bottom).toBeCloseTo(pill.bottom, 0);
      expect(
        canvas.getByRole('toolbar').getBoundingClientRect().top
      ).toBeCloseTo(top, 0);
    });
  },
};

export const RemovedActiveTool: Story = {
  render: function Example() {
    const [value, setValue] = React.useState('color');
    const [available, setAvailable] = React.useState(true);
    return (
      <div className="nx:flex nx:min-h-96 nx:items-end">
        <Dock
          value={value}
          onValueChange={setValue}
          aria-label="Changing tools"
          panel={
            <DockPanel title="Color">
              <Button onClick={() => setAvailable(false)}>
                Remove Color tool
              </Button>
            </DockPanel>
          }
        >
          {available && (
            <DockItem value="color" aria-label="Color">
              <IconPalette aria-hidden="true" />
              <DockLabel>Color</DockLabel>
            </DockItem>
          )}
          <DockItem value="type" aria-label="Typography">
            <IconTypography aria-hidden="true" />
            <DockLabel>Typography</DockLabel>
          </DockItem>
        </Dock>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Color' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Color tool' })
    );
    await waitFor(() =>
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(
      canvas.queryByRole('button', { name: 'Color' })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Typography' }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible());
  },
};

export const ReducedMotion: Story = {
  ...WithPanel,
  tags: [],
  globals: { reduceMotion: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      <ToolDock />
      <ToolDock narrow />
    </div>
  ),
};

export const WithAppearanceProvider: Story = {
  globals: {
    theme: 'light',
    density: 'default',
    corners: 'subtle',
    elevation: 'quiet',
    stroke: 'normal',
    reduceMotion: false,
  },
  render: function Example() {
    const { state, setState } = useNxdsAppearance();
    const original = React.useRef(state);
    const [value, setValue] = React.useState('appearance');
    function applyAppearance() {
      setState({
        ...state,
        mode: 'dark',
        surfaceTone: 'slate',
        density: 'relaxed',
        corners: 'square',
        elevation: 'strong',
        stroke: 'strong',
        prefs: {
          ...state.prefs,
          uiFont: 'monospace',
          uiFontSize: 18,
          reduceMotion: true,
        },
      });
    }
    return (
      <div className="nx:flex nx:min-h-96 nx:items-end" style={{ width: 330 }}>
        <Dock
          value={value}
          onValueChange={setValue}
          aria-label="Appearance tools"
          panel={
            <DockPanel title="Appearance">
              <div className="nx:grid nx:gap-2">
                <Button onClick={applyAppearance}>Apply appearance</Button>
                <Button
                  variant="outline"
                  onClick={() => setState(original.current)}
                >
                  Restore appearance
                </Button>
              </div>
            </DockPanel>
          }
        >
          <DockItem value="dashboard" aria-label="Dashboard">
            <IconLayoutDashboard aria-hidden="true" />
            <DockLabel>Dashboard</DockLabel>
          </DockItem>
          <DockItem value="mail" aria-label="Mail">
            <IconMail aria-hidden="true" />
            <DockLabel>Mail</DockLabel>
          </DockItem>
          <DockItem value="brush" aria-label="Brush">
            <IconBrush aria-hidden="true" />
            <DockLabel>Brush</DockLabel>
          </DockItem>
          <DockItem value="appearance" aria-label="Appearance">
            <IconPalette aria-hidden="true" />
            <DockLabel>Appearance</DockLabel>
          </DockItem>
          <DockItem value="type" aria-label="Typography">
            <IconTypography aria-hidden="true" />
            <DockLabel>Typography</DockLabel>
          </DockItem>
        </Dock>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('button', {
      name: 'Appearance',
    });
    await userEvent.click(active);
    const panel = await canvas.findByRole('dialog', { name: 'Appearance' });
    const bar = canvas.getByRole('toolbar');
    const surface = canvasElement.querySelector('[data-slot="dock-surface"]')!;
    const before = {
      color: getComputedStyle(surface).backgroundColor,
      height: bar.getBoundingClientRect().height,
      shadow: getComputedStyle(surface).boxShadow,
      stroke: getComputedStyle(surface).borderTopWidth,
      font: getComputedStyle(active).fontFamily,
      size: getComputedStyle(active).fontSize,
    };
    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Apply appearance' })
      );
      await waitFor(() => {
        const face = getComputedStyle(surface);
        expect(face.backgroundColor).not.toBe(before.color);
        expect(face.borderTopLeftRadius).toBe('0px');
        expect(face.borderBottomLeftRadius).toBe('0px');
        expect(getComputedStyle(bar).borderTopLeftRadius).toBe('0px');
        expect(bar.getBoundingClientRect().height).not.toBe(before.height);
        expect(face.boxShadow).not.toBe(before.shadow);
        expect(face.borderTopWidth).not.toBe(before.stroke);
        expect(getComputedStyle(active).fontFamily).not.toBe(before.font);
        expect(getComputedStyle(active).fontSize).not.toBe(before.size);
        expect(parseFloat(face.transitionDuration)).toBeLessThan(0.001);
        expect(panel.getBoundingClientRect().width).toBeCloseTo(
          active.getBoundingClientRect().width,
          0
        );
        expect(panel.getBoundingClientRect().left).toBeCloseTo(
          active.getBoundingClientRect().left,
          0
        );
        expect(getComputedStyle(panel).fontFamily).toBe(
          getComputedStyle(active).fontFamily
        );
      });
      await expect(active).toHaveAttribute('aria-expanded', 'true');
      await expect(
        canvas.getByRole('button', { name: 'Apply appearance' })
      ).toHaveFocus();
      await waitFor(() => {
        const shape = surface.getBoundingClientRect();
        expect(panel.getBoundingClientRect().left).toBeGreaterThanOrEqual(
          bar.getBoundingClientRect().left
        );
        expect(panel.getBoundingClientRect().right).toBeLessThanOrEqual(
          bar.getBoundingClientRect().right
        );
        expect(shape.top).toBeCloseTo(panel.getBoundingClientRect().top, 0);
        expect(shape.bottom).toBeCloseTo(
          active.getBoundingClientRect().bottom,
          0
        );
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(active).toHaveAttribute('aria-expanded', 'false')
      );
      await expect(getComputedStyle(surface).borderRadius).toBe('0px');
      await userEvent.click(active);
      await waitFor(() =>
        expect(canvas.getByRole('dialog', { name: 'Appearance' })).toBeVisible()
      );
    } finally {
      if (!canvas.queryByRole('button', { name: 'Restore appearance' }))
        await userEvent.click(active);
      await userEvent.click(
        canvas.getByRole('button', { name: 'Restore appearance' })
      );
      await waitFor(() =>
        expect(getComputedStyle(surface).backgroundColor).toBe(before.color)
      );
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(active).toHaveFocus());
  },
};
