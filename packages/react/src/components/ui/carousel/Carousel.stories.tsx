import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  decorators: [
    (Story) => (
      <div className="nx:mx-auto nx:w-full nx:max-w-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

// Five numbered slides reused across stories.
const slideItems = [1, 2, 3, 4, 5].map((n) => (
  <CarouselItem key={n} aria-label={`Slide ${n} of 5`}>
    <div className="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border nx:border-border-default">
      <span className="nx:text-[2.25rem] nx:font-semibold">{n}</span>
    </div>
  </CarouselItem>
));

// A basic horizontal carousel.
export const Default: Story = {
  render: () => (
    <Carousel className="nx:w-full" aria-label="Image carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

// Vertical orientation — the content viewport needs an explicit height.
export const Vertical: Story = {
  render: () => (
    <Carousel
      orientation="vertical"
      className="nx:w-full"
      aria-label="Vertical carousel"
    >
      <CarouselContent className="nx:h-[350px]">{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

// Clicking Next enables Previous (the scroll-position state machine).
export const ClickInteraction: Story = {
  render: () => (
    <Carousel className="nx:w-full" aria-label="Click demo carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    // Previous is disabled at the first slide; wait for Embla to enable Next.
    await expect(prev).toBeDisabled();
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// Captures the Embla API so the play fn can read the carousel's position.
const keyboardApiRef: { current: CarouselApi } = { current: undefined };

// ArrowRight advances a horizontal carousel; ArrowDown is ignored (vertical-only).
export const KeyboardInteraction: Story = {
  render: () => (
    <Carousel
      className="nx:w-full"
      aria-label="Keyboard demo carousel"
      setApi={(api) => {
        keyboardApiRef.current = api;
      }}
    >
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());
    next.focus();
    // Horizontal carousel ignores ArrowDown — it must stay on the first slide.
    await userEvent.keyboard('{ArrowDown}');
    expect(keyboardApiRef.current?.selectedScrollSnap()).toBe(0);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// Vertical carousels use ArrowDown / ArrowUp instead of horizontal arrows.
export const VerticalKeyboardInteraction: Story = {
  render: () => (
    <Carousel
      orientation="vertical"
      className="nx:w-full"
      aria-label="Vertical keyboard demo carousel"
    >
      <CarouselContent className="nx:h-[350px]">{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());

    await expect(
      canvasElement.querySelector('[data-slot="carousel"]')
    ).toHaveAttribute('data-orientation', 'vertical');

    next.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// data-slot identifies the root, content, items, and both controls.
export const WithDataAttributes: Story = {
  render: () => (
    <Carousel className="nx:w-full" aria-label="Data attributes carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'carousel',
      'carousel-content',
      'carousel-item',
      'carousel-previous',
      'carousel-next',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    await expect(
      canvasElement.querySelector('[data-slot="carousel"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A horizontal carousel with outline controls. Reused by the per-base
// variant generator across 5 bases × 2 themes.
export const AllVariants: Story = {
  render: () => (
    <Carousel className="nx:w-full" aria-label="All bases carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
