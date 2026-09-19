/**
 * The box geometry the overlay below is calculated against. Both consumers use
 * it, so a control cannot silently move to a different size or stroke and leave
 * the reservation wrong.
 */
export const coarseTouchTargetBoxClassName = 'nx:size-4 nx:border-default';

/**
 * Coarse-pointer hit-area overlay for atom-sized controls (Checkbox,
 * RadioGroupItem) — a `size-4` box whose visual size must stay dense on a fine
 * pointer while still clearing the WCAG 2.5.5 / Apple HIG 44px target on touch.
 *
 * The `::after` is absolutely positioned, so its containing block is the
 * control's **padding** box — `size-4` minus both borders, not `size-4`. The
 * inset adds those borders back. It compensates the *used* border width, not
 * the declared one: the `fine` stroke declares `0.5px`, which every engine
 * rounds up to a used `1px`, so a bare `var(--nx-borderwidth-default)` returns
 * half of what the padding box actually lost and the target lands at 43px.
 *
 * `max()` against `--nx-spacing-3_5` keeps the reservation from shrinking below
 * what any appearance density previously had.
 */
export const coarseTouchTargetClassName =
  'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-[max(var(--nx-spacing-3_5),calc((max(var(--nx-spacing-11),44px)-var(--nx-spacing-4)+2*max(1px,var(--nx-borderwidth-default)))/2))]';

/**
 * The same overlay without the `pointer-coarse:` gate, so a test browser — which
 * reports a fine pointer — can measure the geometry the gated class would
 * produce. Tailwind scans source text and cannot derive this from the class
 * above, so it is written out; `touch-target.test.ts` asserts the two stay in
 * sync. Not for production use.
 */
export const coarseTouchTargetProbeClassName =
  'nx:after:absolute nx:after:-inset-[max(var(--nx-spacing-3_5),calc((max(var(--nx-spacing-11),44px)-var(--nx-spacing-4)+2*max(1px,var(--nx-borderwidth-default)))/2))]';
