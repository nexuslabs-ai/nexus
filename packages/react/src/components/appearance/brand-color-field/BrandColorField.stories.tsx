import { useState } from 'react';

import { DEFAULT_BRAND_COLOR } from '@nexus_ds/core';
import { BRAND_COLOR_PRESETS } from '@nexus_ds/core/palette';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Button } from '../../button';
import { NexusAppearanceSettingRow } from '../setting-row';

import {
  NexusAppearanceBrandColorField,
  type NexusAppearanceBrandColorFieldProps,
} from './brand-color-field';

const BLUE = BRAND_COLOR_PRESETS.find((preset) => preset.value === 'blue')!;
const INDIGO = BRAND_COLOR_PRESETS.find((preset) => preset.value === 'indigo')!;

function ControlledField({
  value: initialValue,
  onChange,
  ...props
}: NexusAppearanceBrandColorFieldProps) {
  const [value, setValue] = useState(initialValue);
  const changeColor = (color: string) => {
    setValue(color);
    onChange(color);
  };
  return (
    <NexusAppearanceBrandColorField
      {...props}
      value={value}
      onChange={changeColor}
    />
  );
}

const meta: Meta<typeof NexusAppearanceBrandColorField> = {
  title: 'Appearance/BrandColorField',
  component: NexusAppearanceBrandColorField,
  args: { label: 'Brand color', value: DEFAULT_BRAND_COLOR, onChange: fn() },
  render: (args) => <ControlledField key={args.value} {...args} />,
};
export default meta;
type Story = StoryObj<typeof NexusAppearanceBrandColorField>;

async function choosePreset(canvasElement: HTMLElement, label: string) {
  await userEvent.click(
    within(canvasElement).getByRole('combobox', { name: 'Brand color preset' })
  );
  const listbox = await within(document.body).findByRole('listbox');
  await userEvent.click(within(listbox).getByRole('option', { name: label }));
}

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toHaveTextContent('Default');
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(DEFAULT_BRAND_COLOR);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const PresetSelection: Story = {
  args: { value: '#123456' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const preset of BRAND_COLOR_PRESETS) {
      await choosePreset(canvasElement, preset.label);
      await expect(
        canvas.getByRole('combobox', { name: 'Brand color preset' })
      ).toHaveTextContent(preset.label);
      await expect(
        canvas.getByRole('textbox', { name: 'Brand color hex value' })
      ).toHaveValue(preset.color);
      await expect(args.onChange).toHaveBeenLastCalledWith(preset.color);
    }
  },
};

export const CustomAndNormalizedInput: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Brand color hex value',
    });
    const preset = canvas.getByRole('combobox', { name: 'Brand color preset' });
    await choosePreset(canvasElement, BLUE.label);
    await userEvent.clear(input);
    await userEvent.type(input, '12ABCD');
    await expect(input).toHaveValue('#12abcd');
    await expect(preset).toHaveTextContent('Custom');
    await expect(args.onChange).toHaveBeenLastCalledWith('#12abcd');
    await userEvent.clear(input);
    await userEvent.type(input, BLUE.color.slice(1).toUpperCase());
    await expect(preset).toHaveTextContent(BLUE.label);
    await expect(args.onChange).toHaveBeenLastCalledWith(BLUE.color);
    await choosePreset(canvasElement, 'Default');
    await expect(input).toHaveValue(DEFAULT_BRAND_COLOR);
  },
};

export const InvalidDraft: Story = {
  args: { value: BLUE.color },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Brand color hex value',
    });
    const preset = canvas.getByRole('combobox', { name: 'Brand color preset' });
    await userEvent.clear(input);
    await userEvent.type(input, 'invalid');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(preset).toHaveTextContent(BLUE.label);
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(input).toHaveValue(BLUE.color);

    await userEvent.clear(input);
    await userEvent.type(input, '#1234567');
    await expect(input).toHaveValue('#1234567');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(preset).toHaveTextContent('Custom');
    await expect(args.onChange).toHaveBeenLastCalledWith('#123456');
    await userEvent.tab();
    await expect(input).toHaveValue('#123456');
    await expect(input).toHaveAttribute('aria-invalid', 'false');
  },
};

export const NormalizedCommittedValue: Story = {
  args: { value: `  ${BLUE.color.toUpperCase()}  ` },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toHaveTextContent(BLUE.label);
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(args.value);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ExistingCssColor: Story = {
  args: { value: 'rgb(12 34 56)' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const preset = canvas.getByRole('combobox', { name: 'Brand color preset' });
    const input = canvas.getByRole('textbox', {
      name: 'Brand color hex value',
    });
    await expect(preset).toHaveTextContent('Custom');
    await expect(
      canvas.getByLabelText('Brand color', { exact: true })
    ).toHaveValue('#000000');
    await userEvent.click(input);
    await userEvent.tab();
    await expect(input).toHaveValue(args.value);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const NativeColorPicker: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fireEvent.input(
      canvas.getByLabelText('Brand color', { exact: true }),
      { target: { value: BLUE.color } }
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(BLUE.color);
    await expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toHaveTextContent(BLUE.label);
    await expect(args.onChange).toHaveBeenLastCalledWith(BLUE.color);
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preset = canvas.getByRole('combobox', { name: 'Brand color preset' });
    preset.focus();
    await userEvent.keyboard('{Enter}');
    await within(document.body).findByRole('listbox');
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    await expect(preset).toHaveTextContent(INDIGO.label);
    await expect(preset).toHaveFocus();
    await userEvent.tab();
    const picker = canvas.getByLabelText('Brand color', { exact: true });
    await expect(picker).toHaveFocus();
    const swatch = picker.nextElementSibling!;
    await expect(getComputedStyle(swatch).outlineStyle).toBe('solid');
    await expect(getComputedStyle(swatch).outlineWidth).toBe('2px');
    await userEvent.tab();
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveFocus();
  },
};

function ExternalReplacementExample() {
  const [value, setValue] = useState(BLUE.color);
  return (
    <div className="nx:space-y-3">
      <NexusAppearanceBrandColorField
        label="Brand color"
        value={value}
        onChange={setValue}
      />
      <Button onClick={() => setValue(DEFAULT_BRAND_COLOR)}>
        Restore default
      </Button>
    </div>
  );
}

export const ExternalValueReplacement: Story = {
  render: () => <ExternalReplacementExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Brand color hex value',
    });
    await userEvent.clear(input);
    await userEvent.type(input, 'invalid');
    await expect(input).toHaveFocus();
    // Dispatch only the click so replacement happens while the draft keeps focus.
    await fireEvent.click(
      canvas.getByRole('button', { name: 'Restore default' })
    );
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue(DEFAULT_BRAND_COLOR);
    await expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toHaveTextContent('Default');
    await expect(
      canvas.getByLabelText('Brand color', { exact: true })
    ).toHaveValue(DEFAULT_BRAND_COLOR);
  },
};

export const NarrowContainer: Story = {
  render: (args) => (
    <div data-testid="narrow-container" className="nx:w-60 nx:max-w-full">
      <NexusAppearanceSettingRow label="Brand color">
        <ControlledField {...args} />
      </NexusAppearanceSettingRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('narrow-container');
    await expect(container.scrollWidth).toBeLessThanOrEqual(
      container.clientWidth
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toBeVisible();
    await choosePreset(canvasElement, BLUE.label);
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(BLUE.color);
  },
};

export const WithDataAttributes: Story = {
  args: { className: 'nx:p-2' },
  render: (args) => <ControlledField {...args} data-testid="brand-field" />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByTestId('brand-field');
    await expect(field).toHaveAttribute(
      'data-slot',
      'appearance-brand-color-field'
    );
    await expect(field).toHaveClass('nx:p-2');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3 nx:p-4">
      {BRAND_COLOR_PRESETS.map((preset) => (
        <ControlledField
          key={preset.value}
          label={`${preset.label} brand`}
          value={preset.color}
          onChange={fn()}
        />
      ))}
      <ControlledField label="Custom brand" value="#95bf47" onChange={fn()} />
    </div>
  ),
};
