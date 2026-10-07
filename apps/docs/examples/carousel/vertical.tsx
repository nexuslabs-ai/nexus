'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/carousel/carousel';

const slides = [1, 2, 3, 4, 5];

export default function CarouselVertical() {
  return (
    <div className="nx:w-full nx:max-w-xs nx:py-12">
      <Carousel
        orientation="vertical"
        className="nx:w-full"
        aria-label="Numbered slides"
      >
        <CarouselContent className="nx:h-48">
          {slides.map((slide) => (
            <CarouselItem
              key={slide}
              aria-label={`Slide ${slide} of ${slides.length}`}
            >
              <div className="nx:flex nx:h-full nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default nx:typography-heading-large">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
