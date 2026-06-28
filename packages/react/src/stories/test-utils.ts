import { expect, type within } from 'storybook/test';

const DEFAULT_CONTROL_SELECTOR =
  'button, input, [role="combobox"], [role="tab"]';

type Canvas = ReturnType<typeof within>;

/**
 * Pixel-rounded height of the single focusable control inside a host element
 * identified by `data-testid`. If the host element itself matches the selector
 * (e.g. `data-testid` placed directly on a `<button>`), measures the host;
 * otherwise looks for a single descendant match. Throws descriptively when no
 * control matches or when multiple controls match — both are story-shape bugs
 * that should fail loud, not silently use the first hit.
 */
export function getControlHeight(
  canvas: Canvas,
  testId: string,
  selector = DEFAULT_CONTROL_SELECTOR
): number {
  const host: HTMLElement = canvas.getByTestId(testId);
  if (host.matches(selector)) {
    return Math.round(host.getBoundingClientRect().height);
  }
  const controls = host.querySelectorAll<HTMLElement>(selector);
  if (controls.length > 1) {
    throw new Error(
      `Found ${controls.length} controls matching \`${selector}\` inside [data-testid="${testId}"] — measurement is ambiguous`
    );
  }
  const control = controls[0];
  if (!control) {
    throw new Error(
      `No control matching \`${selector}\` found inside [data-testid="${testId}"]`
    );
  }
  return Math.round(control.getBoundingClientRect().height);
}

type HeightMeasurementOptions = {
  selector?: string;
};

/**
 * Cascade-regression sentinel — asserts that a control rendered under two
 * different `data-style` mode scopes resolves to different heights, with the
 * first arg's height strictly less than the second. Pass the smaller-padding
 * mode first (e.g. `compact` before `spacious`). Pair-wise (not a 3-mode chain) so
 * designer retunes of any single mode do not break the test — only a broken
 * cascade does. Consumers in different components can pick different pairs
 * (`compact`+`spacious`, `compact`+`relaxed`, …) to spread coverage across the 7 modes.
 * Awaits `document.fonts.ready` so a loading web-font's fallback metrics
 * cannot collapse a one-pixel cascade difference into equality — a no-op under
 * the system-font stack, kept so a brand that re-aims to a web font stays
 * covered. The optional `selector` is
 * forwarded to `getControlHeight` so non-control elements (e.g. a Card root
 * `<div data-slot="card">`) can be measured.
 */
export async function expectModeCascadeWorks(
  canvas: Canvas,
  smallerModeTestId: string,
  largerModeTestId: string,
  { selector }: HeightMeasurementOptions = {}
): Promise<void> {
  await document.fonts.ready;
  const smaller = getControlHeight(canvas, smallerModeTestId, selector);
  const larger = getControlHeight(canvas, largerModeTestId, selector);
  expect(smaller).toBeLessThan(larger);
}

/**
 * Contract pin — asserts that a control rendered under a specific `data-style`
 * scope hits an exact pixel height. Awaits `document.fonts.ready` first; a
 * loading web-font's fallback metrics would skew the measurement (a no-op
 * under the system-font stack, kept for brands that re-aim to a web font). The
 * optional `selector` is
 * forwarded to `getControlHeight` so non-control elements (e.g. a Card root
 * `<div data-slot="card">`) can be measured.
 */
export async function expectHeightPinned(
  canvas: Canvas,
  testId: string,
  expectedPx: number,
  { selector }: HeightMeasurementOptions = {}
): Promise<void> {
  await document.fonts.ready;
  const actual = getControlHeight(canvas, testId, selector);
  expect(actual).toBe(expectedPx);
}

/**
 * Mode-invariance sentinel — asserts that a control rendered under multiple
 * `data-style` mode scopes resolves to the *same* canonical pixel height.
 *
 * Valid ONLY when the measured height derives from values that are identical
 * across the modes under test: a fixed px, the type line-height, or a *small*
 * spacing index density can't differentiate (`spacing-0_5` = 2px and
 * `spacing-1` = 4px are flat across every mode). That flatness is why Badge
 * and Tabs `sm` (both `py-1`) are genuinely mode-stable.
 *
 * This is NOT a general "numeric spacing doesn't move" check — it does. Larger
 * indices diverge per mode (`spacing-4` = 14/16/18 across compact/default/relaxed), so a
 * control padded with `nx:py-4` renders 48/52/56px. For a control whose height
 * *should* track density — the default for padded controls — use
 * `expectModeCascadeWorks`; pinning it here would assert a height the
 * spacing-mode system is designed to move.
 *
 * A failure from a deliberate change (e.g. a control migrates onto a future
 * `--chip-padding-*` family) is intent changing, not a regression — bump
 * `expectedPx` to the new canonical value. Awaits `document.fonts.ready` (Inter
 * fallback metrics would skew the measurement); `selector` is forwarded to
 * `getControlHeight` for non-control elements (e.g. a Badge `<span>`).
 */
export async function expectHeightFixedAcrossModes(
  canvas: Canvas,
  testIds: string[],
  expectedPx: number,
  { selector }: HeightMeasurementOptions = {}
): Promise<void> {
  await document.fonts.ready;
  for (const testId of testIds) {
    const actual = getControlHeight(canvas, testId, selector);
    expect(actual, `[data-testid="${testId}"] height`).toBe(expectedPx);
  }
}

/**
 * Per-mode height sentinel — the counterpart to `expectHeightFixedAcrossModes`
 * for controls whose height intentionally *varies* per `data-style` mode (fixed
 * `h-*` utilities backed by mode-scaled spacing tokens). Pass a `mode → expected
 * px` map; each control is located by `${testIdPrefix}-${mode}`. Awaits
 * `document.fonts.ready` so Inter fallback metrics cannot skew the measurement.
 * The optional `selector` is forwarded to `getControlHeight`.
 */
export async function expectHeightPerMode(
  canvas: Canvas,
  testIdPrefix: string,
  expectedByMode: Record<string, number>,
  { selector }: HeightMeasurementOptions = {}
): Promise<void> {
  await document.fonts.ready;
  for (const [mode, expectedPx] of Object.entries(expectedByMode)) {
    const actual = getControlHeight(
      canvas,
      `${testIdPrefix}-${mode}`,
      selector
    );
    expect(actual, `[data-testid="${testIdPrefix}-${mode}"] height`).toBe(
      expectedPx
    );
  }
}
