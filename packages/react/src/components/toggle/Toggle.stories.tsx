import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconBold, IconItalic } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Toggle, type ToggleProps } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
};

export default meta;
type Story = StoryObj<typeof Toggle>;

// A single two-state button.
export const Default: Story = {
  render: () => (
    <Toggle aria-label="Bold">
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'default');
    await expect(toggle).toHaveAttribute('data-size', 'default');
  },
};

// Borderless, bordered and transparent stroke-only variants.
export const Variants: Story = {
  render: () => (
    <div className="nx:flex nx:gap-3">
      <Toggle variant="default" aria-label="Bold">
        <IconBold />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <IconItalic />
      </Toggle>
      <Toggle
        variant="outline-primary"
        aria-label="Outline primary bold"
        defaultPressed
      >
        <IconBold />
      </Toggle>
    </div>
  ),
};

// The three sizes.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-3">
      <Toggle size="sm" aria-label="Small">
        <IconBold />
      </Toggle>
      <Toggle size="default" aria-label="Default">
        <IconBold />
      </Toggle>
      <Toggle size="lg" aria-label="Large">
        <IconBold />
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sm = canvas.getByRole('button', { name: 'Small' });
    const md = canvas.getByRole('button', { name: 'Default' });
    const lg = canvas.getByRole('button', { name: 'Large' });
    const rawTextXsClass = ['nx:text', 'xs'].join('-');
    const rawTextSmClass = ['nx:text', 'sm'].join('-');

    await expect(sm).toHaveClass('nx:typography-label-small');
    await expect(sm).not.toHaveClass(rawTextXsClass);
    await expect(sm).toHaveClass('nx:px-3', 'nx:py-1.5', 'nx:gap-1.5');

    await expect(md).toHaveClass('nx:typography-label-default');
    await expect(md).not.toHaveClass(rawTextSmClass);
    await expect(md).toHaveClass('nx:px-4', 'nx:py-2', 'nx:gap-2');
    await expect(lg).toHaveClass('nx:typography-label-default');
    await expect(lg).toHaveClass('nx:px-8', 'nx:py-3', 'nx:gap-2.5');
  },
};

// A toggle with text alongside the icon, shown pressed.
export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Bold" defaultPressed>
      <IconBold />
      Bold
    </Toggle>
  ),
};

// Clicking toggles the pressed state and fires onPressedChange.
export const ClickInteraction: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Bold" onPressedChange={args.onPressedChange}>
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-state', 'off');
    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('data-state', 'on');
  },
};

// Enter/Space toggles when focused.
export const KeyboardInteraction: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Italic" onPressedChange={args.onPressedChange}>
      <IconItalic />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
  },
};

// A disabled toggle does not respond to clicks.
export const Disabled: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Bold" disabled onPressedChange={args.onPressedChange}>
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toBeDisabled();

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(toggle).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(toggle).opacity).toBe('1');

    // No click: a disabled toggle has pointer-events: none, which makes
    // userEvent.click throw. The disabled attribute is the sufficient signal.
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

// data-slot identifies the component; data-variant / data-size reflect props.
export const WithDataAttributes: Story = {
  render: () => (
    <Toggle aria-label="Bold" variant="outline" size="sm">
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'outline');
    await expect(toggle).toHaveAttribute('data-size', 'sm');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Variants × on/off states, then the three sizes. Reused by the per-base
// variant generator. The pressed (on) row exercises the data-[state=on] fill.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle aria-label="Default off">
          <IconBold />
        </Toggle>
        <Toggle aria-label="Default on" defaultPressed>
          <IconBold />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline off">
          <IconItalic />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline on" defaultPressed>
          <IconItalic />
        </Toggle>
        <Toggle variant="outline-primary" aria-label="Outline primary off">
          <IconBold />
        </Toggle>
        <Toggle
          variant="outline-primary"
          aria-label="Outline primary on"
          defaultPressed
        >
          <IconBold />
        </Toggle>
      </div>
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle size="sm" aria-label="Small">
          <IconBold />
        </Toggle>
        <Toggle size="default" aria-label="Medium">
          <IconBold />
        </Toggle>
        <Toggle size="lg" aria-label="Large">
          <IconBold />
        </Toggle>
      </div>
    </div>
  ),
};

const VARIANTS = ['default', 'outline', 'outline-primary'] as const;
const SIZES = ['sm', 'default', 'lg'] as const;

function tokenColor(element: Element, name: string) {
  return getComputedStyle(element)
    .getPropertyValue(`--nx-color-${name}`)
    .trim();
}

export const StateMatrix: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <p id="toggle-state-error">
        Invalid formatting is not supported in this field.
      </p>
      {VARIANTS.flatMap((variant) =>
        SIZES.map((size) => (
          <div
            key={`${variant}-${size}`}
            className="nx:flex nx:flex-wrap nx:gap-4"
          >
            {[false, true].flatMap((pressed) =>
              [false, true].flatMap((disabled) =>
                [false, true].map((invalid) => {
                  const name = `${variant} ${size} ${pressed ? 'on' : 'off'} ${disabled ? 'disabled' : 'enabled'} ${invalid ? 'invalid' : 'valid'}`;
                  return (
                    <Toggle
                      key={name}
                      variant={variant}
                      size={size}
                      defaultPressed={pressed}
                      disabled={disabled}
                      aria-invalid={invalid}
                      aria-describedby={
                        invalid ? 'toggle-state-error' : undefined
                      }
                      aria-label={name}
                    >
                      <IconBold />
                      {size}
                    </Toggle>
                  );
                })
              )
            )}
          </div>
        ))
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const toggles = within(canvasElement).getAllByRole('button');
    await expect(toggles).toHaveLength(72);
    for (const toggle of toggles) {
      const style = getComputedStyle(toggle);
      const pressed = toggle.getAttribute('aria-pressed') === 'true';
      const disabled = toggle.hasAttribute('disabled');
      const invalid = toggle.getAttribute('aria-invalid') === 'true';
      await expect(toggle).toHaveAccessibleName();
      if (invalid) await expect(toggle).toHaveAccessibleDescription();
      if (toggle.dataset.variant === 'outline-primary') {
        const edge = getComputedStyle(toggle, '::before');
        await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await expect(style.borderTopWidth).toBe('0px');
        await expect(edge.pointerEvents).toBe('none');
        if (disabled) {
          // The value catches a selected/invalid rule leaking past its
          // not-disabled: gate; the class catches the disabled rule going away.
          await expect(
            edge.getPropertyValue('--tw-inset-ring-color').trim()
          ).toBe(tokenColor(toggle, 'border-disabled'));
          await expect(toggle).toHaveClass(
            'nx:disabled:before:inset-ring-border-disabled'
          );
        } else {
          await expect(
            edge.getPropertyValue('--tw-inset-ring-color').trim()
          ).toBe(
            tokenColor(
              toggle,
              invalid
                ? 'border-error'
                : pressed
                  ? 'border-primary-active'
                  : 'border-default'
            )
          );
        }
        if (pressed && !disabled) {
          await expect(edge.getPropertyValue('--tw-ring-color').trim()).toBe(
            tokenColor(
              toggle,
              invalid ? 'border-error-active' : 'border-primary-active'
            )
          );
        } else {
          await expect(edge.getPropertyValue('--tw-ring-shadow').trim()).toBe(
            '0 0 #0000'
          );
        }
      } else if (pressed && disabled) {
        await expect(style.backgroundColor).toBe(
          tokenColor(toggle, 'disabled')
        );
      }
      if (disabled) {
        await expect(style.color).toBe(
          tokenColor(toggle, 'disabled-foreground')
        );
        if (toggle.dataset.variant === 'outline') {
          await expect(style.borderTopColor).toBe(
            tokenColor(toggle, 'border-disabled')
          );
        }
      }
    }
  },
};

export const OutlinePrimary: Story = {
  args: { variant: 'outline-primary', onPressedChange: fn() },
  render: (args) => <Toggle {...args}>Bold</Toggle>,
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('button', { name: 'Bold' });
    const initial = toggle.getBoundingClientRect();
    await userEvent.hover(toggle);
    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(getComputedStyle(toggle).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(
      getComputedStyle(toggle, '::before')
        .getPropertyValue('--tw-inset-ring-color')
        .trim()
    ).toBe(tokenColor(toggle, 'border-primary-active'));
    await userEvent.unhover(toggle);
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(getComputedStyle(toggle).boxShadow).toContain('2px');
    await expect(getComputedStyle(toggle, '::before').boxShadow).not.toBe(
      'none'
    );
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const final = toggle.getBoundingClientRect();
    await expect([final.width, final.height]).toEqual([
      initial.width,
      initial.height,
    ]);
  },
};

export const InvalidOutlinePrimary: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <p id="toggle-invalid-error">This formatting is not supported.</p>
      {[false, true].map((pressed) => (
        <Toggle
          key={String(pressed)}
          variant="outline-primary"
          defaultPressed={pressed}
          aria-invalid
          aria-describedby="toggle-invalid-error"
        >
          {pressed ? 'Invalid selected' : 'Invalid resting'}
        </Toggle>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const toggle of within(canvasElement).getAllByRole('button')) {
      await userEvent.hover(toggle);
      await expect(
        getComputedStyle(toggle, '::before')
          .getPropertyValue('--tw-inset-ring-color')
          .trim()
      ).toBe(tokenColor(toggle, 'border-error'));
      await userEvent.unhover(toggle);
      await userEvent.tab();
      await expect(toggle).toHaveFocus();
      await expect(getComputedStyle(toggle).boxShadow).toContain(
        tokenColor(toggle, 'focus-error')
      );
    }
  },
};

function ControlledToggle(args: ToggleProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Toggle
      {...args}
      pressed={pressed}
      onPressedChange={(next) => {
        setPressed(next);
        args.onPressedChange?.(next);
      }}
    >
      Controlled bold
    </Toggle>
  );
}

export const Controlled: Story = {
  args: { variant: 'outline-primary', onPressedChange: fn() },
  render: (args) => <ControlledToggle {...args} />,
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Controlled bold',
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
  },
};

export const AsChild: Story = {
  render: () => (
    <Toggle asChild variant="outline-primary">
      <button type="button">Composed bold</button>
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Composed bold',
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(canvasElement.querySelectorAll('button')).toHaveLength(1);
  },
};

export const LongContent: Story = {
  render: () => (
    <Toggle variant="outline-primary">
      Apply formatting to all selected paragraphs
    </Toggle>
  ),
};
