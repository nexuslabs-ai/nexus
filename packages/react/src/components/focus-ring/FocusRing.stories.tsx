import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Input } from '../input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '../input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../input-otp';
import { NativeSelect, NativeSelectOption } from '../native-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { SidebarInput } from '../sidebar';
import { Textarea } from '../textarea';

const meta: Meta = {
  title: 'Components/FocusRing',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function waitForFocusPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 250));
  });
}

function contentStart(element: HTMLElement) {
  const styles = getComputedStyle(element);

  return (
    Number.parseFloat(styles.borderLeftWidth) +
    Number.parseFloat(styles.paddingLeft)
  );
}

async function focusAsKeyboard(element: HTMLElement) {
  element.focus({ focusVisible: true } as FocusOptions);
  await waitForFocusPaint();
}

async function expectFieldFocusBoundary({
  surface,
  control,
  restHasStroke = true,
}: {
  surface: HTMLElement;
  control: HTMLElement;
  restHasStroke?: boolean;
}) {
  const restStart = contentStart(control);
  const restSurfaceStyles = getComputedStyle(surface);

  await expect(restSurfaceStyles.borderTopWidth).toBe('0px');
  if (restHasStroke) {
    await expect(restSurfaceStyles.boxShadow).not.toBe('none');
  } else {
    await expect(restSurfaceStyles.boxShadow).toBe('none');
  }

  await focusAsKeyboard(control);

  const focusSurfaceStyles = getComputedStyle(surface);

  await expect(focusSurfaceStyles.borderTopWidth).toBe('0px');
  await expect(focusSurfaceStyles.boxShadow).not.toBe('none');
  await expect(focusSurfaceStyles.boxShadow).toContain('inset');
  await expect(contentStart(control)).toBe(restStart);
}

export const FieldSurfaceFocusBoundaries: Story = {
  render: () => (
    <div className="nx:flex nx:w-[420px] nx:flex-col nx:gap-3">
      <Input aria-label="Default input" placeholder="Enter text..." />
      <Input
        aria-label="Borderless input"
        variant="borderless"
        placeholder="Borderless"
      />
      <SidebarInput aria-label="Sidebar input" placeholder="Search..." />
      <Textarea aria-label="Textarea" placeholder="Enter a message..." />
      <NativeSelect aria-label="Native select" defaultValue="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <Select defaultValue="apple">
        <SelectTrigger aria-label="Styled select">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
      <InputGroup data-testid="focus-ring-input-group">
        <InputGroupInput aria-label="Grouped input" placeholder="Email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-testid="focus-ring-textarea-group">
        <InputGroupAddon align="block-start">
          <InputGroupText>Bio</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="Grouped textarea" placeholder="Bio" />
      </InputGroup>
      <InputOTP maxLength={4} aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFieldFocusBoundary({
      surface: canvas.getByRole('textbox', { name: 'Default input' }),
      control: canvas.getByRole('textbox', { name: 'Default input' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByRole('textbox', { name: 'Borderless input' }),
      control: canvas.getByRole('textbox', { name: 'Borderless input' }),
      restHasStroke: false,
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByRole('textbox', { name: 'Sidebar input' }),
      control: canvas.getByRole('textbox', { name: 'Sidebar input' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByRole('textbox', { name: 'Textarea' }),
      control: canvas.getByRole('textbox', { name: 'Textarea' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByRole('combobox', { name: 'Native select' }),
      control: canvas.getByRole('combobox', { name: 'Native select' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByRole('combobox', { name: 'Styled select' }),
      control: canvas.getByRole('combobox', { name: 'Styled select' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByTestId('focus-ring-input-group'),
      control: canvas.getByRole('textbox', { name: 'Grouped input' }),
    });
    await expectFieldFocusBoundary({
      surface: canvas.getByTestId('focus-ring-textarea-group'),
      control: canvas.getByRole('textbox', { name: 'Grouped textarea' }),
    });

    const otpInput = canvasElement.querySelector<HTMLElement>(
      'input[data-slot="input-otp"]'
    )!;
    const firstSlot = canvasElement.querySelector<HTMLElement>(
      '[data-slot="input-otp-slot"]'
    )!;
    const restSlotShadow = getComputedStyle(firstSlot).boxShadow;

    await expect(getComputedStyle(firstSlot).borderTopWidth).toBe('0px');
    await expect(restSlotShadow).not.toBe('none');

    await userEvent.click(otpInput);
    await waitForFocusPaint();

    const activeSlot =
      canvasElement.querySelector<HTMLElement>(
        '[data-slot="input-otp-slot"][data-active="true"]'
      ) ?? firstSlot;
    const activeSlotStyles = getComputedStyle(activeSlot);

    await expect(activeSlotStyles.borderTopWidth).toBe('0px');
    await expect(activeSlotStyles.boxShadow).not.toBe('none');
    await expect(activeSlotStyles.boxShadow).toContain('inset');
  },
};
