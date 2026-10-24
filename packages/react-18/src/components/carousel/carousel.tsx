'use client';

import * as React from 'react';

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';

import { IconArrowLeft, IconArrowRight } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

/**
 * Props for Carousel. Install the optional `embla-carousel-react` peer dependency in your app.
 */
type CarouselProps = {
  /** Embla options, such as `loop`, `align` or `dragFree`. */
  opts?: CarouselOptions;
  /** Embla plugins, such as autoplay or wheel gestures. */
  plugins?: CarouselPlugin;
  /**
   * Scroll axis.
   */
  orientation?: 'horizontal' | 'vertical';
  /** Receives the Embla API after setup, for external control. */
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
 * Slideshow built on Embla that scrolls horizontally or vertically.
 * Put `CarouselItem`s in `CarouselContent`, and add `CarouselPrevious` and `CarouselNext`.
 * Arrow keys along the scroll axis move between slides.
 *
 * The Previous and Next buttons sit outside the frame. Leave horizontal room, such as padding, so they don't clip on narrow screens.
 */
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'> & CarouselProps>
>(function Carousel(propsWithoutRef, forwardedRef) {
  const {
    orientation = 'horizontal',
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'> & CarouselProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  // Read the prev/next affordances from Embla's scroll position (external system).
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on('reInit', onChange);
      api.on('select', onChange);
      return () => {
        api.off('reInit', onChange);
        api.off('select', onChange);
      };
    },
    [api]
  );
  const canScrollPrev = React.useSyncExternalStore(
    subscribe,
    () => api?.canScrollPrev() ?? false,
    () => false
  );
  const canScrollNext = React.useSyncExternalStore(
    subscribe,
    () => api?.canScrollNext() ?? false,
    () => false
  );

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
});

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function CarouselContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function CarouselItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<React.ComponentProps<typeof Button>>
>(function CarouselPrevious(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'outline',
    size = 'icon',
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<typeof Button>> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<React.ComponentProps<typeof Button>>
>(function CarouselNext(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'outline',
    size = 'icon',
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<typeof Button>> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselProps,
};
