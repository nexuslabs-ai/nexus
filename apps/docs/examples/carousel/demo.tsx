'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/carousel/carousel';

const slides = [1, 2, 3, 4, 5];

export default function CarouselDemo() {
  return (
    <div className="nx:w-full nx:max-w-xs nx:px-12">
      <Carousel className="nx:w-full" aria-label="Numbered slides">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem
              key={slide}
              aria-label={`Slide ${slide} of ${slides.length}`}
            >
              <div className="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default nx:typography-heading-large">
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
