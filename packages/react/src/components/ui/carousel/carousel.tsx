import * as React from 'react';

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';

import { IconArrowLeft, IconArrowRight } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { Button } from '../button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

/**
 * CarouselProps
 *
 * `embla-carousel-react` is an optional peer dependency — install it in the
 * consuming app.
 */
type CarouselProps = {
  /** Embla options object (loop, align, dragFree, …). */
  opts?: CarouselOptions;
  /** Embla plugins (autoplay, wheel-gestures, …). */
  plugins?: CarouselPlugin;
  /**
   * Scroll axis.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** Receives the Embla API once initialised, for external control. */
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  orientation: NonNullable<CarouselProps['orientation']>;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const carouselControlClasses =
  'nx:absolute nx:rounded-full nx:after:absolute nx:after:-inset-2';

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

/**
 * Carousel
 *
 * Slideshow / horizontal (or vertical) scroller built on Embla. Compose with
 * `CarouselContent` + `CarouselItem`, and `CarouselPrevious` / `CarouselNext`
 * for the controls.
 *
 * Keyboard: a horizontal carousel scrolls with Left/Right arrows, a vertical
 * one with Up/Down (arrows for the other axis are ignored).
 *
 * Layout: the Previous / Next controls render just outside the content frame,
 * so give the carousel horizontal room (a `max-w-*` with auto margins, or
 * container padding) — otherwise they clip off-canvas at narrow / mobile widths.
 *
 * @example
 * ```tsx
 * // px-12 matches the controls' -left-12 / -right-12 offset so they don't clip.
 * <div className="nx:px-12">
 *   <Carousel className="nx:w-full" aria-label="Featured products">
 *     <CarouselContent>
 *       {items.map((item, index) => (
 *         <CarouselItem
 *           key={item.id}
 *           aria-label={`Slide ${index + 1} of ${items.length}`}
 *         >
 *           {item.title}
 *         </CarouselItem>
 *       ))}
 *     </CarouselContent>
 *     <CarouselPrevious />
 *     <CarouselNext />
 *   </Carousel>
 * </div>
 * ```
 */
function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isPrev =
      event.key === (orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp');
    const isNext =
      event.key === (orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
    if (!isPrev && !isNext) return;
    // Don't hijack arrow keys from a focused control that uses them itself.
    if (
      (event.target as HTMLElement).closest(
        'input, textarea, select, [contenteditable="true"]'
      )
    ) {
      return;
    }

    if (isPrev && !canScrollPrev) return;
    if (isNext && !canScrollNext) return;

    event.preventDefault();
    if (isPrev) scrollPrev();
    else scrollNext();
  };

  // Hand the Embla API to the consumer once it initialises.
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  // Sync the prev/next affordances to Embla's scroll position (external system).
  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('reInit', onSelect);
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  const contextValue = React.useMemo(
    () => ({
      carouselRef,
      orientation,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    }),
    [
      carouselRef,
      orientation,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    ]
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('nx:relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="nx:overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          'nx:flex',
          orientation === 'horizontal' ? 'nx:-ml-4' : 'nx:-mt-4 nx:flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'nx:min-w-0 nx:shrink-0 nx:grow-0 nx:basis-full',
        orientation === 'horizontal' ? 'nx:pl-4' : 'nx:pt-4',
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        carouselControlClasses,
        orientation === 'horizontal'
          ? 'nx:top-1/2 nx:-left-12 nx:-translate-y-1/2'
          : 'nx:-top-12 nx:left-1/2 nx:-translate-x-1/2 nx:rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <IconArrowLeft />
      <span className="nx:sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        carouselControlClasses,
        orientation === 'horizontal'
          ? 'nx:top-1/2 nx:-right-12 nx:-translate-y-1/2'
          : 'nx:-bottom-12 nx:left-1/2 nx:-translate-x-1/2 nx:rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <IconArrowRight />
      <span className="nx:sr-only">Next slide</span>
    </Button>
  );
}

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselProps,
};
