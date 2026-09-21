'use client';
import type * as React from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@nexus_ds/react';
const slideItems = [1, 2, 3, 4, 5].map((n) => (
  <CarouselItem key={n} aria-label={`Slide ${n} of 5`}>
    <div className="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default">
      <span className="nx:typography-heading-large nx:font-semibold">{n}</span>
    </div>
  </CarouselItem>
));
function Example0() {
  return (
    <Carousel className="nx:w-full" aria-label="Image carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
function Example1() {
  return (
    <Carousel className="nx:w-full" aria-label="All bases carousel">
      <CarouselContent>{slideItems}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
