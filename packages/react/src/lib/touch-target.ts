/**
 * Coarse-pointer hit-area overlay for atom-sized controls (Checkbox,
 * RadioGroupItem) — a `size-4` box whose visual size must stay dense on a fine
 * pointer while still clearing the WCAG 2.5.5 / Apple HIG 44px target on touch.
 *
 * The `::after` is absolutely positioned, so its containing block is the
 * control's **padding** box — `size-4` minus both borders, not `size-4`. The
 * inset therefore adds `2 × --nx-borderwidth-default` back; without it a 16px
 * control with a 1px stroke reserves 42px, and 40px on the thick-stroke
 * appearance. `max()` against `--nx-spacing-3_5` keeps the reservation from
 * shrinking below what any appearance density previously had.
 */
export const coarseTouchTargetClassName =
  'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-[max(var(--nx-spacing-3_5),calc((max(var(--nx-spacing-11),44px)-var(--nx-spacing-4)+2*var(--nx-borderwidth-default))/2))]';

/**
 * The same overlay without the `pointer-coarse:` gate, so a test browser — which
 * reports a fine pointer — can measure the geometry the gated class would
 * produce. Tailwind scans source text and cannot derive this from the class
 * above, so it is written out; `touch-target.test.ts` asserts the two stay in
 * sync. Not for production use.
 */
export const coarseTouchTargetProbeClassName =
  'nx:after:absolute nx:after:-inset-[max(var(--nx-spacing-3_5),calc((max(var(--nx-spacing-11),44px)-var(--nx-spacing-4)+2*var(--nx-borderwidth-default))/2))]';
