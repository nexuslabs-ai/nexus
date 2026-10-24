/**
 * Shared internals for the `<Show>` / `<Hide>` responsive-visibility primitives.
 *
 * Visibility toggles between `display: contents` (shown) and `display: none`
 * (hidden) — never `display: block` / `revert`. A `contents` wrapper generates
 * no box of its own, so its children keep their natural flow: inline stays
 * inline, flex/grid children stay flex/grid items. Forcing `block` (or reverting
 * to the element's UA default) would override the wrapper's display and break
 * those layouts.
 *
 * Class strings are full static literals in the maps below: Tailwind only emits
 * a utility it can see as a complete string, so a computed `nx:${bp}:contents`
 * would never ship in the CSS bundle.
 *
 * Container axes use Tailwind's native `@container` scale (`@md` = 28rem), which
 * is smaller than the viewport scale (`md` = 48rem) — a component
 * reads as "md" at a narrower width than the whole viewport. The two axes
 * therefore resolve the same breakpoint name to different rem values.
 */

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Exactly one axis must be provided. The `never` siblings make the four axes
 * mutually exclusive at compile time (zero or two+ axes fail to typecheck).
 */
export type VisibilityAxis =
  | {
      above: Breakpoint;
      below?: never;
      containerAbove?: never;
      containerBelow?: never;
    }
  | {
      above?: never;
      below: Breakpoint;
      containerAbove?: never;
      containerBelow?: never;
    }
  | {
      above?: never;
      below?: never;
      containerAbove: Breakpoint;
      containerBelow?: never;
    }
  | {
      above?: never;
      below?: never;
      containerAbove?: never;
      containerBelow: Breakpoint;
    };

/** Loose shape the resolver works with. */
type AxisValues = {
  above?: Breakpoint;
  below?: Breakpoint;
  containerAbove?: Breakpoint;
  containerBelow?: Breakpoint;
};

// Shown = `contents`, hidden = `none`. Keyed by breakpoint; each value is a
// complete, statically-scannable class string (see header for why).
const VIEWPORT_ABOVE: Record<Breakpoint, string> = {
  sm: 'nx:hidden nx:sm:contents',
  md: 'nx:hidden nx:md:contents',
  lg: 'nx:hidden nx:lg:contents',
  xl: 'nx:hidden nx:xl:contents',
  '2xl': 'nx:hidden nx:2xl:contents',
};

const VIEWPORT_BELOW: Record<Breakpoint, string> = {
  sm: 'nx:contents nx:sm:hidden',
  md: 'nx:contents nx:md:hidden',
  lg: 'nx:contents nx:lg:hidden',
  xl: 'nx:contents nx:xl:hidden',
  '2xl': 'nx:contents nx:2xl:hidden',
};

const CONTAINER_ABOVE: Record<Breakpoint, string> = {
  sm: 'nx:hidden nx:@sm:contents',
  md: 'nx:hidden nx:@md:contents',
  lg: 'nx:hidden nx:@lg:contents',
  xl: 'nx:hidden nx:@xl:contents',
  '2xl': 'nx:hidden nx:@2xl:contents',
};

const CONTAINER_BELOW: Record<Breakpoint, string> = {
  sm: 'nx:contents nx:@sm:hidden',
  md: 'nx:contents nx:@md:hidden',
  lg: 'nx:contents nx:@lg:hidden',
  xl: 'nx:contents nx:@xl:hidden',
  '2xl': 'nx:contents nx:@2xl:hidden',
};

/**
 * Resolve the visibility class string for the one provided axis. `invert` swaps
 * show/hide so `<Hide>` is `<Show>` with the maps flipped (hide-above === show-below).
 */
export function visibilityClassName(
  { above, below, containerAbove, containerBelow }: AxisValues,
  invert: boolean
): string {
  if (above) return (invert ? VIEWPORT_BELOW : VIEWPORT_ABOVE)[above];
  if (below) return (invert ? VIEWPORT_ABOVE : VIEWPORT_BELOW)[below];
  if (containerAbove)
    return (invert ? CONTAINER_BELOW : CONTAINER_ABOVE)[containerAbove];
  if (containerBelow)
    return (invert ? CONTAINER_ABOVE : CONTAINER_BELOW)[containerBelow];
  return '';
}
