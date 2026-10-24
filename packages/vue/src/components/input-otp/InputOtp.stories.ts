import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, type Mock, userEvent, waitFor } from 'storybook/test';
import { ref } from 'vue';

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '.';

type InputOTPArgs = InstanceType<typeof InputOTP>['$props'] & {
  'aria-label'?: string;
  'onUpdate:modelValue'?: Mock<(value: string[]) => void>;
  onComplete?: Mock<(value: string[]) => void>;
};

const SixDigitSlots = {
  components: { InputOTPGroup, InputOTPSlot },
  template: `
    <InputOTPGroup>
      <InputOTPSlot v-for="index in 6" :key="index" :index="index - 1" />
    </InputOTPGroup>
  `,
};

function slotsIn(scene: HTMLElement) {
  return Array.from(
    scene.querySelectorAll<HTMLInputElement>('[data-slot="input-otp-slot"]')
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

async function expectActiveSlotRing({
  slots,
  index,
  restLefts,
  restBorderColor,
}: {
  slots: HTMLElement[];
  index: number;
  restLefts: number[];
  restBorderColor: string;
}) {
  await waitFor(() =>
    expect(slots.findIndex((slot) => slot.dataset.active === 'true')).toBe(
      index
    )
  );

  const styles = getComputedStyle(slots[index]!);

  await expect(styles.borderLeftColor).not.toBe(restBorderColor);
  await expect(styles.borderLeftColor).toBe(styles.borderTopColor);
  await expect(styles.outlineStyle).toBe('solid');

  await expect(slotLefts(slots)).toEqual(restLefts);
}

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'InputOTP collects a one-time code, with one slot per character. Use it for verification and sign-in codes. For other short text, use Input.',
      },
    },
  },
  args: {
    'aria-label': 'One-time password',
    'onUpdate:modelValue': fn(),
    onComplete: fn(),
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Prevents input.',
    },
  },
  render: (args) => ({
    components: { InputOTP, SixDigitSlots },
    setup: () => ({ args }),
    template: '<InputOTP v-bind="args"><SixDigitSlots /></InputOTP>',
  }),
} satisfies Meta<InputOTPArgs>;

export default meta;
type Story = StoryObj<InputOTPArgs>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSlot },
    template: `
      <InputOTP aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
};

export const WithSeparator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Split a six-digit code into two groups of three with a separator.',
      },
    },
  },
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot },
    template: `
      <InputOTP aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Dim every slot and block input while the field is disabled.',
      },
    },
  },
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSlot },
    template: `
      <InputOTP disabled aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp-slot"]'
    );

    await expect(input).toBeDisabled();

    // A disabled OTP field dims its slots via the root's has-[:disabled] hook,
    // using a semantic boundary token at full opacity (not a fade).
    const slot = slotsIn(canvasElement)[0]!;
    // border-disabled derives the same value as border-default, so only the
    // class can prove the disabled token is wired.
    await expect(slot).toHaveClass(
      'nx:group-has-[:disabled]/input-otp:border-border-disabled'
    );
    await expect(
      Number.parseFloat(getComputedStyle(slot).borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(getComputedStyle(slot).boxShadow).toBe('none');
    await expect(getComputedStyle(slot).opacity).toBe('1');
  },
};

export const ActiveSlotRing: Story = {
  render: () => ({
    components: {
      InputOTP,
      InputOTPGroup,
      InputOTPSeparator,
      InputOTPSlot,
      SixDigitSlots,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div data-testid="joined">
          <InputOTP aria-label="One-time password">
            <SixDigitSlots />
          </InputOTP>
        </div>
        <div data-testid="split">
          <InputOTP aria-label="One-time password, split">
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot :index="3" />
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const testId of ['joined', 'split']) {
      const scene = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"]`
      )!;
      const input = scene.querySelector<HTMLInputElement>(
        'input[data-slot="input-otp-slot"]'
      )!;
      const slots = slotsIn(scene);
      const restLefts = slotLefts(slots);
      const restBorderColor = getComputedStyle(slots[0]!).borderLeftColor;

      await expectCollapsedWithinGroups(slots);

      await userEvent.click(input);
      await userEvent.keyboard('123');
      await expectActiveSlotRing({
        slots,
        index: 3,
        restLefts,
        restBorderColor,
      });

      await userEvent.keyboard('456');
      await expectActiveSlotRing({
        slots,
        index: 5,
        restLefts,
        restBorderColor,
      });
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
    const slots = slotsIn(canvasElement);

    await userEvent.click(slots[0]!);
    await userEvent.keyboard('123456');

    await expect(slots.map((slot) => slot.value).join('')).toBe('123456');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
    await expect(args.onComplete).toHaveBeenCalledWith([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
  },
};

export const Paste: Story = {
  play: async ({ canvasElement, args }) => {
    const slots = slotsIn(canvasElement);

    await userEvent.click(slots[0]!);
    await userEvent.paste('123456');

    await expect(slots.map((slot) => slot.value).join('')).toBe('123456');
    await expect(args.onComplete).toHaveBeenCalledWith([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp-slot"]'
    );
    await expect(input).toBeInTheDocument();
    // Each slot is its own <input> — every play-fn query depends on it.
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

// v-model holds one character per slot.
export const VModel: Story = {
  render: () => ({
    components: { InputOTP, SixDigitSlots },
    setup: () => ({ code: ref(['4', '2']) }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <InputOTP v-model="code" aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
        <output data-testid="code">{{ code.join('') }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const slots = slotsIn(canvasElement);
    const code = canvasElement.querySelector('[data-testid="code"]');

    await expect(slots[0]).toHaveValue('4');
    await expect(slots[1]).toHaveValue('2');
    await userEvent.click(slots[2]!);
    await userEvent.keyboard('7');
    await expect(code).toHaveTextContent('427');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: {
      InputOTP,
      InputOTPGroup,
      InputOTPSeparator,
      InputOTPSlot,
      SixDigitSlots,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <InputOTP aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
        <InputOTP aria-label="One-time password, split">
          <InputOTPGroup>
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
            <InputOTPSlot :index="2" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot :index="3" />
            <InputOTPSlot :index="4" />
            <InputOTPSlot :index="5" />
          </InputOTPGroup>
        </InputOTP>
        <InputOTP disabled aria-label="One-time password, disabled">
          <SixDigitSlots />
        </InputOTP>
      </div>
    `,
  }),
};
