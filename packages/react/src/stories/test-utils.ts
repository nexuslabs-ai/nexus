import { expect, type within } from 'storybook/test';

const DEFAULT_CONTROL_SELECTOR =
  'button, input, [role="combobox"], [role="tab"]';

type Canvas = ReturnType<typeof within>;

/**
 * Pixel-rounded height of the first focusable control inside a host element
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
  const host = canvas.getByTestId(testId);
  if (host.matches(selector)) {
    return Math.round(host.getBoundingClientRect().height);
  }
  const controls = host.querySelectorAll(selector) as NodeListOf<HTMLElement>;
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

/**
 * Cascade-regression sentinel — asserts that a control rendered under two
 * different `data-style` mode scopes resolves to different heights. Pair-wise
 * (not a 3-mode chain) so designer retunes of any single mode do not break
 * the test — only a broken cascade does. Consumers in different components
 * can pick different pairs (`nova`+`sera`, `nova`+`maia`, …) to spread
 * coverage across the 7 modes.
 */
export function expectModeCascadeWorks(
  canvas: Canvas,
  smallerModeTestId: string,
  largerModeTestId: string
): void {
  const smaller = getControlHeight(canvas, smallerModeTestId);
  const larger = getControlHeight(canvas, largerModeTestId);
  expect(smaller).toBeLessThan(larger);
}

/**
 * Contract pin — asserts that a control rendered under a specific `data-style`
 * scope hits an exact pixel height. Awaits `document.fonts.ready` first; Inter
 * fallback metrics would skew the measurement.
 */
export async function expectHeightPinned(
  canvas: Canvas,
  testId: string,
  expectedPx: number
): Promise<void> {
  await document.fonts.ready;
  const actual = getControlHeight(canvas, testId);
  expect(actual).toBe(expectedPx);
}
