import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { Hide } from './hide';

const meta: Meta<typeof Hide> = {
  title: 'Primitives/Hide',
  component: Hide,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Hide>;

const box =
  'nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground';
const label = 'nx:text-muted-foreground nx:mb-1 nx:block';

// ============================================
// VISUAL
// ============================================

export const Default: Story = {
  render: () => (
    <Hide above="lg" as="div">
      <div className={box}>
        Hidden when the viewport is <strong>lg</strong> (≥ 64rem) or wider —
        shown below it.
      </div>
    </Hide>
  ),
};

export const AllAxes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div>
        <span className={label}>
          {'<Hide above="lg">'} — hidden viewport ≥ lg
        </span>
        <Hide above="lg" as="div">
          <div className={box}>Hidden on wide viewports.</div>
        </Hide>
      </div>
      <div>
        <span className={label}>
          {'<Hide below="lg">'} — hidden viewport &lt; lg
        </span>
        <Hide below="lg" as="div">
          <div className={box}>Hidden on narrow viewports.</div>
        </Hide>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 600 }}
      >
        <span className={label}>
          {'<Hide containerAbove="md">'} — hidden in this 600px container
        </span>
        <Hide containerAbove="md" as="div">
          <div className={box}>Hidden because the container is wide.</div>
        </Hide>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 240 }}
      >
        <span className={label}>
          {'<Hide containerBelow="md">'} — hidden in this 240px container
        </span>
        <Hide containerBelow="md" as="div">
          <div className={box}>Hidden because the container is narrow.</div>
        </Hide>
      </div>
    </div>
  ),
};

// ============================================
// INTERACTION / PLAY TESTS  (inverse of <Show>)
// ============================================

export const ViewportAxis: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Hide above="lg" as="div" data-testid="above">
        <div className={box}>above=&quot;lg&quot;</div>
      </Hide>
      <Hide below="lg" as="div" data-testid="below">
        <div className={box}>below=&quot;lg&quot;</div>
      </Hide>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // <Hide> inverts <Show> (hide-above === show-below); assert the resolved
    // classes, deterministic at any viewport. Toggle is covered in ContainerAxis.
    expect(canvas.getByTestId('above')).toHaveClass(
      'nx:contents',
      'nx:lg:hidden'
    );
    expect(canvas.getByTestId('below')).toHaveClass(
      'nx:hidden',
      'nx:lg:contents'
    );
  },
};

export const ContainerAxis: Story = {
  render: () => (
    <div className="nx:flex nx:gap-4">
      <div className="nx:@container" style={{ width: 600 }} data-testid="wide">
        <Hide containerAbove="md" as="div" data-testid="wide-above">
          <div className={box}>wide · containerAbove</div>
        </Hide>
        <Hide containerBelow="md" as="div" data-testid="wide-below">
          <div className={box}>wide · containerBelow</div>
        </Hide>
      </div>
      <div
        className="nx:@container"
        style={{ width: 240 }}
        data-testid="narrow"
      >
        <Hide containerAbove="md" as="div" data-testid="narrow-above">
          <div className={box}>narrow · containerAbove</div>
        </Hide>
        <Hide containerBelow="md" as="div" data-testid="narrow-below">
          <div className={box}>narrow · containerBelow</div>
        </Hide>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Inverse of <Show>: 600 ≥ md, 240 < md.
    await waitFor(() => {
      expect(getComputedStyle(canvas.getByTestId('wide-above')).display).toBe(
        'none'
      );
      expect(getComputedStyle(canvas.getByTestId('wide-below')).display).toBe(
        'contents'
      );
      expect(getComputedStyle(canvas.getByTestId('narrow-above')).display).toBe(
        'contents'
      );
      expect(getComputedStyle(canvas.getByTestId('narrow-below')).display).toBe(
        'none'
      );
    });
  },
};

// Confirms the `display: contents` mechanism also holds for <Hide>'s shown
// state: <Hide containerBelow="md"> is shown at ≥ md, so its child is a flex item.
export const FlexParent: Story = {
  render: () => (
    <div
      className="nx:@container"
      style={{ width: 600 }}
      data-testid="container"
    >
      <div className="nx:flex nx:gap-4">
        <div
          data-testid="item-a"
          className="nx:rounded-md nx:border-default nx:border-border-default"
          style={{ width: 48, height: 48 }}
        />
        <Hide containerBelow="md" data-testid="wrap">
          <div
            data-testid="item-b"
            className="nx:rounded-md nx:border-default nx:border-border-primary"
            style={{ width: 48, height: 48 }}
          />
        </Hide>
        <div
          data-testid="item-c"
          className="nx:rounded-md nx:border-default nx:border-border-default"
          style={{ width: 48, height: 48 }}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const wrap = canvas.getByTestId('wrap');
    const rect = (id: string) => canvas.getByTestId(id).getBoundingClientRect();

    // ≥ md: containerBelow is shown -> `contents`, item-b is a real flex sibling.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: now hidden.
    container.style.width = '300px';
    await waitFor(() => expect(getComputedStyle(wrap).display).toBe('none'));

    // toggle back ≥ md: flex child again (contents), not block.
    container.style.width = '600px';
    await waitFor(() => {
      expect(getComputedStyle(wrap).display).toBe('contents');
      expect(rect('item-b').top).toBe(rect('item-a').top);
    });
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <Hide above="lg" data-testid="el">
      <span>content</span>
    </Hide>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'hide');
  },
};
