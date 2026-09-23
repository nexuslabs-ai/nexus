import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Checkbox } from '../checkbox';
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

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/**
 * Every field surface draws its boundary with a real border and completes the
 * focus ring with an `outline-default` outer edge — the same borderwidth token
 * the border reads, so a `[data-borderwidth]` swap moves both halves.
 * `expectedRestBorderColor` is transparent for `variant="borderless"` — the
 * border is still there, just invisible, which is what keeps the two variants
 * the same size.
 */
async function expectFieldFocusBoundary({
  surface,
  control,
  expectedRestBorderColor = 'opaque',
}: {
  surface: HTMLElement;
  control: HTMLElement;
  expectedRestBorderColor?: 'opaque' | 'transparent';
}) {
  const restStart = contentStart(surface);
  const restSurfaceStyles = getComputedStyle(surface);
  const restBorderColor = restSurfaceStyles.borderTopColor;

  await expect(
    Number.parseFloat(restSurfaceStyles.borderTopWidth)
  ).toBeGreaterThan(0);
  if (expectedRestBorderColor === 'transparent') {
    await expect(restBorderColor).toBe(TRANSPARENT);
  } else {
    await expect(restBorderColor).not.toBe(TRANSPARENT);
  }
  await expect(restSurfaceStyles.boxShadow).toBe('none');
  await expect(restSurfaceStyles.outlineStyle).toBe('none');

  await focusAsKeyboard(control);

  const focusSurfaceStyles = getComputedStyle(surface);

  await expect(
    Number.parseFloat(focusSurfaceStyles.borderTopWidth)
  ).toBeGreaterThan(0);
  await expect(focusSurfaceStyles.borderTopColor).not.toBe(TRANSPARENT);
  await expect(focusSurfaceStyles.borderTopColor).not.toBe(restBorderColor);
  await expect(focusSurfaceStyles.outlineStyle).toBe('solid');
  await expect(
    Number.parseFloat(focusSurfaceStyles.outlineWidth)
  ).toBeGreaterThan(0);
  await expect(focusSurfaceStyles.boxShadow).toBe('none');
  // Border width is identical at rest and on focus, so focus never reflows.
  await expect(contentStart(surface)).toBe(restStart);
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
      expectedRestBorderColor: 'transparent',
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

    // Focusing an empty OTP field makes its first slot the active one.
    await expectFieldFocusBoundary({
      surface: canvasElement.querySelector<HTMLElement>(
        '[data-slot="input-otp-slot"]'
      )!,
      control: canvasElement.querySelector<HTMLElement>(
        'input[data-slot="input-otp"]'
      )!,
    });
  },
};

/**
 * The error recipe adds two classes that nothing else exercises:
 * `aria-invalid:focus-visible:border-focus-error` recolours the border and
 * `aria-invalid:focus-visible:outline-focus-error` recolours the outline.
 */
export const FieldErrorFocusBoundaries: Story = {
  render: () => (
    <div className="nx:flex nx:w-[420px] nx:flex-col nx:gap-3">
      <Input aria-label="Valid input" placeholder="Valid" />
      <Input aria-label="Invalid input" aria-invalid placeholder="Invalid" />
      <Textarea aria-label="Invalid textarea" aria-invalid />
      <NativeSelect aria-label="Invalid native select" aria-invalid>
        <NativeSelectOption value="free">Free</NativeSelectOption>
      </NativeSelect>
      <Select defaultValue="apple">
        <SelectTrigger aria-label="Invalid styled select" aria-invalid>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
      <InputGroup data-testid="error-input-group">
        <InputGroupInput
          aria-label="Invalid grouped input"
          aria-invalid
          placeholder="Email"
        />
      </InputGroup>
      <Input aria-label="Disabled input" disabled placeholder="Disabled" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const valid = canvas.getByRole('textbox', { name: 'Valid input' });
    const validBorder = getComputedStyle(valid).borderTopColor;

    // Capture the default focus ring from a control that is actually focused —
    // an unfocused outline resolves to `currentColor` and would compare equal
    // to nothing in particular.
    await focusAsKeyboard(valid);
    const validFocusOutline = getComputedStyle(valid).outlineColor;
    await expect(validFocusOutline).not.toBe(TRANSPARENT);

    async function expectErrorBoundary(
      surface: HTMLElement,
      control = surface
    ) {
      const restBorder = getComputedStyle(surface).borderTopColor;
      // Invalid at rest reads as an error stroke, not the default one.
      await expect(restBorder).not.toBe(validBorder);
      await expect(restBorder).not.toBe(TRANSPARENT);

      await focusAsKeyboard(control);

      const focusStyles = getComputedStyle(surface);
      await expect(focusStyles.borderTopColor).not.toBe(restBorder);
      await expect(focusStyles.outlineStyle).toBe('solid');
      await expect(focusStyles.outlineColor).not.toBe(TRANSPARENT);
      // The error ring is not the default focus ring.
      await expect(focusStyles.outlineColor).not.toBe(validFocusOutline);
    }

    await expectErrorBoundary(
      canvas.getByRole('textbox', { name: 'Invalid input' })
    );
    await expectErrorBoundary(
      canvas.getByRole('textbox', { name: 'Invalid textarea' })
    );
    await expectErrorBoundary(
      canvas.getByRole('combobox', { name: 'Invalid native select' })
    );
    await expectErrorBoundary(
      canvas.getByRole('combobox', { name: 'Invalid styled select' })
    );
    await expectErrorBoundary(
      canvas.getByTestId('error-input-group'),
      canvas.getByRole('textbox', { name: 'Invalid grouped input' })
    );

    const disabled = canvas.getByRole('textbox', { name: 'Disabled input' });
    const disabledStyles = getComputedStyle(disabled);
    await expect(
      Number.parseFloat(disabledStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(disabled).toHaveClass('nx:disabled:border-border-disabled');
  },
};

// Chromium snaps a sub-pixel border up to one device pixel, so `fine` (0.5px)
// measures anywhere in [0.5, 1] depending on dpr — true of every bordered
// component, not just fields. The whole-pixel modes are exact, and `strong`
// pinned at 2 is what proves the mode now reaches a field at all, which is the
// bug #726 set out to fix. The OTP slots' -ml overlap is not snapped like the
// border, so their spacing is only exact in the whole-pixel modes.
const BORDER_WIDTH_MODES = [
  { mode: 'fine', min: 0.5, max: 1, exactPixels: false },
  { mode: 'normal', min: 1, max: 1, exactPixels: true },
  { mode: 'strong', min: 2, max: 2, exactPixels: true },
] as const;

const BORDER_WIDTH_FIELDS = ['input', 'textarea', 'select'] as const;

async function expectOtpSlotsOverlapByBorder(scene: HTMLElement) {
  const slots = Array.from(
    scene.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]')
  );

  await expect(slots).toHaveLength(4);

  for (const [i, slot] of slots.slice(1).entries()) {
    const previous = slots[i]!;

    await expect(slot.getBoundingClientRect().left).toBeCloseTo(
      previous.getBoundingClientRect().right -
        Number.parseFloat(getComputedStyle(previous).borderRightWidth),
      1
    );
  }
}

/**
 * Bug 1 from #726: the boundary was a hardcoded 1px shadow, so the
 * `[data-borderwidth]` appearance mode moved `MultiSelectTrigger` and
 * `Sidebar` but left every real field behind. A real border tracks it, and so
 * does the focus ring's outer half — `outline-default` reads the same
 * borderwidth token as `border-default`.
 */
export const FieldBorderWidthModes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {BORDER_WIDTH_MODES.map(({ mode }) => (
        <div
          key={mode}
          data-borderwidth={mode}
          data-testid={`borderwidth-${mode}`}
          className="nx:flex nx:w-[420px] nx:flex-col nx:gap-3"
        >
          <Input aria-label={`${mode} input`} placeholder={mode} />
          <Textarea aria-label={`${mode} textarea`} />
          <Select defaultValue="apple">
            <SelectTrigger aria-label={`${mode} select`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
          </Select>
          <InputOTP maxLength={4} aria-label={`${mode} one-time password`}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { mode, min, max, exactPixels } of BORDER_WIDTH_MODES) {
      const modeScene = canvas.getByTestId(`borderwidth-${mode}`);
      const otpSlot = modeScene.querySelector<HTMLElement>(
        '[data-slot="input-otp-slot"]'
      )!;
      const otpWidth = Number.parseFloat(
        getComputedStyle(otpSlot).borderTopWidth
      );

      await expect(otpWidth).toBeGreaterThanOrEqual(min);
      await expect(otpWidth).toBeLessThanOrEqual(max);
      if (exactPixels) await expectOtpSlotsOverlapByBorder(modeScene);

      // Focusing the empty OTP input activates its first slot.
      await focusAsKeyboard(
        modeScene.querySelector<HTMLElement>('input[data-slot="input-otp"]')!
      );
      await expect(
        Number.parseFloat(getComputedStyle(otpSlot).outlineWidth)
      ).toBe(otpWidth);

      for (const label of BORDER_WIDTH_FIELDS) {
        const field = within(modeScene).getByRole(
          label === 'select' ? 'combobox' : 'textbox',
          {
            name: `${mode} ${label}`,
          }
        );

        const width = Number.parseFloat(getComputedStyle(field).borderTopWidth);

        await expect(width).toBeGreaterThanOrEqual(min);
        await expect(width).toBeLessThanOrEqual(max);

        // The ring's outer half reads the same token, so it lands on exactly
        // the border's width instead of a mode thickening only the inside of
        // the ring.
        await focusAsKeyboard(field);
        const outlineWidth = Number.parseFloat(
          getComputedStyle(field).outlineWidth
        );

        await expect(outlineWidth).toBe(width);
      }
    }
  },
};

/**
 * Tailwind's `transition-colors` expands to a list carrying `outline-color`, so
 * an element that paints a real ring fades it up from its resting colour over
 * the duration instead of landing it with the keypress. `transition-control`
 * and `transition-field` are the ring-safe replacements, generated from
 * `@nexus_ds/core`. They are asserted on the compiled `transition-property`
 * rather than the class name: if either `@utility` stopped emitting, the class
 * would resolve to nothing and the property would fall back to its `all`
 * initial value — which transitions the ring again, silently.
 */
export const RingSafeTransitions: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <Checkbox aria-label="control surface" />
      <Input aria-label="field surface" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'control surface' });
    const field = canvas.getByRole('textbox', { name: 'field surface' });

    // A control's border is its own decoration, so it may fade across states.
    await expect(getComputedStyle(control).transitionProperty).toBe(
      'color, background-color, border-color'
    );

    // A field's border is the ring's inner half — fading it would make focus a
    // two-stage change, so it is excluded for the same reason outline-color is.
    await expect(getComputedStyle(field).transitionProperty).toBe(
      'color, background-color'
    );
  },
};
