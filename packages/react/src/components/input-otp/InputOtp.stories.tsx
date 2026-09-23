import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './input-otp';

function SixDigitSlots() {
  return (
    <InputOTPGroup>
      {Array.from({ length: 6 }, (_, i) => (
        <InputOTPSlot key={i} index={i} />
      ))}
    </InputOTPGroup>
  );
}

function slotsIn(scene: HTMLElement) {
  return Array.from(
    scene.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]')
  );
}

function slotLefts(slots: HTMLElement[]) {
  return slots.map((slot) => slot.getBoundingClientRect().left);
}

async function expectCollapsedWithinGroups(slots: HTMLElement[]) {
  for (const slot of slots) {
    const previous = slot.previousElementSibling;
    if (!previous) continue;

    await expect(slot.getBoundingClientRect().left).toBeCloseTo(
      previous.getBoundingClientRect().right -
        Number.parseFloat(getComputedStyle(previous).borderRightWidth),
      1
    );
  }
}

async function expectActiveSlotRing(
  slots: HTMLElement[],
  index: number,
  restLefts: number[],
  restBorderColor: string
) {
  await waitFor(() =>
    expect(slots.findIndex((slot) => slot.dataset.active === 'true')).toBe(
      index
    )
  );

  const styles = getComputedStyle(
    slots.find((slot) => slot.dataset.active === 'true')!
  );

  await expect(styles.borderLeftColor).not.toBe(restBorderColor);
  await expect(styles.borderLeftColor).toBe(styles.borderTopColor);
  await expect(styles.outlineStyle).toBe('solid');

  await expect(slotLefts(slots)).toEqual(restLefts);
}

const meta: Meta<typeof InputOTP> = {
  title: 'Components/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  args: {
    maxLength: 6,
    'aria-label': 'One-time password',
    onChange: fn(),
    onComplete: fn(),
  },
  argTypes: {
    maxLength: {
      control: 'number',
      description: 'Number of character slots',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
  },
  render: (args) => (
    <InputOTP {...args}>
      <SixDigitSlots />
    </InputOTP>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSeparator: Story = {
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const separator = canvasElement.querySelector(
      '[data-slot="input-otp-separator"]'
    );

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('aria-hidden', 'true');
    await expect(separator).not.toHaveAttribute('role');
    await expect(
      canvasElement.querySelectorAll('[data-slot="input-otp-group"]').length
    ).toBe(2);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );

    await expect(input).toBeDisabled();

    // A disabled OTP field dims its slots via the group's has-[:disabled] hook,
    // using a semantic boundary token at full opacity (not a fade).
    const slot = canvasElement.querySelector<HTMLElement>(
      '[data-slot="input-otp-slot"]'
    )!;
    await expect(
      Number.parseFloat(getComputedStyle(slot).borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(getComputedStyle(slot).boxShadow).toBe('none');
    await expect(getComputedStyle(slot).opacity).toBe('1');
  },
};

export const ClickInteraction: Story = {
  // input-otp overlays a single transparent <input> on top of the visual slots
  // (the slots carry pointer-events: none). That input is the interaction layer,
  // so all pointer/keyboard interaction targets it, not a slot.
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );

    await userEvent.click(input!);
    await expect(input).toHaveFocus();

    const slot = canvasElement.querySelector<HTMLElement>(
      '[data-slot="input-otp-slot"]'
    );
    const caret = canvasElement.querySelector<HTMLElement>(
      '[class~="nx:animate-caret-blink"]'
    );

    await expect(slot).toHaveClass('nx:duration-fast');
    await expect(caret).toHaveClass('nx:animate-caret-blink');
    await expect(caret).not.toHaveClass('nx:duration-1000');
  },
};

export const TransitionScoped: Story = {
  render: () => (
    <InputOTP maxLength={4} aria-label="One-time password">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('[data-slot="input-otp-slot"]');

    await expect(slot).not.toHaveClass('nx:transition-all');
    await expect(slot).toHaveClass('nx:transition-field');
  },
};

export const ActiveSlotRing: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div data-testid="joined">
        <InputOTP maxLength={6} aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
      </div>
      <div data-testid="split">
        <InputOTP maxLength={6} aria-label="One-time password, split">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const testId of ['joined', 'split']) {
      const scene = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"]`
      )!;
      const input = scene.querySelector<HTMLInputElement>(
        'input[data-slot="input-otp"]'
      )!;
      const slots = slotsIn(scene);
      const restLefts = slotLefts(slots);
      const restBorderColor = getComputedStyle(slots[0]!).borderLeftColor;

      await expectCollapsedWithinGroups(slots);

      await userEvent.click(input);
      await userEvent.keyboard('123');
      await expectActiveSlotRing(slots, 3, restLefts, restBorderColor);

      await userEvent.keyboard('456');
      await expectActiveSlotRing(slots, 5, restLefts, restBorderColor);
    }

    const split = slotsIn(
      canvasElement.querySelector<HTMLElement>('[data-testid="split"]')!
    );

    await expect(split[3]!.getBoundingClientRect().left).toBeGreaterThan(
      split[2]!.getBoundingClientRect().right
    );
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );

    await userEvent.click(input!);
    await userEvent.keyboard('123456');

    await expect(input).toHaveValue('123456');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Paste: Story = {
  play: async ({ canvasElement, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );

    await userEvent.click(input!);
    await userEvent.paste('123456');

    await expect(input).toHaveValue('123456');
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const CompleteCallback: Story = {
  play: async ({ canvasElement, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );

    await userEvent.click(input!);
    await userEvent.keyboard('123456');

    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp"]'
    );
    await expect(input).toBeInTheDocument();
    // The data-slot must land on the <input> — every play-fn query depends on it.
    await expect(input?.tagName).toBe('INPUT');
    await expect(input).toHaveAccessibleName(/one-time password/i);
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');

    const group = canvasElement.querySelector('[data-slot="input-otp-group"]');
    await expect(group).toBeInTheDocument();

    const slots = canvasElement.querySelectorAll(
      '[data-slot="input-otp-slot"]'
    );
    await expect(slots.length).toBe(6);
    await expect(slots[0]).toHaveClass('nx:bg-container');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <InputOTP maxLength={6} aria-label="One-time password">
        <SixDigitSlots />
      </InputOTP>
      <InputOTP maxLength={6} aria-label="One-time password, split">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <InputOTP maxLength={6} disabled aria-label="One-time password, disabled">
        <SixDigitSlots />
      </InputOTP>
    </div>
  ),
};
