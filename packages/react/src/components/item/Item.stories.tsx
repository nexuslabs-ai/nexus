import type { Meta, StoryObj } from '@storybook/react';
import { IconFile } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { Button } from '../button';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
};

export default meta;
type Story = StoryObj<typeof Item>;

// A gray thumbnail rendered without a network request.
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23999'/%3E%3C/svg%3E";

// A standard row: icon media, title + description, and a trailing action.
export const Default: Story = {
  render: () => (
    <Item variant="outline" className="nx:w-96">
      <ItemMedia variant="icon">
        <IconFile />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Report.pdf</ItemTitle>
        <ItemDescription>2.4 MB · edited 3 days ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </ItemActions>
    </Item>
  ),
};

// The three surface variants.
export const Variants: Story = {
  render: () => (
    <div className="nx:flex nx:w-96 nx:flex-col nx:gap-3">
      <Item variant="default">
        <ItemContent>
          <ItemTitle>Default</ItemTitle>
          <ItemDescription>Transparent, borderless.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outline</ItemTitle>
          <ItemDescription>Bordered surface.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted</ItemTitle>
          <ItemDescription>Filled surface.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

// Default vs the denser sm size.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-96 nx:flex-col nx:gap-3">
      <Item variant="outline" size="default">
        <ItemContent>
          <ItemTitle>Default size</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Small size</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
};

// The icon medallion and image thumbnail media variants.
export const Media: Story = {
  render: () => (
    <div className="nx:flex nx:w-96 nx:flex-col nx:gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IconFile />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Icon media</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="image">
          <img src={THUMB} alt="" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Image media</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const MediaImageHairline: Story = {
  render: () => (
    <Item>
      <ItemMedia variant="image">
        <img
          src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
          alt=""
        />
      </ItemMedia>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const media = canvasElement.querySelector('[data-slot="item-media"]');
    const image = canvasElement.querySelector('img');

    await expect(media).toHaveClass('nx:after:outline-black/10');
    await expect(media).toHaveClass('nx:dark:after:outline-white/10');
    await expect(media).toHaveClass('nx:after:-outline-offset-1');
    await expect(image).not.toHaveClass('nx:after:outline-black/10');
  },
};

// A grouped list divided by separators.
export const Grouped: Story = {
  render: () => (
    <ItemGroup className="nx:w-96">
      <Item>
        <ItemContent>
          <ItemTitle>First</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemContent>
          <ItemTitle>Second</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

// Item composes with a custom element via asChild — here a whole-row link.
export const AsChild: Story = {
  render: () => (
    <Item asChild variant="outline" className="nx:w-96">
      <a href="/files/report" data-testid="item-link">
        <ItemMedia variant="icon">
          <IconFile />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Open report</ItemTitle>
          <ItemDescription>Navigates to the file.</ItemDescription>
        </ItemContent>
      </a>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByTestId('item-link');
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'item');
  },
};

// Each structural part carries a data-slot; Item advertises its variant + size.
export const WithDataAttributes: Story = {
  render: () => (
    <Item variant="muted" size="sm" className="nx:w-96">
      <ItemMedia variant="icon">
        <IconFile />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Inspect me</ItemTitle>
        <ItemDescription>Hooks for styling and tests.</ItemDescription>
      </ItemContent>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('[data-slot="item"]');
    await expect(item).toBeInTheDocument();
    await expect(item).toHaveAttribute('data-variant', 'muted');
    await expect(item).toHaveAttribute('data-size', 'sm');
    for (const slot of [
      'item-media',
      'item-content',
      'item-title',
      'item-description',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A grouped list exercising the variants, sizes, and media types in one frame.
// Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-96 nx:flex-col nx:gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IconFile />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Report.pdf</ItemTitle>
          <ItemDescription>Outline · icon media · action</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted" size="sm">
        <ItemMedia variant="image">
          <img src={THUMB} alt="" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Cover.png</ItemTitle>
          <ItemDescription>Muted · sm · image media</ItemDescription>
        </ItemContent>
      </Item>
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Grouped row one</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Grouped row two</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};
