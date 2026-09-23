import type { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from '../components/button';
import { ButtonGroup } from '../components/button-group';
import { Input } from '../components/input';
import { Select, SelectTrigger, SelectValue } from '../components/select';

type RadiusStyle = CSSProperties & { '--nx-radius-base': string };

const pillRadius: RadiusStyle = { '--nx-radius-base': '9999px' };
const nestedRadius: RadiusStyle = { '--nx-radius-base': '24px' };

const meta = {
  title: 'Tokens/Radius overrides',
  parameters: {
    docs: {
      description: {
        component:
          'Scoped --nx-radius-base overrides currently affect Button. Input and SelectTrigger use --nx-radius-md. A nested data-radius preset replaces inherited values; an inline override wins over a preset on the same element. See theming/radius-overrides in Nexus docs.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScopeAndPrecedence: Story = {
  render: () => (
    <div data-radius="round" className="nx:grid nx:gap-4">
      <div style={pillRadius} className="nx:grid nx:gap-4">
        <Button variant="outline">Pill button</Button>
        <Input aria-label="Unchanged input" placeholder="Still round" />
        <Select>
          <SelectTrigger aria-label="Unchanged select">
            <SelectValue placeholder="Still round" />
          </SelectTrigger>
        </Select>
        <div>
          <Button variant="outline">Inherited pill</Button>
        </div>
        <div style={nestedRadius}>
          <Button variant="outline">Nested override</Button>
        </div>
        <div data-radius="smooth">
          <Button variant="outline">Nested preset</Button>
        </div>
        <div data-radius="round" style={pillRadius}>
          <Button variant="outline">Inline beats preset</Button>
          <Input aria-label="Preset medium" placeholder="Still round" />
        </div>
        <Button variant="outline" asChild>
          <a href="#radius-example">Composed pill link</a>
        </Button>
        <ButtonGroup aria-label="Horizontal joined buttons">
          <Button variant="outline">Horizontal first</Button>
          <Button variant="outline">Horizontal middle</Button>
          <Button variant="outline">Horizontal last</Button>
        </ButtonGroup>
        <ButtonGroup
          orientation="vertical"
          aria-label="Vertical joined buttons"
        >
          <Button variant="outline">Vertical first</Button>
          <Button variant="outline">Vertical middle</Button>
          <Button variant="outline">Vertical last</Button>
        </ButtonGroup>
      </div>
      <Button variant="outline">Outside override</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const uniform = (radius: string) => [radius, radius, radius, radius];
    function corners(element: HTMLElement) {
      const style = getComputedStyle(element);
      return [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ];
    }

    await expect(
      corners(canvas.getByRole('button', { name: 'Outside override' }))
    ).toEqual(uniform('12px'));
    for (const name of [
      'Pill button',
      'Inherited pill',
      'Inline beats preset',
    ]) {
      await expect(corners(canvas.getByRole('button', { name }))).toEqual(
        uniform('9999px')
      );
    }
    for (const name of ['Unchanged input', 'Preset medium']) {
      await expect(corners(canvas.getByRole('textbox', { name }))).toEqual(
        uniform('12px')
      );
    }
    await expect(corners(canvas.getByRole('combobox'))).toEqual(
      uniform('12px')
    );
    await expect(corners(canvas.getByRole('link'))).toEqual(uniform('9999px'));
    await expect(
      corners(canvas.getByRole('button', { name: 'Nested override' }))
    ).toEqual(uniform('24px'));
    await expect(
      corners(canvas.getByRole('button', { name: 'Nested preset' }))
    ).toEqual(uniform('8px'));

    const expectedEdges = [
      ['Horizontal first', ['9999px', '0px', '0px', '9999px']],
      ['Horizontal middle', ['0px', '0px', '0px', '0px']],
      ['Horizontal last', ['0px', '9999px', '9999px', '0px']],
      ['Vertical first', ['9999px', '9999px', '0px', '0px']],
      ['Vertical middle', ['0px', '0px', '0px', '0px']],
      ['Vertical last', ['0px', '0px', '9999px', '9999px']],
    ] as const;
    for (const [name, expected] of expectedEdges) {
      await expect(corners(canvas.getByRole('button', { name }))).toEqual(
        expected
      );
    }
  },
};
