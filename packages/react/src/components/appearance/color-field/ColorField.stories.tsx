import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Button } from '../../button';

import {
  NexusAppearanceColorField,
  type NexusAppearanceColorFieldProps,
} from './color-field';

const BLUE = '#2563eb';
const RED = '#dc2626';

function ControlledField({
  value: initialValue,
  onChange,
  ...props
}: NexusAppearanceColorFieldProps) {
  const [value, setValue] = useState(initialValue);
  const changeColor = (color: string) => {
    setValue(color);
    onChange(color);
  };
  return (
    <NexusAppearanceColorField
      {...props}
      value={value}
      onChange={changeColor}
    />
  );
}

const meta: Meta<typeof NexusAppearanceColorField> = {
  title: 'Appearance/ColorField',
  component: NexusAppearanceColorField,
  args: { label: 'Accent color', value: BLUE, onChange: fn() },
  render: (args) => <ControlledField key={args.value} {...args} />,
};
export default meta;
type Story = StoryObj<typeof NexusAppearanceColorField>;

function fieldsIn(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  return {
    picker: canvas.getByLabelText('Accent color', { exact: true }),
    hex: canvas.getByRole('textbox', { name: 'Accent color hex value' }),
  };
}

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const { picker, hex } = fieldsIn(canvasElement);

    await expect(picker).toHaveValue(args.value);
    await expect(hex).toHaveValue(args.value);
    await expect(hex).toHaveAttribute('aria-invalid', 'false');
  },
};

export const TypedHex: Story = {
  play: async ({ canvasElement, args }) => {
    const { picker, hex } = fieldsIn(canvasElement);

    await userEvent.clear(hex);
    await userEvent.type(hex, 'DC2626');

    await expect(args.onChange).toHaveBeenLastCalledWith(RED);
    await expect(picker).toHaveValue(RED);
  },
};

export const InvalidDraft: Story = {
  play: async ({ canvasElement, args }) => {
    const { picker, hex } = fieldsIn(canvasElement);

    await userEvent.clear(hex);
    await userEvent.type(hex, '#12zz');

    await expect(hex).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(picker).toHaveValue(args.value);

    await userEvent.tab();
    await expect(hex).toHaveValue(args.value);
    await expect(hex).toHaveAttribute('aria-invalid', 'false');
  },
};

export const NativeColorPicker: Story = {
  play: async ({ canvasElement, args }) => {
    const { picker, hex } = fieldsIn(canvasElement);

    await fireEvent.input(picker, { target: { value: RED } });

    await expect(args.onChange).toHaveBeenCalledWith(RED);
    await expect(hex).toHaveValue(RED);
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const { picker, hex } = fieldsIn(canvasElement);

    await userEvent.tab();
    await expect(picker).toHaveFocus();
    await userEvent.tab();
    await expect(hex).toHaveFocus();
  },
};

function ExternallyChangedField(props: NexusAppearanceColorFieldProps) {
  const [value, setValue] = useState(props.value);
  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <NexusAppearanceColorField {...props} value={value} />
      <Button variant="outline" onClick={() => setValue(RED)}>
        Use red
      </Button>
    </div>
  );
}

export const ExternalValueChange: Story = {
  render: (args) => <ExternallyChangedField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { hex } = fieldsIn(canvasElement);

    await userEvent.clear(hex);
    await userEvent.type(hex, '#12');
    await expect(hex).toHaveValue('#12');
    await fireEvent.click(canvas.getByRole('button', { name: 'Use red' }));

    await expect(hex).toHaveFocus();
    await expect(hex).toHaveValue(RED);
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="appearance-color-field"]')
    ).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ControlledField {...args} label="Brand" value={BLUE} />
      <ControlledField {...args} label="Red" value={RED} />
      <ControlledField {...args} label="Unset" value="" />
    </div>
  ),
};
