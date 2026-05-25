import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { Show } from './show';

const meta: Meta<typeof Show> = {
  title: 'Primitives/Show',
  component: Show,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Show>;

const box =
  'nx:rounded-md nx:border nx:border-border-default nx:p-3 nx:text-foreground';
const label = 'nx:text-muted-foreground nx:mb-1 nx:block';

// ============================================
// VISUAL
// ============================================

export const Default: Story = {
  render: () => (
    <Show above="lg" as="div">
      <div className={box}>
        Visible when the viewport is <strong>lg</strong> (≥ 64rem) or wider.
      </div>
    </Show>
  ),
};

export const AllAxes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div>
        <span className={label}>{'<Show above="lg">'} — viewport ≥ lg</span>
        <Show above="lg" as="div">
          <div className={box}>Shown on wide viewports.</div>
        </Show>
      </div>
      <div>
        <span className={label}>{'<Show below="lg">'} — viewport &lt; lg</span>
        <Show below="lg" as="div">
          <div className={box}>Shown on narrow viewports.</div>
        </Show>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border nx:border-border-default nx:p-2"
        style={{ width: 600 }}
      >
        <span className={label}>
          {'<Show containerAbove="md">'} — this 600px container ≥ md
        </span>
        <Show containerAbove="md" as="div">
          <div className={box}>Shown because the container is wide.</div>
        </Show>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border nx:border-border-default nx:p-2"
        style={{ width: 240 }}
      >
        <span className={label}>
          {'<Show containerBelow="md">'} — this 240px container &lt; md
        </span>
        <Show containerBelow="md" as="div">
          <div className={box}>Shown because the container is narrow.</div>
        </Show>
      </div>
    </div>
  ),
};

// ============================================
// INTERACTION / PLAY TESTS
// ============================================

export const ViewportAxis: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Show above="lg" as="div" data-testid="above">
        <div className={box}>above=&quot;lg&quot;</div>
      </Show>
      <Show below="lg" as="div" data-testid="below">
        <div className={box}>below=&quot;lg&quot;</div>
      </Show>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Deterministic at any viewport: assert the exact classes each axis resolves
    // to, covering both. The contents↔none toggle is exercised across a real
    // width boundary in ContainerAxis.
    expect(canvas.getByTestId('above')).toHaveClass(
      'nx:hidden',
      'nx:lg:contents'
    );
    expect(canvas.getByTestId('below')).toHaveClass(
      'nx:contents',
      'nx:lg:hidden'
    );
  },
};

export const ContainerAxis: Story = {
  render: () => (
    <div className="nx:flex nx:gap-4">
      <div className="nx:@container" style={{ width: 600 }} data-testid="wide">
        <Show containerAbove="md" as="div" data-testid="wide-above">
          <div className={box}>wide · containerAbove</div>
        </Show>
        <Show containerBelow="md" as="div" data-testid="wide-below">
          <div className={box}>wide · containerBelow</div>
        </Show>
      </div>
      <div
        className="nx:@container"
        style={{ width: 240 }}
        data-testid="narrow"
      >
        <Show containerAbove="md" as="div" data-testid="narrow-above">
          <div className={box}>narrow · containerAbove</div>
        </Show>
        <Show containerBelow="md" as="div" data-testid="narrow-below">
          <div className={box}>narrow · containerBelow</div>
        </Show>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // md container breakpoint = 28rem (448px): 600 ≥ md, 240 < md.
    await waitFor(() => {
      expect(getComputedStyle(canvas.getByTestId('wide-above')).display).toBe(
        'contents'
      );
      expect(getComputedStyle(canvas.getByTestId('wide-below')).display).toBe(
        'none'
      );
      expect(getComputedStyle(canvas.getByTestId('narrow-above')).display).toBe(
        'none'
      );
      expect(getComputedStyle(canvas.getByTestId('narrow-below')).display).toBe(
        'contents'
      );
    });
  },
};

// The #103 spike guarantee: a shown wrapper is `display: contents`, never
// `block`, so its child stays a real flex item — verified across a toggle.
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
          className="nx:rounded-md nx:border nx:border-border-default"
          style={{ width: 48, height: 48 }}
        />
        <Show containerAbove="md" data-testid="wrap">
          <div
            data-testid="item-b"
            className="nx:rounded-md nx:border nx:border-border-primary"
            style={{ width: 48, height: 48 }}
          />
        </Show>
        <div
          data-testid="item-c"
          className="nx:rounded-md nx:border nx:border-border-default"
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

    // ≥ md: wrapper is `contents`, so item-b is a real flex sibling of a and c.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: hidden.
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

export const DataAttributes: Story = {
  render: () => (
    <Show above="lg" data-testid="el">
      <span>content</span>
    </Show>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'show');
  },
};
